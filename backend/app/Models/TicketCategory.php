<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TicketCategory extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'event_id',
        'name',
        'description',
        'price',
        'total_quota',
        'available_quota',
        'version',
        'sale_start_time',
        'sale_end_time',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'total_quota' => 'integer',
            'available_quota' => 'integer',
            'version' => 'integer',
            'sale_start_time' => 'datetime',
            'sale_end_time' => 'datetime',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'ticket_category_id');
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'ticket_category_id');
    }
}
