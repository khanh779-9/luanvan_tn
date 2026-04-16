<?php

namespace App\Http\Controllers;

use App\Models\SinhVien;
use App\Models\TopicRegistrationForm;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\GiangVien;

class TopicRegistrationFormController extends Controller
{

    /**
     * Duyệt bản đăng ký đề tài và tạo bản ghi vào bảng detai
     */
    public function approve($id)
    {
        $form = TopicRegistrationForm::findOrFail($id);
        if ($form->status === 'da_duyet') {
            return response()->json(['message' => 'Bản đăng ký đã được duyệt trước đó!'], 400);
        }

        // Tạo đề tài mới
        $deTai = \App\Models\DeTai::create([
            'tenDeTai' => $form->topic_title,
            'moTa' => $form->topic_description,
            'maGV_HD' => $form->gvhd_code,
            'maGV_PB' => $form->gvpb_code,
            'maHoiDong' => null,
            'trangThai' => 'dat',
            'diemGiuaKy' => null,
            'trangThaiGiuaKy' => null,
            'nhanXetGiuaKy' => null,
            'diemHuongDan' => null,
            'nhanXetHuongDan' => null,
            'diemPhanBien' => null,
            'nhanXetPhanBien' => null,
            'diemHoiDong' => null,
            'diemTongKet' => null,
        ]);

        // Cập nhật trạng thái
        $form->status = 'da_duyet';
        $form->save();

        return response()->json([
            'message' => 'Đã duyệt và tạo đề tài thành công!',
            'de_tai' => $deTai,
        ]);
    }
    public function index(Request $request)
    {
        $query = TopicRegistrationForm::query();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('student1_id', 'like', "%$s%")
                    ->orWhere('student1_name', 'like', "%$s%")
                    ->orWhere('student2_id', 'like', "%$s%")
                    ->orWhere('student2_name', 'like', "%$s%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest('registered_at')->paginate(20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'topic_title' => 'required|string|max:255',
            'topic_description' => 'nullable|string',
            'topic_type' => 'required|in:mot_sinh_vien,hai_sinh_vien',
            'student1_id' => 'required|string|max:20',
            'student1_name' => 'required|string|max:255',
            'student1_class' => 'required|string|max:50',
            'student1_email' => 'nullable|email|max:255',
            'student2_id' => 'nullable|string|max:20',
            'student2_name' => 'nullable|string|max:255',
            'student2_class' => 'nullable|string|max:50',
            'student2_email' => 'nullable|email|max:255',
            'gvhd_code' => 'nullable|string|max:20',
            'gvpb_code' => 'nullable|string|max:20',
            'gvhd_workplace' => 'nullable|string|max:255',
            'note' => 'nullable|string',
            'status' => 'nullable|in:cho_duyet,da_duyet,tu_choi',
            'source' => 'nullable|string|max:50',
        ]);

        $form = TopicRegistrationForm::create($data);

        \App\Models\SinhVien::firstOrCreate(
            ['mssv' => $data['student1_id']],
            [
                'hoTen' => $data['student1_name'],
                'lop' => $data['student1_class'],
                'email' => $data['student1_email'] ?? null
            ]
        );
        if (!empty($data['student2_id'])) {
            \App\Models\SinhVien::firstOrCreate(
                ['mssv' => $data['student2_id']],
                [
                    'hoTen' => $data['student2_name'] ?? '',
                    'lop' => $data['student2_class'] ?? null,
                    'email' => $data['student2_email'] ?? null
                ]
            );
        }

        return response()->json(['data' => $form], 201);
    }

    public function update(Request $request, $id)
    {
        $form = TopicRegistrationForm::findOrFail($id);

        $data = $request->validate([
            'topic_title' => 'sometimes|required|string|max:255',
            'topic_description' => 'nullable|string',
            'topic_type' => 'sometimes|required|in:mot_sinh_vien,hai_sinh_vien',
            'student1_id' => 'sometimes|required|string|max:20',
            'student1_name' => 'sometimes|required|string|max:255',
            'student1_class' => 'sometimes|required|string|max:50',
            'student1_email' => 'nullable|email|max:255',
            'student2_id' => 'nullable|string|max:20',
            'student2_name' => 'nullable|string|max:255',
            'student2_class' => 'nullable|string|max:50',
            'student2_email' => 'nullable|email|max:255',
            'gvhd_code' => 'nullable|string|max:20',
            'gvpb_code' => 'nullable|string|max:20',
            'gvhd_workplace' => 'nullable|string|max:255',
            'note' => 'nullable|string',
            'status' => 'nullable|in:cho_duyet,da_duyet,tu_choi',
            'source' => 'nullable|string|max:50',
        ]);

        $form->update($data);

        return response()->json(['data' => $form]);
    }

    public function destroy($id)
    {
        $form = TopicRegistrationForm::findOrFail($id);
        $form->delete();

        return response()->json(['message' => 'Da xoa']);
    }

    public function importExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls',
        ]);

        DB::beginTransaction();

        try {
            $spreadsheet = IOFactory::load($request->file('file')->getPathname());

            $imported = 0;
            $errors = [];

            // =========================
            // SHEET 1: DSSV_ĐK_HƯỚNG ĐỀ TÀI
            // Header ở dòng 7
            // =========================
            $sheet1 = $spreadsheet->getSheetByName('DSSV_ĐK_HƯỚNG ĐỀ TÀI');
            if ($sheet1) {
                $rows = $sheet1->toArray(null, true, true, false);

                if (count($rows) >= 7) {
                    $header = $rows[6]; // dòng 7

                    $idx = [
                        'mssv' => $this->findHeaderIndex($header, ['MSSV']),
                        'hoTen' => $this->findHeaderIndex($header, ['HỌ TÊN SINH VIÊN']),
                        'lop' => $this->findHeaderIndex($header, ['LỚP']),
                        'gvhd' => $this->findHeaderIndex($header, ['GVHD']),
                        'hh_hv' => $this->findHeaderIndex($header, ['HH-HV']),
                        'gvhd_workplace' => $this->findHeaderIndex($header, ['Nơi công tác']),
                        'tenDeTai' => $this->findHeaderIndex($header, ['Tên đề tài']),
                        'ghiChu' => $this->findHeaderIndex($header, ['GHI CHÚ']),
                    ];

                    if ($idx['mssv'] === null || $idx['hoTen'] === null) {
                        $errors[] = [
                            'sheet' => 'DSSV_ĐK_HƯỚNG ĐỀ TÀI',
                            'message' => 'Không tìm thấy cột MSSV hoặc HỌ TÊN SINH VIÊN',
                        ];
                    } else {
                        for ($i = 7; $i < count($rows); $i++) {
                            $row = $rows[$i];
                            if (!$this->rowHasData($row)) {
                                continue;
                            }

                            $mssv = $this->normalizeExcelText($row[$idx['mssv']] ?? '');
                            // Họ tên bị tách 2 cột liền kề — nối lại
                            $hoTenCol = $idx['hoTen'];
                            $hoTen = trim($this->normalizeExcelText($row[$hoTenCol] ?? '') . ' ' . $this->normalizeExcelText($row[$hoTenCol + 1] ?? ''));
                            $lop = $idx['lop'] !== null ? $this->normalizeExcelText($row[$idx['lop']] ?? '') : '';
                            $gvhd = $idx['gvhd'] !== null ? $this->normalizeExcelText($row[$idx['gvhd']] ?? '') : '';
                            $hhHv = $idx['hh_hv'] !== null ? $this->normalizeExcelText($row[$idx['hh_hv']] ?? '') : '';
                            $gvhdWorkplace = $idx['gvhd_workplace'] !== null ? $this->normalizeExcelText($row[$idx['gvhd_workplace']] ?? '') : '';
                            $tenDeTai = $idx['tenDeTai'] !== null ? $this->normalizeExcelText($row[$idx['tenDeTai']] ?? '') : '';
                            $ghiChu = $idx['ghiChu'] !== null ? $this->normalizeExcelText($row[$idx['ghiChu']] ?? '') : '';

                            if ($mssv === '' || $hoTen === '') {
                                continue;
                            }

                            SinhVien::updateOrCreate(
                                ['mssv' => $mssv],
                                [
                                    'hoTen' => $hoTen,
                                    'lop' => $lop !== '' ? $lop : null,
                                ]
                            );
                            $maGvHd = null;
                            if ($gvhd !== '') {
                                // Tìm Giảng viên trong DB dựa vào tên
                                $giangVien = GiangVien::where('tenGV', 'LIKE', '%' . $gvhd . '%')->first();
                                if ($giangVien) {
                                    $maGvHd = $giangVien->maGV; // Lấy ra mã GV
                                } else {
                                    // Ghi log lại nếu không tìm thấy thầy cô
                                    $ghiChu = $ghiChu . ' (Lỗi: Không tìm thấy mã GV cho ' . $gvhd . ')';
                                }
                            }
                            $noteParts = array_filter([
                                $hhHv !== '' ? 'HH-HV: ' . $hhHv : null,
                                $ghiChu !== '' ? 'Ghi chú: ' . $ghiChu : null,
                            ]);

                            TopicRegistrationForm::updateOrCreate(
                                [
                                    'topic_type' => 'mot_sinh_vien',
                                    'student1_id' => $mssv,
                                ],
                                [
                                    'topic_title' => $tenDeTai !== '' ? $tenDeTai : 'Chưa có tiêu đề',
                                    'topic_description' => null,
                                    'topic_type' => 'mot_sinh_vien',
                                    'student1_id' => $mssv,
                                    'student1_name' => $hoTen,
                                    'student1_class' => $lop !== '' ? $lop : 'Không rõ',
                                    'student1_email' => null,
                                    'student2_id' => null,
                                    'student2_name' => null,
                                    'student2_class' => null,
                                    'student2_email' => null,
                                    'gvhd_code' => $maGvHd,
                                    'gvhd_workplace' => $gvhdWorkplace !== '' ? $gvhdWorkplace : null,
                                    'gvpb_code' => null,
                                    'note' => count($noteParts) ? implode(' | ', $noteParts) : ($gvhd !== '' ? 'GVHD: ' . $gvhd : null),
                                    'status' => 'cho_duyet',
                                    'source' => 'excel_import_sheet1',
                                ]
                            );

                            $imported++;
                        }
                    }
                }
            }

            // =========================
            // SHEET 2: SVĐK_TheoLink
            // Header ở dòng 1
            // =========================
            $sheet2 = $spreadsheet->getSheetByName('SVĐK_TheoLink');
            if ($sheet2) {
                $rows = $sheet2->toArray(null, true, true, false);

                if (count($rows) >= 1) {
                    $header = $rows[0];
                    $idx = [
                        'timestamp' => $this->findHeaderIndex($header, ['Timestamp']),
                        'email' => $this->findHeaderIndex($header, ['Email Address']),
                        'hoTen1' => $this->findHeaderIndex($header, ['Họ và tên sinh viên 1']),
                        'lop1' => $this->findHeaderIndex($header, ['Lớp sinh viên 1']),
                        'mssv1' => $this->findHeaderIndex($header, ['Mã sinh viên 1']),
                        'sdt1' => $this->findHeaderIndex($header, ['Số điện thoại sinh viên 1']),
                        'soNhom' => $this->findHeaderIndex($header, ['Số Nhóm']),
                        'lamChungNhom' => $this->findHeaderIndex($header, ['Có làm chung nhóm với sinh viên khác không?']),
                    ];

                    if ($idx['mssv1'] === null || $idx['hoTen1'] === null) {
                        $errors[] = [
                            'sheet' => 'SVĐK_TheoLink',
                            'message' => 'Không tìm thấy cột Mã sinh viên 1 hoặc Họ và tên sinh viên 1',
                        ];
                    } else {
                        $groups = [];

                        for ($i = 1; $i < count($rows); $i++) {
                            $row = $rows[$i];
                            if (!$this->rowHasData($row)) {
                                continue;
                            }

                            $groupKey = '__row_' . $i;
                            if ($idx['soNhom'] !== null) {
                                $groupVal = $this->normalizeExcelText($row[$idx['soNhom']] ?? '');
                                if ($groupVal !== '') {
                                    $groupKey = $groupVal;
                                }
                            }

                            $groups[$groupKey][] = [
                                'row' => $row,
                                'row_num' => $i + 1,
                            ];
                        }

                        foreach ($groups as $groupKey => $groupRows) {
                            $students = [];

                            foreach ($groupRows as $item) {
                                $row = $item['row'];

                                $mssv1 = $this->normalizeExcelText($row[$idx['mssv1']] ?? '');
                                $hoTen1 = $this->normalizeExcelText($row[$idx['hoTen1']] ?? '');
                                $lop1 = $idx['lop1'] !== null ? $this->normalizeExcelText($row[$idx['lop1']] ?? '') : '';
                                $email = $idx['email'] !== null ? $this->normalizeExcelText($row[$idx['email']] ?? '') : '';
                                $sdt1 = $idx['sdt1'] !== null ? $this->normalizeExcelText($row[$idx['sdt1']] ?? '') : '';
                                $lamChungNhom = $idx['lamChungNhom'] !== null ? $this->normalizeExcelText($row[$idx['lamChungNhom']] ?? '') : '';
                                $timestamp = $idx['timestamp'] !== null ? $this->normalizeExcelText($row[$idx['timestamp']] ?? '') : '';

                                if ($mssv1 === '' || $hoTen1 === '') {
                                    continue;
                                }

                                $students[] = [
                                    'mssv' => $mssv1,
                                    'hoTen' => $hoTen1,
                                    'lop' => $lop1,
                                    'email' => $email,
                                    'sdt' => $sdt1,
                                    'lamChungNhom' => $lamChungNhom,
                                    'timestamp' => $timestamp,
                                ];
                            }

                            // loại trùng mssv trong cùng group
                            $seen = [];
                            $students = array_values(array_filter($students, function ($sv) use (&$seen) {
                                if (isset($seen[$sv['mssv']])) {
                                    return false;
                                }
                                $seen[$sv['mssv']] = true;
                                return true;
                            }));

                            $count = count($students);
                            if ($count === 0) {
                                continue;
                            }

                            if ($count > 2) {
                                $errors[] = [
                                    'sheet' => 'SVĐK_TheoLink',
                                    'group' => $groupKey,
                                    'message' => 'Nhóm có nhiều hơn 2 sinh viên, bỏ qua',
                                ];
                                continue;
                            }

                            usort($students, fn($a, $b) => strcmp($a['mssv'], $b['mssv']));

                            foreach ($students as $sv) {
                                SinhVien::updateOrCreate(
                                    ['mssv' => $sv['mssv']],
                                    [
                                        'hoTen' => $sv['hoTen'],
                                        'lop' => $sv['lop'] !== '' ? $sv['lop'] : null,
                                        'email' => $sv['email'] !== '' ? $sv['email'] : null,
                                    ]
                                );
                            }

                            $registeredAt = null;
                            if (isset($students[0]['timestamp']) && $students[0]['timestamp'] !== '') {
                                try {
                                    $registeredAt = Carbon::parse($students[0]['timestamp']);
                                } catch (\Throwable $e) {
                                    $registeredAt = null;
                                }
                            }

                            if ($count === 1) {
                                $sv = $students[0];

                                $noteParts = array_filter([
                                    $sv['sdt'] !== '' ? 'SĐT: ' . $sv['sdt'] : null,
                                    $sv['lamChungNhom'] !== '' ? 'Làm chung nhóm: ' . $sv['lamChungNhom'] : null,
                                ]);

                                TopicRegistrationForm::updateOrCreate(
                                    [
                                        'topic_type' => 'mot_sinh_vien',
                                        'student1_id' => $sv['mssv'],
                                    ],
                                    [
                                        'topic_title' => 'Đăng ký từ SVĐK_TheoLink - ' . $sv['mssv'],
                                        'topic_description' => null,
                                        'topic_type' => 'mot_sinh_vien',
                                        'student1_id' => $sv['mssv'],
                                        'student1_name' => $sv['hoTen'],
                                        'student1_class' => $sv['lop'] !== '' ? $sv['lop'] : 'Không rõ',
                                        'student1_email' => $sv['email'] !== '' ? $sv['email'] : null,
                                        'student2_id' => null,
                                        'student2_name' => null,
                                        'student2_class' => null,
                                        'student2_email' => null,
                                        'gvhd_code' => null,
                                        'gvhd_workplace' => null,
                                        'gvpb_code' => null,
                                        'note' => count($noteParts) ? implode(' | ', $noteParts) : null,
                                        'status' => 'cho_duyet',
                                        'source' => 'excel_import_sheet2',
                                        'registered_at' => $registeredAt,
                                    ]
                                );

                                $imported++;
                            } elseif ($count === 2) {
                                $sv1 = $students[0];
                                $sv2 = $students[1];

                                $noteParts = array_filter([
                                    $sv1['sdt'] !== '' ? 'SĐT1: ' . $sv1['sdt'] : null,
                                    $sv2['sdt'] !== '' ? 'SĐT2: ' . $sv2['sdt'] : null,
                                    $sv1['lamChungNhom'] !== '' ? 'Làm chung nhóm: ' . $sv1['lamChungNhom'] : null,
                                ]);

                                TopicRegistrationForm::updateOrCreate(
                                    [
                                        'topic_type' => 'hai_sinh_vien',
                                        'student1_id' => $sv1['mssv'],
                                        'student2_id' => $sv2['mssv'],
                                    ],
                                    [
                                        'topic_title' => 'Đăng ký từ SVĐK_TheoLink - ' . $sv1['mssv'] . ' - ' . $sv2['mssv'],
                                        'topic_description' => null,
                                        'topic_type' => 'hai_sinh_vien',
                                        'student1_id' => $sv1['mssv'],
                                        'student1_name' => $sv1['hoTen'],
                                        'student1_class' => $sv1['lop'] !== '' ? $sv1['lop'] : 'Không rõ',
                                        'student1_email' => $sv1['email'] !== '' ? $sv1['email'] : null,
                                        'student2_id' => $sv2['mssv'],
                                        'student2_name' => $sv2['hoTen'],
                                        'student2_class' => $sv2['lop'] !== '' ? $sv2['lop'] : 'Không rõ',
                                        'student2_email' => $sv2['email'] !== '' ? $sv2['email'] : null,
                                        'gvhd_code' => null,
                                        'gvhd_workplace' => null,
                                        'gvpb_code' => null,
                                        'note' => count($noteParts) ? implode(' | ', $noteParts) : null,
                                        'status' => 'cho_duyet',
                                        'source' => 'excel_import_sheet2',
                                        'registered_at' => $registeredAt,
                                    ]
                                );

                                $imported++;
                            }
                        }
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'imported' => $imported,
                'errors' => $errors,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Import Excel thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function normalizeExcelText($value): string
    {
        $value = is_null($value) ? '' : (string) $value;
        $value = preg_replace("/\r?\n/u", ' ', $value);
        $value = preg_replace('/\s+/u', ' ', $value);
        return trim($value);
    }

    private function findHeaderIndex(array $header, array $needles): ?int
    {
        foreach ($header as $i => $col) {
            $col = $this->normalizeExcelText($col);
            foreach ($needles as $needle) {
                if (stripos($col, $needle) !== false) {
                    return $i;
                }
            }
        }
        return null;
    }

    private function rowHasData(array $row): bool
    {
        foreach ($row as $cell) {
            if ($this->normalizeExcelText($cell) !== '') {
                return true;
            }
        }
        return false;
    }
}
