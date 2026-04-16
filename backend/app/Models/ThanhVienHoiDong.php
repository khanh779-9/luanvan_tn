<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThanhVienHoiDong extends Model
{
    protected $table = 'thanhvien_hoidong';

    protected $fillable = [
        'maHoiDong', 'maGV', 'vaiTro',
    ];

    public function hoiDong()
    {
        return $this->belongsTo(HoiDong::class, 'maHoiDong', 'maHoiDong');
    }

    public function giangVien()
    {
        return $this->belongsTo(GiangVien::class, 'maGV', 'maGV');
    }
}
