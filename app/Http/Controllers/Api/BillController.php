<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BillController extends Controller
{
    /**
     * List all bills for a given month (owner only).
     */
    public function index(Request $request): JsonResponse
    {
        $month = $request->query('month', now()->format('Y-m'));

        $bills = Bill::with(['tenant.room'])
            ->where('month', $month)
            ->orderBy('id')
            ->get()
            ->map(fn (Bill $b) => $this->formatBill($b));

        return response()->json($bills);
    }

    /**
     * List all available months that have bills (owner only).
     */
    public function months(): JsonResponse
    {
        $months = Bill::selectRaw('DISTINCT month')->orderBy('month', 'desc')->pluck('month');

        return response()->json($months);
    }

    /**
     * List bills for the authenticated tenant only.
     */
    public function myBills(Request $request): JsonResponse
    {
        $tenant = $request->user()->tenant;

        if (! $tenant) {
            return response()->json(['message' => 'Profil penghuni tidak ditemukan.'], 404);
        }

        $bills = $tenant->bills()->orderBy('month', 'desc')->get()->map(fn (Bill $b) => $this->formatTenantBill($b));

        return response()->json($bills);
    }

    /**
     * Approve a pending bill (owner only).
     */
    public function approve(Bill $bill): JsonResponse
    {
        if ($bill->status !== 'pending') {
            return response()->json(['message' => 'Tagihan ini tidak dalam status menunggu verifikasi.'], 422);
        }

        $receiptNumber = 'KW/'.now()->format('Y/m').'/'.str_pad((string) $bill->id, 3, '0', STR_PAD_LEFT);

        $bill->update([
            'status' => 'lunas',
            'receipt_number' => $receiptNumber,
            'paid_at' => now()->toDateString(),
        ]);

        return response()->json($this->formatBill($bill->fresh()->load('tenant.room')));
    }

    /**
     * Reject a pending bill with a note (owner only).
     */
    public function reject(Request $request, Bill $bill): JsonResponse
    {
        if ($bill->status !== 'pending') {
            return response()->json(['message' => 'Tagihan ini tidak dalam status menunggu verifikasi.'], 422);
        }

        $validated = $request->validate([
            'rejection_note' => ['required', 'string', 'max:500'],
        ]);

        $bill->update([
            'status' => 'ditolak',
            'rejection_note' => $validated['rejection_note'],
        ]);

        return response()->json($this->formatBill($bill->fresh()->load('tenant.room')));
    }

    /**
     * Upload a payment slip as Base64 (tenant only).
     * Vercel: filesystem is read-only, so we store Base64 Data URL in DB.
     */
    public function uploadSlip(Request $request, Bill $bill): JsonResponse
    {
        $tenant = $request->user()->tenant;

        if (! $tenant || $bill->tenant_id !== $tenant->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if (! in_array($bill->status, ['belum', 'ditolak'], true)) {
            return response()->json(['message' => 'Tagihan ini sudah tidak dapat diperbarui.'], 422);
        }

        $validated = $request->validate([
            'slip_data' => ['required', 'string'], // Base64 Data URL dari frontend
        ]);

        // Validasi ukuran Base64 (maks ~2.7 MB setelah encoding 2 MB file)
        if (strlen($validated['slip_data']) > 3_000_000) {
            return response()->json(['message' => 'Ukuran file terlalu besar. Maksimal 2 MB.'], 422);
        }

        $bill->update([
            'status' => 'pending',
            'slip_data' => $validated['slip_data'],
            'rejection_note' => null,
        ]);

        return response()->json($this->formatTenantBill($bill->fresh()));
    }

    /**
     * Format a bill for the owner panel view.
     *
     * @return array<string, mixed>
     */
    private function formatBill(Bill $bill): array
    {
        return [
            'id' => $bill->id,
            't' => $bill->tenant_id,
            'm' => $bill->month,
            'amt' => $bill->amount,
            'st' => $bill->status,
            'no' => $bill->receipt_number,
            'note' => $bill->rejection_note,
            'slip' => $bill->slip_data, // Base64 Data URL untuk ditampilkan langsung di <img src="">
        ];
    }

    /**
     * Format a bill for the tenant (area-penghuni) view.
     *
     * @return array<string, mixed>
     */
    private function formatTenantBill(Bill $bill): array
    {
        $monthNames = [
            '01' => 'Januari', '02' => 'Februari', '03' => 'Maret',
            '04' => 'April', '05' => 'Mei', '06' => 'Juni',
            '07' => 'Juli', '08' => 'Agustus', '09' => 'September',
            '10' => 'Oktober', '11' => 'November', '12' => 'Desember',
        ];
        [$year, $month] = explode('-', $bill->month);
        $monthLabel = ($monthNames[$month] ?? $month).' '.$year;

        return [
            'id' => $bill->id,
            'bln' => $monthLabel,
            'amt' => $bill->amount,
            'st' => $bill->status,
            'catatan' => $bill->rejection_note,
            'no' => $bill->receipt_number,
            'paid' => $bill->paid_at?->format('d M Y'),
        ];
    }
}
