<?php

namespace Database\Seeders;

use App\Models\Bill;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class BillSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /** @var array<int,int> Tenant ID => room price */
        $prices = [1 => 850000, 2 => 850000, 3 => 700000, 4 => 650000];

        // September & October — all lunas
        foreach ([1, 2, 3, 4] as $tenantId) {
            foreach (['2026-09', '2026-10'] as $month) {
                Bill::create([
                    'tenant_id' => $tenantId,
                    'month' => $month,
                    'amount' => $prices[$tenantId],
                    'status' => 'lunas',
                    'receipt_number' => 'KW/'.str_replace('-', '/', $month).'/00'.$tenantId,
                    'paid_at' => substr($month, 0, 7).'-23',
                ]);
            }
        }

        // November — mixed statuses
        $novemberBills = [
            ['tenant_id' => 1, 'amount' => 850000, 'status' => 'pending'],
            ['tenant_id' => 2, 'amount' => 850000, 'status' => 'belum'],
            ['tenant_id' => 3, 'amount' => 700000, 'status' => 'lunas', 'receipt_number' => 'KW/2026/11/003', 'paid_at' => '2026-11-20'],
            ['tenant_id' => 4, 'amount' => 650000, 'status' => 'pending'],
        ];

        foreach ($novemberBills as $bill) {
            Bill::create(array_merge(['month' => '2026-11'], $bill));
        }
    }
}
