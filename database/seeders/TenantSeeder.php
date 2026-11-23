<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenants = [
            ['name' => 'Budi Santoso', 'phone' => '0812-1111-2222', 'email' => 'budi@kost.com', 'room_id' => 2, 'contract_start' => '2026-03-01', 'contract_end' => '2027-02-28'],
            ['name' => 'Rina Pratiwi', 'phone' => '0813-3333-4444', 'email' => 'rina@kost.com', 'room_id' => 3, 'contract_start' => '2026-08-01', 'contract_end' => '2027-07-31'],
            ['name' => 'Dewi Lestari', 'phone' => '0857-5555-6666', 'email' => 'dewi@kost.com', 'room_id' => 4, 'contract_start' => '2026-01-01', 'contract_end' => '2026-12-31'],
            ['name' => 'Andi Saputra', 'phone' => '0821-7777-8888', 'email' => 'andi@kost.com', 'room_id' => 7, 'contract_start' => '2026-06-01', 'contract_end' => '2027-05-31'],
        ];

        foreach ($tenants as $data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make('password'),
                'role' => 'tenant',
            ]);

            Tenant::create([
                'name' => $data['name'],
                'phone' => $data['phone'],
                'room_id' => $data['room_id'],
                'user_id' => $user->id,
                'contract_start' => $data['contract_start'],
                'contract_end' => $data['contract_end'],
            ]);
        }
    }
}
