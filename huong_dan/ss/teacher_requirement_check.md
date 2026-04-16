# Đối chiếu repo với yêu cầu thầy

> Ngày: 2026-03-31
> Mục đích: Kiểm tra repo QuanLy_LuanVan_TN có đáp ứng yêu cầu của thầy Trần Văn Hùng hay không

---

## Nguồn yêu cầu

Có 3 nguồn tài liệu:

| Nguồn | File | Loại |
|-------|------|------|
| Projects.docx / intro_kernel.txt | Yêu cầu GỐC từ thầy | Thầy viết |
| intro.txt | Yêu cầu chi tiết hoá (modules, pages, flow) | Nhóm viết, mở rộng từ yêu cầu thầy |
| intro2.txt | Báo cáo LVTN (report) | Nhóm viết, tự đánh giá "Đạt" |

**Quan trọng**: intro2.txt là report do nhóm tự viết, tự khai "Đạt" cho hầu hết mục. Cần đối chiếu với CODE THỰC TẾ, không dựa vào lời khai của nhóm.

---

## 1. Đối chiếu yêu cầu thầy (Projects.docx) vs Code thực tế

### 1.1. Vai trò (Actors)

| Yêu cầu thầy | Code thực tế | Đáp ứng? |
|---------------|-------------|----------|
| **Thư ký khoa (Admin)** — toàn quyền hệ thống | Admin login bằng `Cache::get('legacy_admin_password', '123')` — hardcode, không có bảng admin riêng | ⚠️ Có nhưng sơ sài |
| **GVHD** — nhận SV, giao đề tài, chấm điểm | GV đăng nhập được, có trang chấm điểm HD | ⚠️ Có nhưng không phân biệt GVHD vs GV thường — mọi GV đều thấy hết |
| **GVPB** — nhận đề tài phản biện, chấm điểm PB | Có route chấm PB, nhưng không phân quyền — GV nào cũng chấm được | ⚠️ Có nhưng không kiểm soát quyền |
| **Sinh viên** — xem thông tin, in form nhiệm vụ | **KHÔNG CÓ** — SV không login được, không có trang SV | ❌ KHÔNG |

**Kết luận vai trò**: Hệ thống chỉ thực sự hỗ trợ 2 actors (Admin + GV chung). Thiếu SV hoàn toàn. GV không phân biệt GVHD vs GVPB — ai đăng nhập cũng thấy tất cả.

---

### 1.2. Chức năng Thư ký khoa (Admin)

#### a) Import DSSV từ Excel

| Yêu cầu | Code |
|----------|------|
| Thầy: "Khoa nhận DSSV được làm LVTN từ P Đào tạo (excel)" | Route `POST /students/import-excel` tồn tại nhưng trả về `501 Not Implemented` |

```php
// api.php dòng 751
Route::post('/students/import-excel', function (Request $request) {
    return response()->json(['message' => 'Not implemented yet.'], 501);
});
```

**Kết luận: ❌ CHƯA LÀM** — Package `phpoffice/phpspreadsheet` đã cài nhưng chưa viết code import.

---

#### b) Thiết lập thời gian LVTN

| Yêu cầu | Code |
|----------|------|
| Thầy: "Thiết lập các thời gian làm LVTN (như các mục bên dưới)" | Bảng `cauhinh` có 2 trường: `trangThaiChamGK` (boolean) và `giaiDoan` (int 1-5) |

```php
// api.php
Route::put('/settings/stage', function (Request $request) {
    $setting = Setting::firstOrFail();
    $setting->giaiDoan = $request->input('giaiDoan');
    $setting->save();
});
```

**Thầy yêu cầu**: Thiết lập thời gian cụ thể — thời gian nhận đề tài, thời gian chấm 50%, thời gian phản biện, ngày bảo vệ.

**Code thực tế**: Chỉ có 1 biến `giaiDoan` (1-5) để chuyển giai đoạn, KHÔNG có mốc ngày cụ thể.

**Kết luận: ⚠️ CÓ NHƯNG THIẾU** — Có khái niệm giai đoạn nhưng không có timeline/mốc ngày. Admin chỉ chuyển số (1→2→3→4→5) chứ không set ngày bắt đầu/kết thúc.

---

#### c) Phân công SV cho GVHD

| Yêu cầu | Code |
|----------|------|
| Thầy: "Khoa phân công sv cho GVHD (1 gv từ 1-10 sv)" | Route `POST /topics/create-group-assign` — tạo đề tài + gán SV + gán GVHD |

```php
// api.php dòng ~495
Route::post('/topics/create-group-assign', function (Request $request) {
    $validated = $request->validate([
        'tenDeTai' => 'required|string',
        'maGV_HD' => 'required|exists:giangvien,maGV',
        'students' => 'required|array|min:1|max:2',
        'students.*' => 'required|exists:sinhvien,mssv',
    ]);
    $topic = Topic::create([...]);
    Student::whereIn('mssv', $validated['students'])->update(['maDeTai' => $topic->maDeTai]);
});
```

**Kiểm tra giới hạn 10 SV/GV**: KHÔNG — code không check xem GV đã có bao nhiêu SV.

**Kết luận: ⚠️ CÓ NHƯNG THIẾU** — Phân công được nhưng không kiểm tra giới hạn 10 SV/GV.

---

#### d) Nhận kết quả nhận đề tài

| Yêu cầu | Code |
|----------|------|
| Thầy: "Nhận kết quả nhận đề tài" | Có danh sách đề tài, có trạng thái giữa kỳ (`trangThaiGiuaKy`: Được làm tiếp / Đình chỉ / Cảnh cáo) |

**Kết luận: ⚠️ CÓ PHẦN NÀO** — Có danh sách + trạng thái nhưng flow "nhận kết quả" không rõ ràng.

---

#### e) In công bố kết quả 50% LVTN

| Yêu cầu | Code |
|----------|------|
| Thầy: "In công bố kết quả 50% LVTN" | Route `GET /exports/midterm` trả 501 |

```php
Route::get('/exports/midterm', function () {
    return response()->json(['message' => 'Not implemented yet.'], 501);
});
```

**Kết luận: ❌ CHƯA LÀM**

---

#### f) Phân công đề tài cho GV Phản biện

| Yêu cầu | Code |
|----------|------|
| Thầy: "Khoa Phân công các đề tài cho GV Phản biện" | Topic có trường `maGV_PB`, có thể update qua `PUT /topics/{topic}` |

**Kết luận: ✅ CÓ** — Admin cập nhật `maGV_PB` cho từng đề tài.

---

#### g) Lập Hội đồng bảo vệ LVTN

| Yêu cầu | Code |
|----------|------|
| Thầy: "Mỗi hội đồng có: Ngày Bảo vệ, phòng, số hội đồng, danh sách 3-4 GV: 1 chủ tịch, 1 thư ký và các thành viên" | Bảng `hoidong` có `tenHoiDong`, `diaDiem`. Bảng `thanhvienhoidong` có `maGV`, `vaiTro` (ChuTich/ThuKy/UyVien) |

Thiếu: **Ngày Bảo vệ** — bảng `hoidong` KHÔNG có trường `ngayBaoVe`.

```sql
CREATE TABLE `hoidong` (
  `maHoiDong` int NOT NULL AUTO_INCREMENT,
  `tenHoiDong` varchar(255) NOT NULL,
  `diaDiem` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`maHoiDong`)
)
```

**Kết luận: ⚠️ CÓ NHƯNG THIẾU** — Có hội đồng + thành viên + vai trò, nhưng thiếu ngày bảo vệ.

---

#### h) Phân công đề tài vào hội đồng (có thứ tự)

| Yêu cầu | Code |
|----------|------|
| Thầy: "Khoa Phân công các đề tài vào hội đồng (có thứ tự)" | Route `POST /topics/assign-hoidong` gán `maHoiDong` cho topic |

Thiếu: **Thứ tự** — code chỉ gán hội đồng, không có trường `thuTu` (order) để sắp xếp thứ tự trình bày.

```php
Route::post('/topics/assign-hoidong', function (Request $request) {
    $validated = $request->validate([
        'maDeTai' => 'required|exists:detai,maDeTai',
        'maHoiDong' => 'required|exists:hoidong,maHoiDong',
    ]);
    Topic::where('maDeTai', $validated['maDeTai'])
        ->update(['maHoiDong' => $validated['maHoiDong']]);
});
```

**Kết luận: ⚠️ CÓ NHƯNG THIẾU** — Gán được nhưng không có thứ tự trình bày.

---

#### i) Xuất danh sách bảo vệ LVTN

| Yêu cầu | Code |
|----------|------|
| Thầy: "Xuất danh sách bảo vệ LVTN" | Không có route nào cho việc này |

**Kết luận: ❌ CHƯA LÀM**

---

### 1.3. Chức năng GVHD

#### a) Nhận danh sách SV hướng dẫn

| Yêu cầu | Code |
|----------|------|
| Thầy: "Nhận danh sách SV hướng dẫn" | `GET /topics` trả tất cả topics, FE có thể filter nhưng API KHÔNG filter theo GV đăng nhập |

Scope trong model:
```php
public function scopeForUser($query, $user)
{
    return $query; // KHÔNG FILTER GÌ CẢ
}
```

**Kết luận: ⚠️ THIẾU** — GV đăng nhập thấy TẤT CẢ đề tài, không chỉ đề tài mình hướng dẫn.

---

#### b) Giao đề tài (nhóm 2 hoặc 1 SV)

| Yêu cầu | Code |
|----------|------|
| Thầy: "Đề tài có thể chọn làm theo nhóm 2 hay 1 sinh viên" | `POST /topics/create-group-assign` hỗ trợ `students` array min:1 max:2 |

**Kết luận: ✅ CÓ**

---

#### c) Đánh giá 50%

| Yêu cầu | Code |
|----------|------|
| Thầy: "Đánh giá 50%" | Có chấm giữa kỳ — trường `diemGiuaKy`, `trangThaiGiuaKy`, `nhanXetGiuaKy` trong bảng `detai` |

**Kết luận: ✅ CÓ**

---

#### d) Chấm điểm hướng dẫn → xuất file Word

| Yêu cầu | Code |
|----------|------|
| Thầy: "Chấm điểm hướng dẫn -> xuất file word để in" | Chấm: `POST /topics/{topic}/score-gvhd` — CÓ. Export: `GET /exports/word/gvhd/{topic}` — trả 501 |
| Mẫu 01.01 (nhóm SV) | ❌ Chưa export |
| Mẫu 01.02 (1 SV) | ❌ Chưa export |

**Kết luận: ⚠️ Chấm điểm CÓ, export Word ❌ CHƯA LÀM**

---

### 1.4. Chức năng GVPB

#### a) Nhận danh sách phản biện

| Yêu cầu | Code |
|----------|------|
| Thầy: "Nhận danh sách phản biện" | API trả tất cả, không filter theo GVPB đăng nhập |

**Kết luận: ⚠️ THIẾU** — Không phân biệt

---

#### b) Chấm điểm → xuất file Word

| Yêu cầu | Code |
|----------|------|
| Thầy: "Chấm điểm -> xuất file word" | Chấm: `POST /topics/{topic}/score-gvpb` — CÓ. Export: `GET /exports/word/gvpb/{topic}` — trả 501 |
| Mẫu 02.01 (nhóm SV) | ❌ Chưa export |
| Mẫu 02.02 (1 SV) | ❌ Chưa export |

**Kết luận: ⚠️ Chấm CÓ, export ❌ CHƯA LÀM**

---

### 1.5. Chức năng Sinh viên

#### a) In tờ nhiệm vụ

| Yêu cầu | Code |
|----------|------|
| Thầy: "SV: in ra tờ nhiệm vụ để đóng vào cuốn báo cáo" | Không có route, không có trang, SV không login được |
| Form_NhiemvuLVTN.doc | ❌ Chưa tích hợp |

**Kết luận: ❌ HOÀN TOÀN CHƯA LÀM**

---

### 1.6. Kỹ thuật

| Yêu cầu thầy | Code thực tế | Đáp ứng? |
|---------------|-------------|----------|
| "Xây dựng web - MVC" | Laravel (MVC) + React (SPA) — đúng pattern | ✅ |
| "Phương án 2: Be: Laravel - Fe: React" | Laravel API + React + Vite | ✅ |
| "Dựng Laravel" | Laravel 12 | ✅ |
| "Import from excel, export to excel" | Package cài rồi, code trả 501 | ❌ |
| "Export data ra template .docx" | Package cài rồi, code trả 501 | ❌ |
| "Hỗ trợ hosting Laravel. Nhóm đk domain" | Deploy trên Render + Vercel, có link chạy | ✅ |

---

## 2. Đối chiếu yêu cầu chi tiết (intro.txt) vs Code thực tế

File `intro.txt` do nhóm viết, chi tiết hoá từ yêu cầu thầy. Kiểm tra thêm:

### 2.1. Modules (từ intro.txt)

| Module | Yêu cầu | Code | Đáp ứng? |
|--------|----------|------|----------|
| Auth | Login, Forgot password | Login CÓ. Forgot password KHÔNG | ⚠️ |
| User Management | CRUD user, Role (admin, gvhd, gvpb, sv) | CRUD GV có. Role system KHÔNG (chỉ dùng vai trò hội đồng) | ⚠️ |
| Student | Import Excel, Danh sách SV | Import 501. Danh sách CÓ | ⚠️ |
| Lecturer | Danh sách GV | CÓ | ✅ |
| Assignment | Phân công GVHD, Phân công GVPB | GVHD CÓ. GVPB thông qua update topic | ⚠️ |
| Topic | Tạo đề tài, Gán SV | CÓ | ✅ |
| Evaluation | Chấm điểm GVHD, Chấm phản biện | CÓ | ✅ |
| Council | Tạo hội đồng, Thêm thành viên | CÓ | ✅ |
| Defense Schedule | Xếp lịch bảo vệ | KHÔNG — thiếu ngày bảo vệ, thiếu thứ tự | ❌ |
| Export | Xuất docx, Xuất excel | TẤT CẢ trả 501 | ❌ |

### 2.2. Pages (từ intro.txt)

| # | Page | Yêu cầu | Code | Đáp ứng? |
|---|------|---------|------|----------|
| 1 | Login Page | Email + Password | Có — dùng maGV + matKhau | ✅ |
| 2 | Dashboard | Tổng SV, Tổng đề tài, Tiến độ | CÓ — Dashboard.jsx ~11KB | ✅ |
| 3 | Quản lý sinh viên | List, Import Excel, Filter | List CÓ. Import 501. Filter cơ bản | ⚠️ |
| 4 | Phân công GVHD | DS SV chưa có GV, Dropdown chọn GV | Assignment.jsx — CÓ | ✅ |
| 5 | Quản lý đề tài | List + Form CRUD | TopicManagement.jsx — CÓ | ✅ |
| 6 | Trang GVHD | DS SV hướng dẫn, Button giao đề tài + chấm điểm | Không có trang riêng cho GVHD — tất cả chung 1 giao diện | ❌ |
| 7 | Chấm điểm GVHD | Form 5 tiêu chí, Export doc Mẫu 01 | Chấm CÓ (4 tiêu chí). Export 501 | ⚠️ |
| 8 | Trang GVPB | DS đề tài PB, Button chấm điểm | Không có trang riêng GVPB | ❌ |
| 9 | Chấm phản biện | Form tiêu chí + điểm + nhận xét, Export Mẫu 02 | Chấm CÓ. Export 501 | ⚠️ |
| 10 | Quản lý hội đồng | List + Form (chủ tịch, thư ký, thành viên) | Council.jsx — CÓ | ✅ |
| 11 | Xếp lịch bảo vệ | Drag & drop, Gán đề tài → HĐ | Gán CÓ. Drag & drop KHÔNG. Thứ tự KHÔNG | ⚠️ |
| 12 | Trang Sinh viên | Xem đề tài, Download tờ nhiệm vụ | HOÀN TOÀN KHÔNG CÓ | ❌ |

---

## 3. Đối chiếu report nhóm (intro2.txt) vs Code thực tế

Nhóm tự đánh giá "Đạt" cho hầu hết mục trong bảng 5.1 (Chương 5). Kiểm chứng:

### 3.1. Kết quả cần đạt (Mục 1.4 intro2.txt)

| # | Kết quả | Nhóm tự khai | Thực tế code |
|---|---------|-------------|-------------|
| 1 | **CSDL đạt chuẩn 3NF**, đủ FK, utf8mb4 | *(không khai rõ)* | ❌ **KHÔNG ĐẠT** — Bảng `detai` gộp 20 cột (vi phạm normalization). Bảng `diem` tồn tại nhưng không dùng. Thiếu bảng admin, thiếu bảng đợt LVTN. Dùng lẫn MyISAM + InnoDB. Không dùng Laravel migrations |
| 2 | **Phân quyền chính xác 3 vai trò** (Admin, GV, SV). Ngăn truy cập trái phép qua URL. Session ổn định | *(không khai rõ)* | ❌ **KHÔNG ĐẠT** — Role dùng vai trò hội đồng (ChuTich/ThuKy/UyVien) thay vì role hệ thống. Không có middleware check role trên API. Mọi route accessible sau login. SV không login được |
| 3 | **Quản lý trạng thái đề tài** theo giai đoạn (Tuần 1→7). Tự động khoá Read-only. Dashboard thống kê | *(không khai rõ)* | ⚠️ **MỘT PHẦN** — Có `giaiDoan` (1-5) nhưng không khoá tự động. Dashboard thống kê có |
| 4 | **Tính điểm tự động** (HD 20% + PB 20% + HĐ 60%). Real-time. Quy đổi điểm chữ | *(không khai rõ)* | ✅ **ĐẠT** — Công thức đúng, có quy đổi A+→F |
| 5 | **Xuất phiếu chấm Word** đúng mẫu. Xuất bảng tổng kết Excel. Không lỗi font tiếng Việt | *(không khai rõ)* | ❌ **KHÔNG ĐẠT** — Tất cả export routes trả 501 |
| 6 | **Giao diện hiện đại**, responsive, tải < 2 giây | *(không khai rõ)* | ⚠️ **MỘT PHẦN** — Có TailwindCSS, giao diện OK nhưng responsive chưa tốt |

### 3.2. Nhóm tự khai trong Chương 5

| # | Mục tiêu | Nhóm khai | Thực tế |
|---|----------|----------|---------|
| 1 | Nghiên cứu cơ sở lý thuyết | **"Đạt"** | Không liên quan code — chỉ là viết báo cáo |
| 2 | Phân hệ Admin: CRUD SV/GV, cấu hình, phân quyền | **"Đạt"** | ⚠️ **SAI** — CRUD có. Phân quyền KHÔNG CÓ. Import SV từ Excel KHÔNG CÓ |
| 3 | Phân hệ GV: đề xuất đề tài, quản lý nhóm HD, chấm điểm | **"Đạt"** | ⚠️ **MỘT PHẦN** — Chấm điểm CÓ. Nhưng GV không thấy "nhóm của mình" — thấy tất cả |
| 4 | Phân hệ SV: đăng ký đề tài, theo dõi kết quả | **"Đạt"** — "SV đăng ký/hủy đề tài theo thời gian thực. Xem được điểm" | ❌ **SAI HOÀN TOÀN** — SV không login được, không có trang SV, không xem được gì |
| 5 | Xếp lịch hội đồng | **"Đạt một phần"** | ⚠️ CÓ hội đồng nhưng thiếu ngày bảo vệ, thiếu thứ tự |
| 6 | Giao diện responsive | **"Đạt một phần"** | ⚠️ OK trên desktop, mobile chưa tốt |

---

## 4. Vấn đề nghiêm trọng: Report khai sai thực tế

### 4.1. Report khai "Đạt" nhưng code KHÔNG CÓ

| Mục report khai "Đạt" | Code thực tế |
|----------------------|-------------|
| "SV đăng ký/hủy đề tài theo thời gian thực" | SV KHÔNG THỂ đăng nhập. Không có trang SV. Không có API cho SV |
| "Xem được điểm số và nhận xét chi tiết" (SV) | Tương tự — hoàn toàn không có |
| "Phân quyền người dùng chính xác" | Role system dùng vai trò hội đồng, không có RBAC. Mọi GV đều thấy tất cả |
| "Admin có thể thêm/sửa/xóa tài khoản" | Admin chỉ CRUD GV. Không quản lý tài khoản SV (SV không có tài khoản) |

### 4.2. Report viết tính năng "tương lai" nhưng khai là "Đạt"

Report nhóm viết use case, sequence diagram, activity diagram cho các chức năng mà code CHƯA CÓ:
- Use case "Đăng nhập" cho tất cả actors → SV không login được
- Activity diagram "Quy trình thực hiện KLTN" → flow SV đăng ký đề tài không tồn tại trong code
- Thiết kế màn hình Dashboard → có, nhưng trang SV, trang GVHD riêng không có

---

## 5. Vấn đề kỹ thuật so với yêu cầu report

Report (intro2.txt) tự đặt ra tiêu chuẩn kỹ thuật cao. Đối chiếu:

| Report viết | Code thực tế | Nhận xét |
|------------|-------------|----------|
| "CSDL đạt chuẩn 3NF" | Bảng `detai` gộp 20 cột vi phạm normalization | ❌ Không đạt 3NF |
| "Đầy đủ ràng buộc khóa chính, khóa ngoại" | FK có nhưng thiếu nhiều. Dùng lẫn MyISAM (không hỗ trợ FK) | ⚠️ |
| "Mật khẩu (đã mã hóa MD5/Bcrypt)" | Mật khẩu lưu plaintext `'123'`, so sánh trực tiếp `===` | ❌ KHÔNG MÃ HOÁ |
| "Ngăn chặn SQL Injection" | Dùng Eloquent (an toàn), nhưng không liên quan vì không có RBAC | ✅ Laravel tự bảo vệ |
| "Session Management an toàn" | Token lưu file cache, mất khi restart server. Admin password lưu trong cache | ❌ |
| "Xử lý đồng thời (Concurrency)" | Không có lock/transaction cho chấm điểm đồng thời | ❌ |
| "SV bảng sinhvien có mat_khau" | Bảng `sinhvien` trong code KHÔNG CÓ trường `matKhau` | ❌ Report viết có nhưng code không có |

---

## 6. Tổng kết: Repo có đáp ứng yêu cầu thầy không?

### Bảng tổng kết

| Yêu cầu thầy | Đáp ứng | Ghi chú |
|---------------|---------|---------|
| 4 vai trò (Admin, GVHD, GVPB, SV) | ❌ | Chỉ có Admin + GV chung. SV hoàn toàn không có |
| Import DSSV từ Excel | ❌ | Route trả 501 |
| Thiết lập thời gian LVTN | ⚠️ | Chỉ có số giai đoạn, không có mốc ngày |
| Phân công SV cho GVHD (max 10) | ⚠️ | Phân công được nhưng không check giới hạn 10 |
| Nhận kết quả nhận đề tài | ⚠️ | Có danh sách nhưng flow chưa rõ |
| In công bố kết quả 50% | ❌ | 501 |
| Phân công GVPB | ✅ | Cập nhật maGV_PB |
| Lập hội đồng | ⚠️ | Có nhưng thiếu ngày bảo vệ |
| Phân công đề tài vào HĐ (có thứ tự) | ⚠️ | Gán được nhưng không có thứ tự |
| Xuất danh sách bảo vệ | ❌ | Không có |
| GVHD giao đề tài (1-2 SV) | ✅ | OK |
| GVHD đánh giá 50% | ✅ | OK |
| GVHD chấm + export Word (Mẫu 01) | ⚠️ | Chấm CÓ, export ❌ |
| GVPB chấm + export Word (Mẫu 02) | ⚠️ | Chấm CÓ, export ❌ |
| SV in tờ nhiệm vụ (Form_NhiemvuLVTN) | ❌ | Hoàn toàn chưa có |
| Laravel MVC | ✅ | OK |
| Import/Export Excel | ❌ | Package cài, code 501 |
| Export template .docx | ❌ | Package cài, code 501 |

### Thống kê

```
✅ Đạt:          4 / 18  (22%)
⚠️ Một phần:     7 / 18  (39%)
❌ Không đạt:     7 / 18  (39%)
```

### Kết luận

**KHÔNG — repo KHÔNG đáp ứng yêu cầu thầy.**

Cụ thể:
1. **Module SV hoàn toàn không có** — đây là 1 trong 4 actors chính
2. **Import/Export (core feature) chưa làm** — tất cả trả 501
3. **Phân quyền sai** — dùng vai trò hội đồng thay vì role hệ thống
4. **Mật khẩu plaintext** — vi phạm yêu cầu bảo mật cơ bản
5. **Report khai không đúng thực tế** — khai "Đạt" cho phân hệ SV nhưng code không có

Phần **đã làm được**:
- CRUD cơ bản (GV, SV, đề tài, hội đồng)
- Chấm điểm (HD, PB, HĐ) với công thức đúng
- Deploy được lên cloud
- Giao diện FE cơ bản

Phần **thiếu nghiêm trọng**:
- Module SV (login, xem, in form)
- Import/Export (Excel + Word)
- Phân quyền RBAC
- Bảo mật (password hash)
- Quản lý timeline/mốc thời gian
