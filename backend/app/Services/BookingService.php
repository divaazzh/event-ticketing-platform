<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Ticket;
use App\Models\User;
use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use App\Repositories\Contracts\TicketCategoryRepositoryInterface;
use App\Repositories\Contracts\TicketRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class BookingService
{
    public function __construct(
        protected OrderRepositoryInterface $orderRepository,
        protected TicketCategoryRepositoryInterface $ticketCategoryRepository,
        protected PaymentRepositoryInterface $paymentRepository,
        protected TicketRepositoryInterface $ticketRepository
    ) {}

    /**
     * Create order reservation using pessimistic locking and optimistic version tracking.
     */
    public function createReservation(User $user, array $items): Order
    {
        return DB::transaction(function () use ($user, $items) {
            $totalAmount = '0.00';
            $orderItemsData = [];

            // Sort category IDs to avoid deadlocks across multiple rows
            usort($items, function ($a, $b) {
                return strcmp($a['ticket_category_id'], $b['ticket_category_id']);
            });

            foreach ($items as $item) {
                $categoryId = $item['ticket_category_id'];
                $quantity = (int) $item['quantity'];

                if ($quantity <= 0) {
                    throw new \InvalidArgumentException("Quantity must be greater than zero.");
                }

                // 1. Lock category row with lockForUpdate()
                $category = $this->ticketCategoryRepository->findByIdForUpdate($categoryId);

                if (!$category) {
                    throw new \RuntimeException("Ticket category not found: {$categoryId}");
                }

                if ($category->available_quota < $quantity) {
                    throw new \RuntimeException("Insufficient quota for category: {$category->name}. Available: {$category->available_quota}, Requested: {$quantity}");
                }

                // Check sale window
                $now = now();
                if ($now->lt($category->sale_start_time) || $now->gt($category->sale_end_time)) {
                    throw new \RuntimeException("Ticket sales are currently closed for category: {$category->name}");
                }

                // 2. Decrement available quota with version check (optimistic concurrency verify)
                $currentVersion = $category->version;
                $updated = $this->ticketCategoryRepository->decrementQuotaWithVersion($category->id, $quantity, $currentVersion);

                if (!$updated) {
                    throw new \RuntimeException("Concurrency conflict detected while reserving category: {$category->name}. Please try again.");
                }

                $subtotal = bcmul((string) $category->price, (string) $quantity, 2);
                $totalAmount = bcadd((string) $totalAmount, (string) $subtotal, 2);

                $orderItemsData[] = [
                    'ticket_category_id' => $category->id,
                    'quantity' => $quantity,
                    'unit_price' => $category->price,
                    'subtotal' => $subtotal,
                ];
            }

            // 3. Create pending Order
            $orderReference = 'ORD-' . strtoupper(now()->format('Ymd')) . '-' . strtoupper(Str::random(6));
            $order = $this->orderRepository->create([
                'user_id' => $user->id,
                'order_reference' => $orderReference,
                'status' => 'pending',
                'total_amount' => $totalAmount,
                'expires_at' => now()->addMinutes(15),
            ]);

            // 4. Create OrderItems
            foreach ($orderItemsData as $itemData) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'ticket_category_id' => $itemData['ticket_category_id'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'subtotal' => $itemData['subtotal'],
                ]);
            }

            return $this->orderRepository->findById($order->id, ['items.ticketCategory', 'user']);
        });
    }

    /**
     * Simulate or process payment for an order.
     */
    public function processMockPayment(Order $order, string $paymentMethod, bool $simulateSuccess = true): array
    {
        return DB::transaction(function () use ($order, $paymentMethod, $simulateSuccess) {
            // Re-fetch order with lock
            $order = Order::where('id', $order->id)->lockForUpdate()->first();

            if (!$order) {
                throw new \RuntimeException("Order not found.");
            }

            if ($order->status === 'paid') {
                throw new \RuntimeException("Order is already paid.");
            }

            if ($order->status === 'cancelled' || $order->status === 'expired') {
                throw new \RuntimeException("Cannot pay for an order with status {$order->status}.");
            }

            if (now()->gt($order->expires_at)) {
                $this->orderRepository->updateStatus($order, 'expired');
                // Restore quota
                foreach ($order->items as $item) {
                    $this->ticketCategoryRepository->incrementQuota($item->ticket_category_id, $item->quantity);
                }
                throw new \RuntimeException("Order has expired. Ticket quota has been released.");
            }

            $txRef = 'TX-' . strtoupper(now()->format('YmdHis')) . '-' . strtoupper(Str::random(6));

            if (!$simulateSuccess) {
                // Payment failed
                $payment = $this->paymentRepository->create([
                    'order_id' => $order->id,
                    'transaction_reference' => $txRef,
                    'payment_method' => $paymentMethod,
                    'payment_status' => 'failed',
                    'amount_paid' => $order->total_amount,
                    'payload' => ['reason' => 'Simulated card decline or gateway error'],
                ]);

                return [
                    'success' => false,
                    'order' => $order,
                    'payment' => $payment,
                    'tickets' => [],
                    'message' => 'Payment simulation failed.',
                ];
            }

            // Successful payment
            $payment = $this->paymentRepository->create([
                'order_id' => $order->id,
                'transaction_reference' => $txRef,
                'payment_method' => $paymentMethod,
                'payment_status' => 'success',
                'amount_paid' => $order->total_amount,
                'paid_at' => now(),
                'payload' => ['gateway' => 'mock_gateway', 'authorization' => 'AUTH-' . Str::random(8)],
            ]);

            $this->orderRepository->updateStatus($order, 'paid');

            // Emit tickets and generate QR codes
            $issuedTickets = [];
            $order->load(['items.ticketCategory']);

            foreach ($order->items as $item) {
                for ($i = 0; $i < $item->quantity; $i++) {
                    $ticketCode = 'TKT-' . strtoupper(Str::random(4)) . '-' . strtoupper(Str::random(4));
                    
                    // Generate verifiable QR code payload (Base64 SVG)
                    $qrString = json_encode([
                        'ticket_code' => $ticketCode,
                        'order_reference' => $order->order_reference,
                        'category_id' => $item->ticket_category_id,
                        'user_id' => $order->user_id,
                        'issued_at' => now()->toIso8601String(),
                    ]);

                    $qrSvg = base64_encode(QrCode::format('svg')->size(200)->generate($qrString));

                    $ticket = $this->ticketRepository->create([
                        'order_id' => $order->id,
                        'order_item_id' => $item->id,
                        'ticket_category_id' => $item->ticket_category_id,
                        'user_id' => $order->user_id,
                        'ticket_code' => $ticketCode,
                        'qr_payload' => $qrSvg,
                        'status' => 'valid',
                    ]);

                    $issuedTickets[] = $ticket;
                }
            }

            return [
                'success' => true,
                'order' => $this->orderRepository->findById($order->id, ['items.ticketCategory', 'payments', 'tickets']),
                'payment' => $payment,
                'tickets' => $issuedTickets,
                'message' => 'Payment processed and tickets issued successfully.',
            ];
        });
    }

    public function getUserTickets(string $userId, int $perPage = 10): LengthAwarePaginator
    {
        return $this->ticketRepository->getUserTickets($userId, $perPage);
    }

    public function getUserOrders(string $userId, int $perPage = 10): LengthAwarePaginator
    {
        return $this->orderRepository->getUserOrders($userId, $perPage);
    }
}
