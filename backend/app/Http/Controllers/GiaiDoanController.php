<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GiaiDoan;

class GiaiDoanController extends Controller
{
    // cột data có cấu trúc { "con_phancong":"false", "con_dangky": "false", "con_chamGK":"false", "con_chamPB":"false", "con_chamHD":"false" }
    
    // Lấy danh sách tất cả giai đoạn
    public function index()
    {
        $giaiDoans = GiaiDoan::all();
        return response()->json($giaiDoans);
    }

    // Cập nhật giai đoạn
    public function update(Request $request, $id)
    {
        $giaiDoan = GiaiDoan::find($id);
        if (!$giaiDoan) {
            return response()->json(['message' => 'Không tìm thấy giai đoạn'], 404);
        }
        $data = $request->only(['mo_ta', 'loai', 'ngay_bat_dau', 'ngay_ket_thuc', 'data']);
        $giaiDoan->update($data);
        return response()->json(['message' => 'Cập nhật giai đoạn thành công', 'data' => $giaiDoan]);
    }

    public function create(Request $request)
    {
        $data = $request->only(['mo_ta', 'loai', 'ngay_bat_dau', 'ngay_ket_thuc', 'data']);
        $giaiDoan = GiaiDoan::create($data);
        return response()->json(['message' => 'Tạo giai đoạn thành công', 'data' => $giaiDoan], 201);
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
