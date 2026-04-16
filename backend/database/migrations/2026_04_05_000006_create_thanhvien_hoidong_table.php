<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('thanhvien_hoidong', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('ma_hoidong');
            $table->string('ma_gv', 20);
            $table->enum('vai_tro', ['chu_tich','thu_ky','uy_vien']);
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->unique(['ma_hoidong', 'ma_gv']);
            $table->foreign('ma_hoidong')->references('ma_hoidong')->on('hoi_dong')->cascadeOnDelete();
            $table->foreign('ma_gv')->references('ma_gv')->on('giang_vien')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('thanhvien_hoidong');
    }
};
