<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Repositories\Contracts\UserRepositoryInterface::class,
            \App\Repositories\Eloquent\UserRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\EventRepositoryInterface::class,
            \App\Repositories\Eloquent\EventRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\TicketCategoryRepositoryInterface::class,
            \App\Repositories\Eloquent\TicketCategoryRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\OrderRepositoryInterface::class,
            \App\Repositories\Eloquent\OrderRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\PaymentRepositoryInterface::class,
            \App\Repositories\Eloquent\PaymentRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\TicketRepositoryInterface::class,
            \App\Repositories\Eloquent\TicketRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
