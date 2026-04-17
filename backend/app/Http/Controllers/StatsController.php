<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DeTai;
use App\Models\SinhVien;
use App\Models\GiaiDoan;

class StatsController extends Controller
{
    /**
     * API thống kê tổng quan cho Admin Dashboard
     */
    public function adminStats()
    {
        $sodetai = DeTai::count();
        $sosinhvien = SinhVien::count();
        $detai_daxong = DeTai::where('trangThai', 'dat')->count();
        
        // Sử dụng Helper linh hoạt vừa code
        $stageInfo = GiaiDoan::getDashboardCurrentStage();

        return response()->json([
            'giaidoan_hientai' => [
                'index' => $stageInfo['stage_index'],
                'object' => $stageInfo['stage_object']
            ],
            'sodetai' => $sodetai,
            'sosinhvien' => $sosinhvien,
            'detai_daxong' => $detai_daxong,
            'sogiaidoan' => $stageInfo['total_stages'],
        ]);
    }

    /**
     * API thống kê tổng quan cho Giảng viên
     */
    public function gvStats(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $sodetai_hd = DeTai::where('maGV_HD', $user->maGV)->count();
        $sodetai_pb = DeTai::where('maGV_PB', $user->maGV)->count();

        $stageInfo = GiaiDoan::getDashboardCurrentStage();

        return response()->json([
            'sodetai_hd' => $sodetai_hd,
            'sodetai_pb' => $sodetai_pb,
            'sodetai_hoidong' => 0, 
            'giaidoan_hientai' => $stageInfo['stage_object'],  
            'sogiaidoan' => $stageInfo['total_stages'],
        ]);
    }

    /**
     * API thống kê tổng quan cho Sinh viên
     */
    public function svStats(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $maDeTai = $user->maDeTai ?? null;
        $detai = null;
        $trangThaiDeTai = null;
        $tenDeTai = null;

        if ($maDeTai) {
            $detai = DeTai::where('maDeTai', $maDeTai)->first();
            $trangThaiDeTai = $detai ? $detai->trangThai : null;
            $tenDeTai = $detai ? $detai->tenDeTai : null;
        }

        $stageInfo = GiaiDoan::getDashboardCurrentStage();

        return response()->json([
            'ten_de_tai' => $tenDeTai,
            'trang_thai_de_tai' => $trangThaiDeTai,
            'giaidoan_hientai' => $stageInfo['stage_object'],
            'sogiaidoan' => $stageInfo['total_stages'],
        ]);
    }
}
