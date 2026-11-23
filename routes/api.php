<?php

use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BillController;
use App\Http\Controllers\Api\IssueController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\TenantController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — menggunakan middleware "web" agar session cookie berfungsi
| tanpa perlu Sanctum. CSRF dilindungi oleh X-CSRF-TOKEN header di JS.
|--------------------------------------------------------------------------
*/

// Public — bebas diakses
Route::get('/rooms', [RoomController::class, 'index']);

// Login dengan rate limit brute-force: maks 5 percobaan per menit
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

// Sudah authenticated
Route::middleware('auth:web')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('my/announcements', [AnnouncementController::class, 'index']);

    // Owner only
    Route::middleware('role:owner')->group(function () {
        Route::apiResource('rooms', RoomController::class)->except(['index']);
        Route::apiResource('tenants', TenantController::class);
        Route::get('bills', [BillController::class, 'index']);
        Route::get('bills/months', [BillController::class, 'months']);
        Route::patch('bills/{bill}/approve', [BillController::class, 'approve']);
        Route::patch('bills/{bill}/reject', [BillController::class, 'reject']);
        Route::get('issues', [IssueController::class, 'index']);
        Route::patch('issues/{issue}/status', [IssueController::class, 'updateStatus']);
        Route::post('announcements', [AnnouncementController::class, 'store']);
        Route::delete('announcements/{announcement}', [AnnouncementController::class, 'destroy']);
    });

    // Tenant only
    Route::middleware('role:tenant')->group(function () {
        Route::get('my/bills', [BillController::class, 'myBills']);
        Route::post('my/bills/{bill}/slip', [BillController::class, 'uploadSlip']);
        Route::get('my/issues', [IssueController::class, 'myIssues']);
        Route::post('my/issues', [IssueController::class, 'store']);
    });
});
