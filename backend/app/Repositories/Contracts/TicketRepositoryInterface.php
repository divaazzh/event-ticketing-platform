<?php

namespace App\Repositories\Contracts;

use App\Models\Ticket;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface TicketRepositoryInterface
{
    public function findById(string $id, array $with = []): ?Ticket;
    public function findByTicketCode(string $code, array $with = []): ?Ticket;
    public function getUserTickets(string $userId, int $perPage = 10): LengthAwarePaginator;
    public function create(array $data): Ticket;
    public function countTotalSold(): int;
    public function updateStatus(Ticket $ticket, string $status): bool;
}
