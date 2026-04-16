<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SinhVienController;
use App\Http\Controllers\GiangVienController;
use App\Http\Controllers\KyLvtnController;
use App\Http\Controllers\TopicRegistrationFormController;
use App\Models\TopicRegistrationForm;
use Illuminate\Support\Facades\DB;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/login-sv', [AuthController::class, 'loginSinhVien']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/students/import', [SinhVienController::class, 'import']);
    Route::get('/students/lop-list', [SinhVienController::class, 'lopList']);
    Route::get('/students', [SinhVienController::class, 'index']);
    Route::post('/students', [SinhVienController::class, 'store']);
    Route::put('/students/{mssv}', [SinhVienController::class, 'update']);
    Route::delete('/students/{mssv}', [SinhVienController::class, 'destroy']);

    Route::get('/giang-vien', [GiangVienController::class, 'index']);
    Route::post('/giang-vien', [GiangVienController::class, 'store']);
    Route::put('/giang-vien/{maGV}', [GiangVienController::class, 'update']);
    Route::delete('/giang-vien/{maGV}', [GiangVienController::class, 'destroy']);

    Route::get('/nhap-lieu', [TopicRegistrationFormController::class, 'index']);
    Route::post('/nhap-lieu', [TopicRegistrationFormController::class, 'store']);
    Route::put('/nhap-lieu/{id}', [TopicRegistrationFormController::class, 'update']);
    Route::delete('/nhap-lieu/{id}', [TopicRegistrationFormController::class, 'destroy']);

    Route::post('/topic-registration-form/{id}/approve', [TopicRegistrationFormController::class, 'approve']);
    Route::post('/nhap-lieu-import-excel', [TopicRegistrationFormController::class, 'importExcel']);

    // Lấy danh sách, giai đoạn hiện tại và cập nhật giai đoạn
    Route::get('/giai-doan', [\App\Http\Controllers\GiaiDoanController::class, 'index']);
    Route::get('/giai-doan/current', [\App\Http\Controllers\GiaiDoanController::class, 'current']);
    Route::put('/giai-doan/{id}', [\App\Http\Controllers\GiaiDoanController::class, 'update']);

    // API Phân công (lấy danh sách theo Đề tài)
    Route::get('/phan-cong', function () {
        $detais = \App\Models\DeTai::with(['sinhVien', 'giangVienHD', 'giangVienPB'])->get();
        // Trả về thẳng các đề tài vì đề tài gộp cả SV và GV
        return response()->json(['data' => $detais]);
    });

    // Cập nhật phân công (GVHD, GVPB) cho đề tài
    Route::put('/phan-cong/{id}', function (\Illuminate\Http\Request $request, $id) {
        $detai = \App\Models\DeTai::find($id);
        if (!$detai) return response()->json(['message' => 'Không tìm thấy đề tài'], 404);

        // Cập nhật maGV_HD và maGV_PB
        $data = $request->only(['maGV_HD', 'maGV_PB']);
        if (array_key_exists('maGV_HD', $data)) $detai->maGV_HD = $data['maGV_HD'];
        if (array_key_exists('maGV_PB', $data)) $detai->maGV_PB = $data['maGV_PB'];
        $detai->save();

        return response()->json(['message' => 'Cập nhật phân công thành công', 'data' => $detai]);
    });

    // Xóa phân công (xóa trắng gvhd và gvpb của đề tài)
    Route::delete('/phan-cong/{id}', function ($id) {
        $detai = \App\Models\DeTai::find($id);
        if ($detai) {
            $detai->maGV_HD = null;
            $detai->maGV_PB = null;
            $detai->save();
        }
        return response()->json(['message' => 'Đã xóa phân công']);
    });


    // CRUD Đề tài
    Route::get('/de-tai', [\App\Http\Controllers\DeTaiController::class, 'index']);
    Route::get('/de-tai/{id}', [\App\Http\Controllers\DeTaiController::class, 'show']);
    Route::post('/de-tai', [\App\Http\Controllers\DeTaiController::class, 'store']);
    Route::put('/de-tai/{id}', [\App\Http\Controllers\DeTaiController::class, 'update']);
    Route::put('/de-tai/{id}/cham-diem-hd', [\App\Http\Controllers\DeTaiController::class, 'chamDiemHD']);
    Route::put('/de-tai/{id}/cham-diem-pb', [\App\Http\Controllers\DeTaiController::class, 'chamDiemPB']);
    Route::put('/de-tai/{id}/cham-diem-gk', [\App\Http\Controllers\DeTaiController::class, 'chamDiemGK']);
    Route::delete('/de-tai/{id}', [\App\Http\Controllers\DeTaiController::class, 'destroy']);
    Route::get('/de-tai/{id}/export/gvhd', [\App\Http\Controllers\DeTaiController::class, 'exportGVHD']);
    Route::get('/de-tai/{id}/export/gvpb', [\App\Http\Controllers\DeTaiController::class, 'exportGVPB']);


    // API thống kê tổng quan cho dashboard
    Route::get('/stats', function () {
        $today = date('Y-m-d');
        $sodetai = \App\Models\DeTai::count();
        $sosinhvien = \App\Models\SinhVien::count();
        $detai_daxong = \App\Models\DeTai::where('trangThai', 'dat')->count();
        $giai_doans = \App\Models\GiaiDoan::orderBy('ngay_bat_dau', 'asc')->get();
        $sogiaidoan = $giai_doans->count();
        $stt_giaidoan_hientai = null;
        foreach ($giai_doans as $index => $gd) {
            if ($gd->ngay_ket_thuc >= $today) {
                $stt_giaidoan_hientai = $index + 1;
                break;
            }
        }
        if (is_null($stt_giaidoan_hientai) && $giai_doans->isNotEmpty()) {
            $stt_giaidoan_hientai = $giai_doans->count();
        }

        return response()->json([
            'giaidoan_hientai' => $stt_giaidoan_hientai,
            'sodetai' => $sodetai,
            'sosinhvien' => $sosinhvien,
            'detai_daxong' => $detai_daxong,
            'sogiaidoan' => $sogiaidoan,
        ]);
    });

    // API thống kê tổng quan cho Giảng viên
    Route::get('/gv-stats', function (\Illuminate\Http\Request $request) {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $sodetai_hd = \App\Models\DeTai::where('maGV_HD', $user->maGV)->count();
        $sodetai_pb = \App\Models\DeTai::where('maGV_PB', $user->maGV)->count();

        // Cùng tính giai đoạn hiện tại (giống admin)
        $today = date('Y-m-d');
        $giai_doans = \App\Models\GiaiDoan::orderBy('ngay_bat_dau', 'asc')->get();
        $currentStage = null;
        $totalStages = $giai_doans->count();

        foreach ($giai_doans as $index => $gd) {
            if ($gd->ngay_ket_thuc >= $today) {
                $currentStage = [
                    'mo_ta' => $gd->mo_ta,
                    'ngay_bat_dau' => $gd->ngay_bat_dau,
                    'ngay_ket_thuc' => $gd->ngay_ket_thuc
                ];
                break;
            }
        }

        return response()->json([
            'sodetai_hd' => $sodetai_hd,
            'sodetai_pb' => $sodetai_pb,
            'sodetai_hoidong' => 0, // Hiện tại Hội đồng chưa triển khai kỹ
            'giaidoan_hientai' => $currentStage,
            'sogiaidoan' => $totalStages,
        ]);
    });

    // API thống kê tổng quan cho Sinh viên
    Route::get('/sv-stats', function (\Illuminate\Http\Request $request) {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        // Lấy đề tài đã đăng ký của sinh viên này qua trường maDeTai
        $maDeTai = $user->maDeTai ?? null;
        $detai = null;
        $trangThaiDeTai = null;
        $tenDeTai = null;
        if ($maDeTai) {
            $detai = \App\Models\DeTai::where('maDeTai', $maDeTai)->first();
            $trangThaiDeTai = $detai ? $detai->trangThai : null;
            $tenDeTai = $detai ? $detai->tenDeTai : null;
        }

        // Giai đoạn hiện tại
        $today = date('Y-m-d');
        $giai_doans = \App\Models\GiaiDoan::orderBy('ngay_bat_dau', 'asc')->get();
        $currentStage = null;
        $totalStages = $giai_doans->count();
        foreach ($giai_doans as $index => $gd) {
            if ($gd->ngay_ket_thuc >= $today) {
                $currentStage = [
                    'mo_ta' => $gd->mo_ta,
                    'ngay_bat_dau' => $gd->ngay_bat_dau,
                    'ngay_ket_thuc' => $gd->ngay_ket_thuc
                ];
                break;
            }
        }

        return response()->json([
            'ten_de_tai' => $tenDeTai,
            'trang_thai_de_tai' => $trangThaiDeTai,
            'giaidoan_hientai' => $currentStage,
            'sogiaidoan' => $totalStages,
        ]);
    });



    // API: Lấy đề tài đăng ký của sinh viên hiện tại
    Route::get('/topic-registration-form/my', function (\Illuminate\Http\Request $request) {
        $user = $request->user();
        $mssv = $user->mssv ?? $user->id;
        $topic = TopicRegistrationForm::where('student1_id', $mssv)
            ->orWhere('student2_id', $mssv)
            ->orderByDesc('registered_at')
            ->first();
        return response()->json(['data' => $topic]);
    });
});
