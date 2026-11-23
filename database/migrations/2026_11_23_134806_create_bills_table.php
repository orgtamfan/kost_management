<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Kolom slip_path dan photo_path diubah ke longText (Base64)
     * agar kompatibel dengan Vercel serverless (filesystem read-only).
     * tenant_id pakai nullOnDelete agar riwayat tagihan tidak hilang saat kontrak berakhir.
     */
    public function up(): void
    {
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained('tenants')->nullOnDelete();
            $table->string('month', 7); // "2026-11"
            $table->unsignedInteger('amount');
            $table->enum('status', ['belum', 'pending', 'lunas', 'ditolak'])->default('belum');
            $table->string('receipt_number')->nullable();
            $table->text('rejection_note')->nullable();
            $table->longText('slip_data')->nullable(); // Base64 Data URL
            $table->date('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
