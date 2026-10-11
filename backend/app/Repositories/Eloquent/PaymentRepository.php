<?php

namespace App\Repositories\Eloquent;

use App\Models\Payment;
use App\Repositories\Contracts\PaymentRepositoryInterface;

class PaymentRepository implements PaymentRepositoryInterface
{
    public function findById(string $id): ?Payment
    {
        return Payment::find($id);
    }

    public function findByReference(string $reference): ?Payment
    {
        return Payment::where('transaction_reference', $reference)->first();
    }

    public function create(array $data): Payment
    {
        return Payment::create($data);
    }

    public function updateStatus(Payment $payment, string $status, ?array $payload = null): bool
    {
        $updateData = ['payment_status' => $status];
        if ($status === 'success') {
            $updateData['paid_at'] = now();
        }
        if ($payload !== null) {
            $updateData['payload'] = $payload;
        }
        return $payment->update($updateData);
    }
}
