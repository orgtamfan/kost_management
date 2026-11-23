<?php

namespace Database\Seeders;

use App\Models\Issue;
use Illuminate\Database\Seeder;

class IssueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $issues = [
            ['tenant_id' => 2, 'title' => 'Keran wastafel bocor', 'description' => 'Air menetes terus dari sambungan keran.', 'status' => 'Diproses'],
            ['tenant_id' => 4, 'title' => 'Pintu kamar sulit dikunci', 'description' => 'Kunci sering macet.', 'status' => 'Baru'],
            ['tenant_id' => 2, 'title' => 'Lampu kamar mandi mati', 'description' => 'Mati sejak awal bulan.', 'status' => 'Selesai'],
        ];

        foreach ($issues as $issue) {
            Issue::create($issue);
        }
    }
}
