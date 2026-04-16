<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GiaiDoan;

class GiaiDoanController extends Controller
{
    // Lấy danh sách tất cả giai đoạn
    public function index()
    {
        $giaiDoans = GiaiDoan::all();
        return response()->json($giaiDoans);
    }

    // Lấy giai đoạn hiện tại theo ngày
    public function current()
    {
        $today = date('Y-m-d');
        $giaiDoan = GiaiDoan::where('ngay_bat_dau', '<=', $today)
            ->where('ngay_ket_thuc', '>=', $today)
            ->first();
        return response()->json($giaiDoan);
    }
}
