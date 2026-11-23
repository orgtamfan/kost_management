<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('pages.calon-penghuni');
})->name('home');

Route::get('/penghuni', function () {
    return view('pages.area-penghuni');
})->name('penghuni');

Route::get('/owner', function () {
    return view('pages.panel-owner');
})->name('owner');
