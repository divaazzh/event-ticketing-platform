<?php

namespace App\Repositories\Contracts;

use App\Models\TicketCategory;
use Illuminate\Database\Eloquent\Collection;

interface TicketCategoryRepositoryInterface
{
    public function findById(string $id): ?TicketCategory;
    public function findByIdForUpdate(string $id): ?TicketCategory;
    public function findByEventId(string $eventId): Collection;
    public function create(array $data): TicketCategory;
    public function update(TicketCategory $ticketCategory, array $data): bool;
    public function decrementQuotaWithVersion(string $id, int $quantity, int $expectedVersion): bool;
    public function incrementQuota(string $id, int $quantity): bool;
}
