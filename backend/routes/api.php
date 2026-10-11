<?php

use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\EventController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::prefix('v1')->group(function () {
    // Authentication
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Public Event Discovery
    Route::get('/events', [EventController::class, 'index']);
    Route::get('/events/{identifier}', [EventController::class, 'show']);

    /*
    |--------------------------------------------------------------------------
    | Protected Routes (Sanctum)
    |--------------------------------------------------------------------------
    */
    Route::middleware('auth:sanctum')->group(function () {
        // Authenticated User Profile & Logout
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Organizer & Admin Event Management
        Route::post('/events', [EventController::class, 'store']);
        Route::put('/events/{id}', [EventController::class, 'update']);
        Route::delete('/events/{id}', [EventController::class, 'destroy']);

        // Booking & Ticket Operations
        Route::post('/bookings/reserve', [BookingController::class, 'reserve']);
        Route::post('/bookings/{orderId}/pay', [BookingController::class, 'mockPay']);
        Route::get('/orders', [BookingController::class, 'myOrders']);
        Route::get('/orders/{orderId}', [BookingController::class, 'orderDetail']);
        Route::get('/tickets', [BookingController::class, 'myTickets']);

        // Admin Dashboard
        Route::get('/admin/metrics', [AdminDashboardController::class, 'metrics']);
    });
});
