<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Room;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TenantController extends Controller
{
    /**
     * List all tenants with their room (owner only).
     */
    public function index(): JsonResponse
    {
        $tenants = Tenant::with('room')->orderBy('id')->get()->map(fn (Tenant $t) => $this->formatTenant($t));

        return response()->json($tenants);
    }

    /**
     * Store a new tenant, auto-create their user account, and generate current month bill (owner only).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'phone' => ['required', 'string', 'max:30'],
            'room_id' => ['required', 'exists:rooms,id'],
            'contract_start' => ['required', 'date'],
            'contract_end' => ['required', 'date', 'after:contract_start'],
            'email' => ['nullable', 'email', 'unique:users,email'],
        ]);

        $room = Room::findOrFail($validated['room_id']);
        if ($room->status === 'terisi') {
            return response()->json(['message' => 'Kamar sudah terisi.'], 422);
        }

        // Auto-create user account for the new tenant
        $email = $validated['email'] ?? Str::slug($validated['name'], '.').'@kost.com';
        $defaultPassword = 'password';

        $user = User::create([
            'name' => $validated['name'],
            'email' => $email,
            'password' => Hash::make($defaultPassword),
            'role' => 'tenant',
        ]);

        $tenant = Tenant::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'room_id' => $validated['room_id'],
            'user_id' => $user->id,
            'contract_start' => $validated['contract_start'],
            'contract_end' => $validated['contract_end'],
        ]);

        $room->update(['status' => 'terisi']);

        // Auto-create bill for current month
        Bill::create([
            'tenant_id' => $tenant->id,
            'month' => now()->format('Y-m'),
            'amount' => $room->price,
            'status' => 'belum',
        ]);

        return response()->json(array_merge(
            $this->formatTenant($tenant->load('room')),
            ['email' => $email, 'password_default' => $defaultPassword],
        ), 201);
    }

    /**
     * Display the specified tenant.
     */
    public function show(Tenant $tenant): JsonResponse
    {
        return response()->json($this->formatTenant($tenant->load('room')));
    }

    /**
     * Update a tenant's data (owner only).
     */
    public function update(Request $request, Tenant $tenant): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:150'],
            'phone' => ['sometimes', 'string', 'max:30'],
            'room_id' => ['sometimes', 'exists:rooms,id'],
            'contract_start' => ['sometimes', 'date'],
            'contract_end' => ['sometimes', 'date', 'after:contract_start'],
        ]);

        if (isset($validated['room_id']) && (int) $validated['room_id'] !== $tenant->room_id) {
            $newRoom = Room::findOrFail($validated['room_id']);
            if ($newRoom->status === 'terisi') {
                return response()->json(['message' => 'Kamar baru sudah terisi.'], 422);
            }
            $tenant->room->update(['status' => 'kosong']);
            $newRoom->update(['status' => 'terisi']);
        }

        $tenant->update($validated);

        return response()->json($this->formatTenant($tenant->fresh()->load('room')));
    }

    /**
     * End a tenant's contract — set room to kosong, keep bill/issue history (owner only).
     */
    public function destroy(Tenant $tenant): JsonResponse
    {
        DB::transaction(function () use ($tenant): void {
            $user = $tenant->user;
            $tenant->room->update(['status' => 'kosong']);
            $tenant->delete();

            if ($user && ! Tenant::where('user_id', $user->id)->exists()) {
                $user->delete();
            }
        });

        return response()->json(['message' => 'Kontrak penghuni diakhiri. Riwayat keuangan tetap tersimpan.']);
    }

    /**
     * Format a tenant as the JS-compatible shape used by panel-owner.
     *
     * @return array<string, mixed>
     */
    private function formatTenant(Tenant $tenant): array
    {
        return [
            'id' => $tenant->id,
            'nama' => $tenant->name,
            'hp' => $tenant->phone,
            'room' => $tenant->room_id,
            'mulai' => $tenant->contract_start->format('Y-m-d'),
            'akhir' => $tenant->contract_end->format('Y-m-d'),
        ];
    }
}
