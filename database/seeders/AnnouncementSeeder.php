<?php

namespace Database\Seeders;

use App\Models\Announcement;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $announcements = [
            ['title' => 'Pemadaman listrik Sabtu, 28 November', 'content' => 'PLN menjadwalkan pemadaman pukul 09.00 sampai 13.00. Mohon cas perangkat terlebih dahulu.'],
            ['title' => 'Jam tamu', 'content' => 'Tamu diperbolehkan berkunjung sampai pukul 21.00.'],
        ];

        foreach ($announcements as $announcement) {
            Announcement::create($announcement);
        }
    }
}
