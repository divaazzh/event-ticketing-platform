<?php

namespace App\Repositories\Contracts;

use App\Models\Event;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface EventRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator;
    public function findById(string $id, array $with = []): ?Event;
    public function findBySlug(string $slug, array $with = []): ?Event;
    public function create(array $data): Event;
    public function update(Event $event, array $data): bool;
    public function delete(Event $event): bool;
    public function countActiveEvents(): int;
}
