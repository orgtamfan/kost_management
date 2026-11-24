<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('pages.calon-penghuni');
})->name('home');

Route::get('/penghuni', function () {
    return view('pages.area-penghuni');
})->name('login');

Route::get('/owner', function () {
    return view('pages.panel-owner');
})->name('owner');

// Fallback untuk Vercel rewrite jika awalan /api terpotong
Route::prefix('')->group(base_path('routes/api.php'));

