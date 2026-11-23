<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IssueController extends Controller
{
    /**
     * List all issues (owner only).
     */
    public function index(): JsonResponse
    {
        $issues = Issue::with('tenant.room')
            ->orderByRaw("FIELD(status, 'Baru', 'Diproses', 'Selesai')")
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (Issue $i) => $this->formatIssue($i));

        return response()->json($issues);
    }

    /**
     * List issues for the authenticated tenant.
     */
    public function myIssues(Request $request): JsonResponse
    {
        $tenant = $request->user()->tenant;

        if (! $tenant) {
            return response()->json(['message' => 'Profil penghuni tidak ditemukan.'], 404);
        }

        $issues = $tenant->issues()->orderBy('created_at', 'desc')->get()->map(fn (Issue $i) => [
            'j' => $i->title,
            'd' => $i->description,
            'tgl' => $i->created_at->format('d M Y'),
            'st' => array_search($i->status, ['Baru', 'Diproses', 'Selesai']),
            'foto' => (bool) $i->photo_data,
        ]);

        return response()->json($issues);
    }

    /**
     * Store a new issue (tenant only).
     * Foto diterima sebagai Base64 Data URL agar kompatibel dengan Vercel serverless.
     */
    public function store(Request $request): JsonResponse
    {
        $tenant = $request->user()->tenant;

        if (! $tenant) {
            return response()->json(['message' => 'Profil penghuni tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'description' => ['required', 'string'],
            'photo_data' => ['nullable', 'string'], // Base64 Data URL
        ]);

        if (isset($validated['photo_data']) && strlen($validated['photo_data']) > 3_000_000) {
            return response()->json(['message' => 'Ukuran foto terlalu besar. Maksimal 2 MB.'], 422);
        }

        $issue = Issue::create([
            'tenant_id' => $tenant->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'status' => 'Baru',
            'photo_data' => $validated['photo_data'] ?? null,
        ]);

        return response()->json([
            'j' => $issue->title,
            'd' => $issue->description,
            'tgl' => $issue->created_at->format('d M Y'),
            'st' => 0,
            'foto' => (bool) $issue->photo_data,
        ], 201);
    }

    /**
     * Update the status of an issue (owner only).
     */
    public function updateStatus(Request $request, Issue $issue): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:Baru,Diproses,Selesai'],
        ]);

        $issue->update(['status' => $validated['status']]);

        return response()->json($this->formatIssue($issue->fresh()->load('tenant.room')));
    }

    /**
     * Format an issue for the owner panel view.
     *
     * @return array<string, mixed>
     */
    private function formatIssue(Issue $issue): array
    {
        return [
            'id' => $issue->id,
            'j' => $issue->title,
            'd' => $issue->description,
            't' => $issue->tenant_id,
            'tgl' => $issue->created_at->format('d M Y'),
            'st' => $issue->status,
        ];
    }
}
