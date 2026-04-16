<?php

namespace App\Models;


use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class GiangVien extends Authenticatable
{
    use HasApiTokens;
    protected $table = 'giangvien';
    protected $primaryKey = 'maGV';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'maGV', 'tenGV', 'email', 'soDienThoai', 'hocVi', 'matKhau',
    ];

    protected $hidden = ['matKhau'];

    public function getAuthPassword()
    {
        return $this->matKhau;
    }

    public function deTaiHuongDan()
    {
        return $this->hasMany(DeTai::class, 'maGV_HD', 'maGV');
    }

    public function deTaiPhanBien()
    {
        return $this->hasMany(DeTai::class, 'maGV_PB', 'maGV');
    }

    public function thanhVienHoiDong()
    {
        return $this->hasMany(ThanhVienHoiDong::class, 'maGV', 'maGV');
    }
}
