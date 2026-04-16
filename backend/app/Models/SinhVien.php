<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SinhVien extends Model
{
    protected $table = 'sinhvien';
    protected $primaryKey = 'mssv';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'mssv', 'hoTen', 'lop', 'email', 'soDienThoai', 'maDeTai',
    ];

    public function deTai()
    {
        return $this->belongsTo(DeTai::class, 'maDeTai', 'maDeTai');
    }
}
