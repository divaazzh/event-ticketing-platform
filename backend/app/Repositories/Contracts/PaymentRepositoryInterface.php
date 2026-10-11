<?php

namespace App\Repositories\Contracts;

use App\Models\Payment;

interface PaymentRepositoryInterface
{
    public function findById(string $id): ?Payment;
    public function findByReference(string $reference): ?Payment;
    public function create(array $data): Payment;
    public function updateStatus(Payment $payment, string $status, ?array $payload = null): bool;
}
