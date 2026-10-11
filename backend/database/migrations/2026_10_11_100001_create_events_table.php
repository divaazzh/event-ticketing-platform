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
        Schema::create('events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organizer_id')->constrained('users')->restrictOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('category', 64)->default('general');
            $table->string('banner_url', 512)->nullable();
            $table->string('venue_name');
            $table->text('venue_address');
            $table->string('status', 32)->default('draft'); // draft, published, cancelled, completed
            $table->timestamp('start_time');
            $table->timestamp('end_time');
            $table->timestamps();

            $table->index(['status', 'start_time']);
            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
