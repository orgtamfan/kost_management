<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class OwnerLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_log_in_with_configured_credentials(): void
    {
        config([
            'app.owner.email' => 'owner@example.test',
            'app.owner.password' => 'secret-owner-password',
        ]);

        $owner = User::create([
            'name' => 'Owner',
            'email' => config('app.owner.email'),
            'password' => Hash::make(config('app.owner.password')),
            'role' => 'owner',
        ]);

        $this->postJson('/api/login', [
            'email' => $owner->email,
            'password' => 'secret-owner-password',
        ])
            ->assertOk()
            ->assertJson([
                'email' => $owner->email,
                'role' => 'owner',
            ]);
    }

    public function test_owner_panel_does_not_expose_default_credentials(): void
    {
        $this->get('/owner')
            ->assertOk()
            ->assertDontSee('anwar@kost.com')
            ->assertDontSee('value="password"')
            ->assertDontSee('readonly');
    }
}
