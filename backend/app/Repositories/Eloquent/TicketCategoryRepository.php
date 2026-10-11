<?php

namespace App\Repositories\Eloquent;

use App\Models\TicketCategory;
use App\Repositories\Contracts\TicketCategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class TicketCategoryRepository implements TicketCategoryRepositoryInterface
{
    public function findById(string $id): ?TicketCategory
    {
        return TicketCategory::find($id);
    }

    public function findByIdForUpdate(string $id): ?TicketCategory
    {
        return TicketCategory::where('id', $id)->lockForUpdate()->first();
    }

    public function findByEventId(string $eventId): Collection
    {
        return TicketCategory::where('event_id', $eventId)->get();
    }

    public function create(array $data): TicketCategory
    {
        return TicketCategory::create($data);
    }

    public function update(TicketCategory $ticketCategory, array $data): bool
    {
        return $ticketCategory->update($data);
    }

    public function decrementQuotaWithVersion(string $id, int $quantity, int $expectedVersion): bool
    {
        $affected = TicketCategory::where('id', $id)
            ->where('version', $expectedVersion)
            ->where('available_quota', '>=', $quantity)
            ->update([
                'available_quota' => \DB::raw("available_quota - {$quantity}"),
                'version' => \DB::raw("version + 1"),
                'updated_at' => now(),
            ]);

        return $affected > 0;
    }

    public function incrementQuota(string $id, int $quantity): bool
    {
        $affected = TicketCategory::where('id', $id)
            ->update([
                'available_quota' => \DB::raw("available_quota + {$quantity}"),
                'version' => \DB::raw("version + 1"),
                'updated_at' => now(),
            ]);

        return $affected > 0;
    }
}
