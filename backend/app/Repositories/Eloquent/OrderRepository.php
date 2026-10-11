<?php

namespace App\Repositories\Eloquent;

use App\Models\Order;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class OrderRepository implements OrderRepositoryInterface
{
    public function findById(string $id, array $with = []): ?Order
    {
        $query = Order::query();
        if (!empty($with)) {
            $query->with($with);
        }
        return $query->find($id);
    }

    public function findByReference(string $reference, array $with = []): ?Order
    {
        $query = Order::query();
        if (!empty($with)) {
            $query->with($with);
        }
        return $query->where('order_reference', $reference)->first();
    }

    public function getUserOrders(string $userId, int $perPage = 10): LengthAwarePaginator
    {
        return Order::with(['items.ticketCategory.event', 'payments', 'tickets'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function create(array $data): Order
    {
        return Order::create($data);
    }

    public function updateStatus(Order $order, string $status): bool
    {
        return $order->update(['status' => $status]);
    }

    public function getTotalRevenue(): float
    {
        return (float) Order::where('status', 'paid')->sum('total_amount');
    }

    public function getSalesSummary(): array
    {
        $daily = Order::where('status', 'paid')
            ->selectRaw("strftime('%Y-%m-%d', created_at) as date, count(id) as total_orders, sum(total_amount) as total_amount")
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->limit(7)
            ->get()
            ->toArray();

        return [
            'daily_sales' => $daily,
            'paid_orders_count' => Order::where('status', 'paid')->count(),
            'pending_orders_count' => Order::where('status', 'pending')->count(),
            'cancelled_orders_count' => Order::where('status', 'cancelled')->count(),
        ];
    }
}
