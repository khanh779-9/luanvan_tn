<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DeTai;
use App\Models\SinhVien;
use App\Models\GiangVien;
use PhpOffice\PhpWord\TemplateProcessor;
use PhpOffice\PhpWord\Settings;

class DeTaiController extends Controller
{
    
    public function index(Request $request)
    {
        $query = DeTai::query();
        // Lọc theo mã GV hướng dẫn
        if ($request->filled('maGV_HD')) {
            $query->where('maGV_HD', $request->maGV_HD);
        }
        if ($request->filled('maGV_PB')) {
            $query->where('maGV_PB', $request->maGV_PB);
        }
        if ($request->filled('maHoiDong')) {
            $query->where('maHoiDong', $request->maHoiDong);
        }
        if ($request->filled('trangThai')) {
            $query->where('trangThai', $request->trangThai);
        }
        if ($request->filled('q')) {
            $query->where('tenDeTai', 'like', '%' . $request->q . '%');
        }
        $query->orderByDesc('maDeTai');
        $pageSize = $request->input('per_page', 15);

        

        $result = $query->paginate($pageSize);

        // Lấy danh sách mã đề tài trên trang này
        $maDeTaiArr = collect($result->items())->pluck('maDeTai')->all();
        $sinhVienMap = [];
        if (!empty($maDeTaiArr)) {
            $sinhViens = \App\Models\SinhVien::whereIn('maDeTai', $maDeTaiArr)->get();
            foreach ($sinhViens as $sv) {
                $sinhVienMap[$sv->maDeTai][] = [
                    'mssv' => $sv->mssv,
                    'hoTen' => $sv->hoTen,
                ];
            }
        }
        $result->getCollection()->transform(function ($deTai) use ($sinhVienMap) {
            $deTai->sinh_viens = $sinhVienMap[$deTai->maDeTai] ?? [];
            return $deTai;
        });
        return response()->json($result);
    }

   
    public function show($id)
    {
        $detai = DeTai::find($id);
        if (!$detai) return response()->json(['message' => 'Not found'], 404);
        return response()->json($detai);
    }

   
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tenDeTai' => 'required|string|max:255',
            'moTa' => 'nullable|string',
            'maGV_HD' => 'required|string|max:20',
            'maGV_PB' => 'nullable|string|max:20',
            'maHoiDong' => 'nullable|integer',
            'trangThai' => 'nullable|string|max:50',
        ]);
        $detai = DeTai::create($validated);
        return response()->json($detai, 201);
    }
 
    public function update(Request $request, $id)
    {
        $detai = DeTai::find($id);
        if (!$detai) return response()->json(['message' => 'Not found'], 404);
        $validated = $request->validate([
            'tenDeTai' => 'sometimes|required|string|max:255',
            'moTa' => 'nullable|string',
            'maGV_HD' => 'sometimes|required|string|max:20',
            'maGV_PB' => 'nullable|string|max:20',
            'maHoiDong' => 'nullable|integer',
            'trangThai' => 'nullable|string|max:50',
            'diemGiuaKy' => 'nullable|numeric',
            'nhanXetGiuaKy' => 'nullable|string',
            'trangThaiGiuaKy' => 'nullable|string',
        ]);
        $detai->update($validated);
        return response()->json($detai);
    }

    public function chamDiemHD(Request $request, $id)
    {
        $detai = DeTai::find($id);
        if (!$detai) return response()->json(['message' => 'Not found'], 404);

        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        // Chỉ kiểm tra theo mã giảng viên hướng dẫn
        if ($detai->maGV_HD !== $user->maGV) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($request->has('tieu_chi')) {
            $request->validate([
                'tieu_chi' => 'required|array',
                'tieu_chi.*' => 'numeric|min:0|max:10',
                'tong_diem' => 'required|numeric|min:0|max:10',
                'nhan_xet' => 'nullable|string',
            ]);
            $detai->diemHuongDan = $request->tong_diem;
            $detai->nhanXetHuongDan = $request->nhan_xet;
            $detai->save();
        } else {
            $validated = $request->validate([
                'diemHuongDan' => 'nullable|numeric|min:0|max:10',
                'nhanXetHuongDan' => 'nullable|string',
            ]);
            $detai->update($validated);
        }

        return response()->json($detai);
    }

    public function chamDiemPB(Request $request, $id)
    {
        $detai = DeTai::find($id);
        if (!$detai) return response()->json(['message' => 'Not found'], 404);

        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        // Chỉ kiểm tra theo mã giảng viên phản biện
        if ($detai->maGV_PB !== $user->maGV) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($request->has('tieu_chi')) {
            $request->validate([
                'tieu_chi' => 'required|array',
                'tieu_chi.*' => 'numeric|min:0|max:10',
                'tong_diem' => 'required|numeric|min:0|max:10',
                'nhan_xet' => 'nullable|string',
            ]);
            $detai->diemPhanBien = $request->tong_diem;
            $detai->nhanXetPhanBien = $request->nhan_xet;
            $detai->save();
        } else {
            $validated = $request->validate([
                'diemPhanBien' => 'nullable|numeric|min:0|max:10',
                'nhanXetPhanBien' => 'nullable|string',
            ]);
            $detai->update($validated);
        }

        return response()->json($detai);
    }

    public function chamDiemGK(Request $request, $id)
    {
        $detai = DeTai::find($id);
        if (!$detai) return response()->json(['message' => 'Not found'], 404);

        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        // Chỉ kiểm tra theo mã giảng viên hướng dẫn
        if ($detai->maGV_HD !== $user->maGV) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'tieu_chi' => 'required|array',
            'tieu_chi.*' => 'numeric|min:0|max:10',
            'tong_diem' => 'required|numeric|min:0|max:10',
            'nhan_xet' => 'nullable|string',
            'trang_thai' => 'nullable|string',
        ]);

        $trangThai = $request->trang_thai;
        if (!$trangThai) {
            $trangThai = $request->tong_diem >= 5 ? 'dat' : 'khong_dat';
        }

        $detai->diemGiuaKy = $request->tong_diem;
        $detai->nhanXetGiuaKy = $request->nhan_xet;
        $detai->trangThaiGiuaKy = $trangThai;
        $detai->save();

        return response()->json($detai);
    }

    // Xoá đề tài
    public function destroy($id)
    {
        $detai = DeTai::find($id);
        if (!$detai) return response()->json(['message' => 'Not found'], 404);
        $detai->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function exportGVHD($id)
    {
        $detai = DeTai::find($id);
        if (!$detai) return response()->json(['message' => 'Not found'], 404);

        $svList = SinhVien::where('maDeTai', $id)->get();
        $gvhd = GiangVien::find($detai->maGV_HD);

        $templateDir = storage_path('app/templates');
        if (count($svList) >= 2) {
            $templateFile = $templateDir . '/Mau_01_01.docx';
        } else {
            $templateFile = $templateDir . '/Mau_01_02.docx';
        }

        if (!file_exists($templateFile)) {
            return response()->json(['message' => 'Template không tồn tại, chạy scripts/prepare_templates.php trước'], 500);
        }

        Settings::setTempDir(storage_path('app'));
        $tp = new TemplateProcessor($templateFile);

        $tp->setValue('ten_de_tai', $detai->tenDeTai ?? '');
        $tp->setValue('ten_gvhd', $gvhd ? $gvhd->tenGV : '');

        $tieuChi = $detai->tieu_chi_hd ?? [];
        for ($i = 1; $i <= 5; $i++) {
            $tp->setValue('tc' . $i, $tieuChi['tc' . $i] ?? '');
        }

        $diem = $detai->diemHuongDan ?? '';
        $tp->setValue('diem_tong', $diem);
        $tp->setValue('diem_chu', $diem !== '' ? $this->diemSangChu((float)$diem) : '');
        $tp->setValue('nhan_xet', $detai->nhanXetHuongDan ?? '');

        $now = now();
        $tp->setValue('ngay', $now->day);
        $tp->setValue('thang', $now->month);
        $tp->setValue('nam', $now->year);

        if (count($svList) >= 2) {
            $sv1 = $svList->get(0);
            $sv2 = $svList->get(1);
            if ($sv1) {
                $tp->setValue('ho_ten_sv_01', $sv1->hoTen ?? '');
                $tp->setValue('mssv_01', $sv1->mssv ?? '');
                $tp->setValue('lop_01', $sv1->lop ?? '');
            }
            if ($sv2) {
                $tp->setValue('ho_ten_sv_02', $sv2->hoTen ?? '');
                $tp->setValue('mssv_02', $sv2->mssv ?? '');
                $tp->setValue('lop_02', $sv2->lop ?? '');
            }
        } else {
            $sv = $svList->first();
            $tp->setValue('ho_ten_sv', $sv ? $sv->hoTen : '');
            $tp->setValue('mssv', $sv ? $sv->mssv : '');
            $tp->setValue('lop', $sv ? $sv->lop : '');
        }

        $tempFile = storage_path('app/temp_HD_' . $detai->maDeTai . '_' . time() . '.docx');
        $tp->saveAs($tempFile);
        $filename = 'Phieu_cham_HD_' . $detai->maDeTai . '.docx';
        return response()->download($tempFile, $filename)->deleteFileAfterSend(true);
    }

    public function exportGVPB($id)
    {
        $detai = DeTai::find($id);
        if (!$detai) return response()->json(['message' => 'Not found'], 404);

        $svList = SinhVien::where('maDeTai', $id)->get();
        $gvpb = GiangVien::find($detai->maGV_PB);

        $templateDir = storage_path('app/templates');
        if (count($svList) >= 2) {
            $templateFile = $templateDir . '/Mau_02_01.docx';
        } else {
            $templateFile = $templateDir . '/Mau_02_02.docx';
        }

        if (!file_exists($templateFile)) {
            return response()->json(['message' => 'Template không tồn tại, chạy scripts/prepare_templates.php trước'], 500);
        }

        Settings::setTempDir(storage_path('app'));
        $tp = new TemplateProcessor($templateFile);

        $tp->setValue('ten_de_tai', $detai->tenDeTai ?? '');
        $tp->setValue('ten_gvpb', $gvpb ? $gvpb->tenGV : '');

        $tieuChi = $detai->tieu_chi_pb ?? [];
        for ($i = 1; $i <= 5; $i++) {
            $tp->setValue('tc' . $i, $tieuChi['tc' . $i] ?? '');
        }

        $diem = $detai->diemPhanBien ?? '';
        $tp->setValue('diem_tong', $diem);
        $tp->setValue('diem_chu', $diem !== '' ? $this->diemSangChu((float)$diem) : '');
        $tp->setValue('nhan_xet', $detai->nhanXetPhanBien ?? '');

        $now = now();
        $tp->setValue('ngay', $now->day);
        $tp->setValue('thang', $now->month);
        $tp->setValue('nam', $now->year);

        if (count($svList) >= 2) {
            $sv1 = $svList->get(0);
            $sv2 = $svList->get(1);
            if ($sv1) {
                $tp->setValue('ho_ten_sv_01', $sv1->hoTen ?? '');
                $tp->setValue('mssv_01', $sv1->mssv ?? '');
                $tp->setValue('lop_01', $sv1->lop ?? '');
            }
            if ($sv2) {
                $tp->setValue('ho_ten_sv_02', $sv2->hoTen ?? '');
                $tp->setValue('mssv_02', $sv2->mssv ?? '');
                $tp->setValue('lop_02', $sv2->lop ?? '');
            }
        } else {
            $sv = $svList->first();
            $tp->setValue('ho_ten_sv', $sv ? $sv->hoTen : '');
            $tp->setValue('mssv', $sv ? $sv->mssv : '');
            $tp->setValue('lop', $sv ? $sv->lop : '');
        }

        $tempFile = storage_path('app/temp_PB_' . $detai->maDeTai . '_' . time() . '.docx');
        $tp->saveAs($tempFile);
        $filename = 'Phieu_cham_PB_' . $detai->maDeTai . '.docx';
        return response()->download($tempFile, $filename)->deleteFileAfterSend(true);
    }

    private function diemSangChu($diem)
    {
        $map = [
            0 => 'Không', 1 => 'Một', 2 => 'Hai', 3 => 'Ba', 4 => 'Bốn',
            5 => 'Năm', 6 => 'Sáu', 7 => 'Bảy', 8 => 'Tám', 9 => 'Chín', 10 => 'Mười',
        ];
        $decMap = [
            1 => 'một', 2 => 'hai', 3 => 'ba', 4 => 'bốn', 5 => 'năm',
            6 => 'sáu', 7 => 'bảy', 8 => 'tám', 9 => 'chín',
        ];
        $floor = (int) $diem;
        $decDigit = (int) round(($diem - $floor) * 10);
        if ($decDigit === 0) {
            return ($map[$floor] ?? $floor) . ' điểm';
        }
        return ($map[$floor] ?? $floor) . ' phẩy ' . ($decMap[$decDigit] ?? $decDigit) . ' điểm';
    }
}
