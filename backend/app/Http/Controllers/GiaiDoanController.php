<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GiaiDoan;
use Carbon\Carbon;
use SebastianBergmann\Environment\Console;
use App\Models\CauHinh;

class GiaiDoanController extends Controller
{
    // cột data có cấu trúc { "con_phancong_hd":false, "con_phancong_pb":false, "con_dangky": false, "con_chamGK":false, "con_chamPB":false, "con_chamHD":false }

  
    public function index()
    {
        $giaiDoans = GiaiDoan::all();
        foreach ($giaiDoans as $giaiDoan) {
            $giaiDoan->data = json_decode($giaiDoan->data);
        }
        return response()->json($giaiDoans, 200, [], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
 
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

 
    public function current()
    {
        // $today = date('Y-m-d');
        $today = Carbon::today();
        $useDateCustom = CauHinh::where('key', 'thoiGianTuyChinh')->first();
        if ($useDateCustom && ($useDateCustom->value === true || $useDateCustom->value === 'true')) {
            $dateCustomJson = CauHinh::where('key', 'tg_TuyChinh')->first();
            $dateCustomJson = json_decode($dateCustomJson->value);
            $dateCustom = Carbon::create(
                $dateCustomJson->year,
                $dateCustomJson->month,
                $dateCustomJson->day
            );
            $today = $dateCustom;
        }

        $giaiDoan = GiaiDoan::where('ngay_bat_dau', '<=', $today)
            ->where('ngay_ket_thuc', '>=', $today)
            ->first();
        // $giaiDoan->data= json_decode($giaiDoan->data);        
        if ($giaiDoan) {
            $giaiDoan->data = is_string($giaiDoan->data) ? json_decode($giaiDoan->data) : $giaiDoan->data;
            return response()->json($giaiDoan, 200, [], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        }
        return response()->json((object) []);
    }
}
