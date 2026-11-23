<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Owner account
        User::create([
            'name' => 'Anwar',
            'email' => 'anwar@kost.com',
            'password' => Hash::make('password'),
            'role' => 'owner',
        ]);

        $this->call([
            RoomSeeder::class,
            TenantSeeder::class,
            BillSeeder::class,
            IssueSeeder::class,
            AnnouncementSeeder::class,
        ]);
    }
}
