<?php

namespace App\Repositories\Eloquent;

use App\Models\Ticket;
use App\Repositories\Contracts\TicketRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TicketRepository implements TicketRepositoryInterface
{
    public function findById(string $id, array $with = []): ?Ticket
    {
        $query = Ticket::query();
        if (!empty($with)) {
            $query->with($with);
        }
        return $query->find($id);
    }

    public function findByTicketCode(string $code, array $with = []): ?Ticket
    {
        $query = Ticket::query();
        if (!empty($with)) {
            $query->with($with);
        }
        return $query->where('ticket_code', $code)->first();
    }

    public function getUserTickets(string $userId, int $perPage = 10): LengthAwarePaginator
    {
        return Ticket::with(['order', 'ticketCategory.event', 'user'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function create(array $data): Ticket
    {
        return Ticket::create($data);
    }

    public function countTotalSold(): int
    {
        return Ticket::whereIn('status', ['valid', 'used'])->count();
    }

    public function updateStatus(Ticket $ticket, string $status): bool
    {
        $data = ['status' => $status];
        if ($status === 'used') {
            $data['check_in_at'] = now();
        }
        return $ticket->update($data);
    }
}
