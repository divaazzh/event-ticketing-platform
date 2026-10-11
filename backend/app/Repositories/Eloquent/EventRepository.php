<?php

namespace App\Repositories\Eloquent;

use App\Models\Event;
use App\Repositories\Contracts\EventRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EventRepository implements EventRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Event::query()->with(['ticketCategories', 'organizer']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('venue_name', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['start_date'])) {
            $query->where('start_time', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->where('end_time', '<=', $filters['end_date']);
        }

        $query->orderBy('start_time', 'asc');

        return $query->paginate($perPage);
    }

    public function findById(string $id, array $with = []): ?Event
    {
        $query = Event::query();
        if (!empty($with)) {
            $query->with($with);
        }
        return $query->find($id);
    }

    public function findBySlug(string $slug, array $with = []): ?Event
    {
        $query = Event::query();
        if (!empty($with)) {
            $query->with($with);
        }
        return $query->where('slug', $slug)->first();
    }

    public function create(array $data): Event
    {
        return Event::create($data);
    }

    public function update(Event $event, array $data): bool
    {
        return $event->update($data);
    }

    public function delete(Event $event): bool
    {
        return $event->delete();
    }

    public function countActiveEvents(): int
    {
        return Event::where('status', 'published')->count();
    }
}
