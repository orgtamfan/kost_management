<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    /**
     * List all rooms (public endpoint for calon-penghuni page).
     */
    public function index(): JsonResponse
    {
        $rooms = Room::orderBy('id')->get()->map(function (Room $room) {
            return [
                'id' => $room->id,
                'n' => $room->name,
                'p' => $room->price,
                'sz' => $room->size,
                'fl' => $room->floor,
                'st' => $room->status,
                'f' => $room->facilities ?? [],
                'ac' => $room->has_ac,
            ];
        });

        return response()->json($rooms)
            ->header('Cache-Control', 'public, max-age=60, s-maxage=300');
    }

    /**
     * Store a newly created room (owner only).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'price' => ['required', 'integer', 'min:0'],
            'size' => ['required', 'string', 'max:50'],
            'floor' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'in:kosong,terisi'],
            'facilities' => ['nullable', 'array'],
            'has_ac' => ['boolean'],
        ]);

        $room = Room::create($validated);

        return response()->json($this->formatRoom($room), 201);
    }

    /**
     * Display the specified room.
     */
    public function show(Room $room): JsonResponse
    {
        return response()->json($this->formatRoom($room));
    }

    /**
     * Update the specified room (owner only).
     */
    public function update(Request $request, Room $room): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'price' => ['sometimes', 'integer', 'min:0'],
            'size' => ['sometimes', 'string', 'max:50'],
            'floor' => ['sometimes', 'integer', 'min:1'],
            'status' => ['sometimes', 'in:kosong,terisi'],
            'facilities' => ['nullable', 'array'],
            'has_ac' => ['boolean'],
        ]);

        $room->update($validated);

        return response()->json($this->formatRoom($room));
    }

    /**
     * Remove the specified room (owner only).
     */
    public function destroy(Room $room): JsonResponse
    {
        if ($room->status === 'terisi') {
            return response()->json(['message' => 'Kamar masih terisi, akhiri kontrak penghuni terlebih dahulu.'], 422);
        }

        $room->delete();

        return response()->json(['message' => 'Kamar berhasil dihapus.']);
    }

    /**
     * Format a room as the JS-compatible shape used by all pages.
     *
     * @return array<string, mixed>
     */
    private function formatRoom(Room $room): array
    {
        return [
            'id' => $room->id,
            'n' => $room->name,
            'p' => $room->price,
            'sz' => $room->size,
            'fl' => $room->floor,
            'st' => $room->status,
            'f' => $room->facilities ?? [],
            'ac' => $room->has_ac,
        ];
    }
}
