<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * photo_path diubah ke longText (Base64) agar kompatibel dengan Vercel.
     * tenant_id pakai nullOnDelete agar riwayat keluhan tidak hilang saat kontrak berakhir.
     */
    public function up(): void
    {
        Schema::create('issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained('tenants')->nullOnDelete();
            $table->string('title');
            $table->text('description');
            $table->enum('status', ['Baru', 'Diproses', 'Selesai'])->default('Baru');
            $table->longText('photo_data')->nullable(); // Base64 Data URL
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('issues');
    }
};
