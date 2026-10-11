<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(
        protected BookingService $bookingService,
        protected OrderRepositoryInterface $orderRepository
    ) {}

    public function reserve(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.ticket_category_id' => 'required|uuid|exists:ticket_categories,id',
            'items.*.quantity' => 'required|integer|min:1|max:10',
        ]);

        try {
            $order = $this->bookingService->createReservation($request->user(), $validated['items']);

            return response()->json([
                'message' => 'Tickets held successfully. Please complete payment before expiration.',
                'data' => $order,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function mockPay(Request $request, string $orderId): JsonResponse
    {
        $validated = $request->validate([
            'payment_method' => 'required|string|in:credit_card,bank_transfer,qris,e_wallet',
            'simulate_success' => 'nullable|boolean',
        ]);

        $order = $this->orderRepository->findById($orderId, ['items']);
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $order->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized access to order'], 403);
        }

        $simulateSuccess = $validated['simulate_success'] ?? true;

        try {
            $result = $this->bookingService->processMockPayment(
                $order,
                $validated['payment_method'],
                $simulateSuccess
            );

            $status = $result['success'] ? 200 : 400;

            return response()->json($result, $status);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function myOrders(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $orders = $this->bookingService->getUserOrders($request->user()->id, $perPage);

        return response()->json($orders);
    }

    public function myTickets(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $tickets = $this->bookingService->getUserTickets($request->user()->id, $perPage);

        return response()->json($tickets);
    }

    public function orderDetail(Request $request, string $orderId): JsonResponse
    {
        $order = $this->orderRepository->findById($orderId, ['items.ticketCategory.event', 'payments', 'tickets']);
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $order->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized access to order'], 403);
        }

        return response()->json(['data' => $order]);
    }
}
