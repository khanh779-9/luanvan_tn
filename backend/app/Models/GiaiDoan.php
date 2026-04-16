<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GiaiDoan extends Model
{
    protected $table = 'giai_doan';
    public $timestamps = false;

    protected $fillable = [
        'mo_ta', 'loai', 'ngay_bat_dau', 'ngay_ket_thuc',
    ];
}
