<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders')->restrictOnDelete();
            $table->foreignUuid('order_item_id')->constrained('order_items')->restrictOnDelete();
            $table->foreignUuid('ticket_category_id')->constrained('ticket_categories')->restrictOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->restrictOnDelete();
            $table->string('ticket_code', 64)->unique();
            $table->text('qr_payload');
            $table->string('status', 32)->default('valid'); // valid, used, revoked
            $table->timestamp('check_in_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['ticket_category_id', 'status']);
            $table->index('ticket_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
