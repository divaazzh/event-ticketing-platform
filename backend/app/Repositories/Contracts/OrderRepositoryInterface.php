<?php

namespace App\Repositories\Contracts;

use App\Models\Order;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface OrderRepositoryInterface
{
    public function findById(string $id, array $with = []): ?Order;
    public function findByReference(string $reference, array $with = []): ?Order;
    public function getUserOrders(string $userId, int $perPage = 10): LengthAwarePaginator;
    public function create(array $data): Order;
    public function updateStatus(Order $order, string $status): bool;
    public function getTotalRevenue(): float;
    public function getSalesSummary(): array;
}
