<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Services\EventService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function __construct(
        protected EventService $eventService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search' => $request->query('search'),
            'category' => $request->query('category'),
            'status' => $request->query('status', 'published'),
            'start_date' => $request->query('start_date'),
            'end_date' => $request->query('end_date'),
        ];

        $perPage = (int) $request->query('per_page', 10);
        $events = $this->eventService->listEvents($filters, $perPage);

        return response()->json($events);
    }

    public function show(string $identifier): JsonResponse
    {
        // Support lookup by UUID or slug
        $event = $this->eventService->getEventBySlug($identifier);
        if (!$event) {
            $event = $this->eventService->getEventById($identifier);
        }

        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        return response()->json(['data' => $event]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:64',
            'banner_url' => 'nullable|string|url',
            'venue_name' => 'required|string|max:255',
            'venue_address' => 'required|string',
            'status' => 'nullable|in:draft,published,cancelled,completed',
            'start_time' => 'required|date|after:now',
            'end_time' => 'required|date|after:start_time',
            'ticket_categories' => 'nullable|array|min:1',
            'ticket_categories.*.name' => 'required|string|max:100',
            'ticket_categories.*.description' => 'nullable|string',
            'ticket_categories.*.price' => 'required|numeric|min:0',
            'ticket_categories.*.total_quota' => 'required|integer|min:1',
            'ticket_categories.*.sale_start_time' => 'nullable|date',
            'ticket_categories.*.sale_end_time' => 'nullable|date',
        ]);

        $user = $request->user();
        $event = $this->eventService->createEvent($validated, $user->id);

        return response()->json([
            'message' => 'Event created successfully',
            'data' => $event,
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $event = $this->eventService->getEventById($id);
        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $event->organizer_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized action'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'category' => 'sometimes|string|max:64',
            'banner_url' => 'nullable|string|url',
            'venue_name' => 'sometimes|string|max:255',
            'venue_address' => 'sometimes|string',
            'status' => 'sometimes|in:draft,published,cancelled,completed',
            'start_time' => 'sometimes|date',
            'end_time' => 'sometimes|date|after:start_time',
        ]);

        $updated = $this->eventService->updateEvent($event, $validated);

        return response()->json([
            'message' => 'Event updated successfully',
            'data' => $updated,
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $event = $this->eventService->getEventById($id);
        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $event->organizer_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized action'], 403);
        }

        $this->eventService->deleteEvent($event);

        return response()->json(['message' => 'Event deleted successfully']);
    }
}
