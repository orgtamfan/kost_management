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
        User::updateOrCreate(['role' => 'owner'], [
            'name' => 'Anwar',
            'email' => config('app.owner.email'),
            'password' => Hash::make(config('app.owner.password')),
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
