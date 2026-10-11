<?php

namespace App\Services;

use App\Models\Event;
use App\Models\TicketCategory;
use App\Repositories\Contracts\EventRepositoryInterface;
use App\Repositories\Contracts\TicketCategoryRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EventService
{
    public function __construct(
        protected EventRepositoryInterface $eventRepository,
        protected TicketCategoryRepositoryInterface $ticketCategoryRepository
    ) {}

    public function listEvents(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return $this->eventRepository->getPaginated($filters, $perPage);
    }

    public function getEventById(string $id): ?Event
    {
        return $this->eventRepository->findById($id, ['ticketCategories', 'organizer']);
    }

    public function getEventBySlug(string $slug): ?Event
    {
        return $this->eventRepository->findBySlug($slug, ['ticketCategories', 'organizer']);
    }

    public function createEvent(array $data, string $organizerId): Event
    {
        return DB::transaction(function () use ($data, $organizerId) {
            $baseSlug = Str::slug($data['title']);
            $slug = $baseSlug;
            $counter = 1;
            while ($this->eventRepository->findBySlug($slug)) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }

            $eventData = [
                'organizer_id' => $organizerId,
                'title' => $data['title'],
                'slug' => $slug,
                'description' => $data['description'] ?? null,
                'category' => $data['category'] ?? 'general',
                'banner_url' => $data['banner_url'] ?? null,
                'venue_name' => $data['venue_name'],
                'venue_address' => $data['venue_address'],
                'status' => $data['status'] ?? 'draft',
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
            ];

            $event = $this->eventRepository->create($eventData);

            if (!empty($data['ticket_categories']) && is_array($data['ticket_categories'])) {
                foreach ($data['ticket_categories'] as $category) {
                    $this->ticketCategoryRepository->create([
                        'event_id' => $event->id,
                        'name' => $category['name'],
                        'description' => $category['description'] ?? null,
                        'price' => $category['price'],
                        'total_quota' => $category['total_quota'],
                        'available_quota' => $category['total_quota'],
                        'version' => 0,
                        'sale_start_time' => $category['sale_start_time'] ?? $event->start_time->subDays(30),
                        'sale_end_time' => $category['sale_end_time'] ?? $event->start_time,
                    ]);
                }
            }

            return $this->eventRepository->findById($event->id, ['ticketCategories', 'organizer']);
        });
    }

    public function updateEvent(Event $event, array $data): Event
    {
        return DB::transaction(function () use ($event, $data) {
            if (!empty($data['title']) && $data['title'] !== $event->title) {
                $baseSlug = Str::slug($data['title']);
                $slug = $baseSlug;
                $counter = 1;
                while ($existing = $this->eventRepository->findBySlug($slug)) {
                    if ($existing->id === $event->id) {
                        break;
                    }
                    $slug = $baseSlug . '-' . $counter;
                    $counter++;
                }
                $data['slug'] = $slug;
            }

            $this->eventRepository->update($event, $data);

            return $this->eventRepository->findById($event->id, ['ticketCategories', 'organizer']);
        });
    }

    public function deleteEvent(Event $event): bool
    {
        return $this->eventRepository->delete($event);
    }
}
