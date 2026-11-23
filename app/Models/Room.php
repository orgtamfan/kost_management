<?php

namespace App\Models;

use Database\Factories\RoomFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'price', 'size', 'floor', 'status', 'facilities', 'has_ac'])]
class Room extends Model
{
    /** @use HasFactory<RoomFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'facilities' => 'array',
            'has_ac' => 'boolean',
            'price' => 'integer',
            'floor' => 'integer',
        ];
    }

    /**
     * Get all tenants currently assigned to this room.
     */
    public function tenants(): HasMany
    {
        return $this->hasMany(Tenant::class);
    }
}
