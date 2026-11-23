<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rooms = [
            ['name' => 'Kamar 1', 'price' => 650000, 'size' => '3 × 3 m', 'floor' => 1, 'status' => 'kosong', 'facilities' => ['Kasur', 'Lemari', 'Kamar mandi dalam', 'Kipas angin'], 'has_ac' => false],
            ['name' => 'Kamar 2', 'price' => 850000, 'size' => '3 × 4 m', 'floor' => 1, 'status' => 'terisi', 'facilities' => ['Kasur', 'Lemari', 'Kamar mandi dalam', 'AC'], 'has_ac' => true],
            ['name' => 'Kamar 3', 'price' => 850000, 'size' => '3 × 4 m', 'floor' => 1, 'status' => 'terisi', 'facilities' => ['Kasur', 'Lemari', 'Meja belajar', 'Kamar mandi dalam', 'AC'], 'has_ac' => true],
            ['name' => 'Kamar 4', 'price' => 700000, 'size' => '3 × 3 m', 'floor' => 1, 'status' => 'terisi', 'facilities' => ['Kasur', 'Lemari', 'Kipas angin'], 'has_ac' => false],
            ['name' => 'Kamar 5', 'price' => 700000, 'size' => '3 × 3 m', 'floor' => 2, 'status' => 'kosong', 'facilities' => ['Kasur', 'Lemari', 'Meja belajar', 'Kipas angin'], 'has_ac' => false],
            ['name' => 'Kamar 6', 'price' => 900000, 'size' => '3,5 × 4 m', 'floor' => 2, 'status' => 'kosong', 'facilities' => ['Kasur', 'Lemari', 'Meja belajar', 'Kamar mandi dalam', 'AC'], 'has_ac' => true],
            ['name' => 'Kamar 7', 'price' => 650000, 'size' => '3 × 3 m', 'floor' => 2, 'status' => 'terisi', 'facilities' => ['Kasur', 'Lemari', 'Kipas angin'], 'has_ac' => false],
            ['name' => 'Kamar 8', 'price' => 750000, 'size' => '3 × 3,5 m', 'floor' => 2, 'status' => 'kosong', 'facilities' => ['Kasur', 'Lemari', 'Kamar mandi dalam', 'Kipas angin'], 'has_ac' => false],
        ];

        foreach ($rooms as $room) {
            Room::create($room);
        }
    }
}
