<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * List all announcements (accessible to tenants and owner).
     */
    public function index(): JsonResponse
    {
        $announcements = Announcement::orderBy('created_at', 'desc')
            ->get()
            ->map(fn (Announcement $a) => [
                'id' => $a->id,
                'j' => $a->title,
                'p' => $a->content,
            ]);

        return response()->json($announcements);
    }

    /**
     * Store a new announcement (owner only).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'content' => ['required', 'string'],
        ]);

        $announcement = Announcement::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
        ]);

        return response()->json([
            'id' => $announcement->id,
            'j' => $announcement->title,
            'p' => $announcement->content,
        ], 201);
    }

    /**
     * Delete an announcement (owner only).
     */
    public function destroy(Announcement $announcement): JsonResponse
    {
        $announcement->delete();

        return response()->json(['message' => 'Pengumuman dihapus.']);
    }
}
