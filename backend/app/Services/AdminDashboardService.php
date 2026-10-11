<?php

namespace App\Services;

use App\Repositories\Contracts\EventRepositoryInterface;
use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Repositories\Contracts\TicketRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;

class AdminDashboardService
{
    public function __construct(
        protected UserRepositoryInterface $userRepository,
        protected EventRepositoryInterface $eventRepository,
        protected OrderRepositoryInterface $orderRepository,
        protected TicketRepositoryInterface $ticketRepository
    ) {}

    public function getMetrics(): array
    {
        $totalRevenue = $this->orderRepository->getTotalRevenue();
        $totalTicketsSold = $this->ticketRepository->countTotalSold();
        $activeEvents = $this->eventRepository->countActiveEvents();
        $registeredUsers = $this->userRepository->countTotal();
        $salesSummary = $this->orderRepository->getSalesSummary();

        return [
            'total_revenue' => $totalRevenue,
            'total_tickets_sold' => $totalTicketsSold,
            'active_events' => $activeEvents,
            'registered_users' => $registeredUsers,
            'sales_chart' => $salesSummary['daily_sales'],
            'order_breakdown' => [
                'paid' => $salesSummary['paid_orders_count'],
                'pending' => $salesSummary['pending_orders_count'],
                'cancelled' => $salesSummary['cancelled_orders_count'],
            ],
        ];
    }
}
