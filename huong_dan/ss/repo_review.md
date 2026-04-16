# Review chi tiết repo QuanLy_LuanVan_TN

> Ngày review: 2026-03-31
> Repo: https://github.com/khanh779-9/QuanLy_LuanVan_TN
> Branch: main — 117 commits

---

## 1. Tổng quan

| Thông tin | Chi tiết |
|-----------|----------|
| Kiến trúc | Tách BE/FE (Phương án 2) — Laravel API + React (Vite) |
| Backend | Laravel 12, PHP 8.3, MySQL |
| Frontend | React 18 + Vite 7 + TailwindCSS 4 + React Router 6 |
| Deploy | BE: Render (Docker) + Railway (dự phòng) / FE: Vercel |
| Database | Raw SQL dump (`temp_db/quanly_lvtn .sql`), không dùng Laravel Migration |
| Team | 6 người — 1 leader+BE, 1 BE, 3 FE, 1 DevOps+Tester |
| Packages BE | `phpoffice/phpspreadsheet`, `phpoffice/phpword` (đã cài, chưa dùng) |
| Packages FE | `react-router-dom`, `@fortawesome`, `react-icons`, `lottie-react`, `tailwindcss` |

### Thành viên

| MSSV | Họ tên | Vai trò |
|------|--------|---------|
| DH52200887 | Trần Quốc Khánh | Team Leader + Backend |
| DH52111470 | Lê Tiến Phát | Backend Developer |
| DH52200332 | Nguyễn Tuấn Anh | Frontend Developer |
| DH52201225 | Võ Thiên Phú | Frontend Developer |
| DH52201264 | Hồ Khôi Phục | Frontend Developer |
| LT05250031 | Siêu Ngọc Tài | DevOps + Tester |

### Git history

- 117 commits, gần như toàn bộ từ `khanh779-9` (Trần Quốc Khánh)
- 1 commit + 1 merge từ `kphuccc` (Hồ Khôi Phục)
- Commit messages khá chung chung: `feat: add some feauture` lặp lại 5 lần, `feat: fix some issue` lặp lại nhiều lần
- Có 1 nhánh `dev` merge vào `main`

---

## 2. Cấu trúc folder

```
TT-CD2/
├── .DS_Store                    ← file macOS, không nên commit
├── .gitignore                   ← dùng template Visual Studio (không phải Laravel)
├── CLAUDE.md
├── README.md
├── render.yaml                  ← config deploy Render
│
├── backend/                     ← Laravel 12 API
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile               ← php:8.3-cli, expose 10000
│   ├── composer.json
│   ├── composer.lock
│   ├── composer.phar            ← 3.2MB, KHÔNG NÊN COMMIT
│   ├── app/
│   │   ├── Console/
│   │   ├── Http/
│   │   │   ├── Controllers/     ← 7 controllers (phần lớn không dùng)
│   │   │   └── Middleware/      ← ApiTokenAuth.php
│   │   ├── Models/              ← 10 models
│   │   └── Providers/
│   ├── bootstrap/
│   ├── config/                  ← config Laravel mặc định + cors.php
│   ├── public/
│   ├── routes/
│   │   ├── api.php              ← 820 DÒNG — logic chính ở đây
│   │   ├── web.php
│   │   └── console.php
│   ├── storage/
│   └── vendor/                  ← COMMIT VÀO GIT — không nên
│
├── frontend/                    ← React + Vite
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── vercel.json
│   ├── public/
│   └── src/
│       ├── App.jsx              ← Router chính
│       ├── main.jsx
│       ├── index.css            ← TailwindCSS
│       ├── components/          ← 7 components
│       ├── constants/           ← roles.js
│       ├── context/             ← AuthContext.jsx
│       ├── hooks/               ← useDebounce.js
│       ├── layouts/             ← AdminLayout, ThesisLayout
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── NotFoundPage.jsx
│       │   ├── thesis/          ← 9 pages chính
│       │   └── users/           ← 1 page
│       ├── services/            ← 9 service files (fetch API)
│       └── utils/               ← convertFormat.js, parseResponse.js, scoreUtils.js
│
├── huong_dan/                   ← File mẫu từ thầy + tài liệu
│   ├── Projects.docx
│   ├── Form_NhiemvuLVTN.docx
│   ├── Mau 01.01_*.docx
│   ├── Mau 01.02_*.docx
│   ├── Mau 02.01_*.docx
│   ├── Mau 02.02_*.docx
│   ├── Chốt_DSSV_GVHD_TenDeTai_LVTN_Dot2_17112025.xlsx   ← data thật
│   ├── DS SV BV LVTN T10_2025.xlsx                        ← data thật
│   ├── intro.txt               ← mô tả chi tiết modules/pages
│   ├── intro2.txt
│   └── intro_kernel.txt
│
├── temp_db/
│   └── quanly_lvtn .sql        ← SQL dump (có khoảng trắng trong tên file)
│
├── screenshot/
│   └── image.png               ← ảnh tài khoản test
│
└── docs/                        ← docs tự tạo
    ├── thesis/
    ├── audit_report_reference.md
    └── teacher_requirements.md
```

---

## 3. Database — Phân tích chi tiết

Nguồn: `temp_db/quanly_lvtn .sql` — raw SQL, không phải Laravel migration.

### 3.1. Danh sách bảng

| # | Bảng | Engine | Primary Key | Mô tả |
|---|------|--------|-------------|-------|
| 1 | `users` | InnoDB | id (auto) | Bảng test — John Doe, Jane Smith. KHÔNG DÙNG |
| 2 | `cauhinh` | MyISAM | id | Cấu hình hệ thống: trangThaiChamGK, giaiDoan |
| 3 | `giangvien` | InnoDB | maGV (varchar 20) | Thông tin giảng viên + mật khẩu |
| 4 | `sinhvien` | InnoDB | mssv (varchar 20) | Thông tin sinh viên, FK → detai |
| 5 | `detai` | InnoDB | maDeTai (auto) | Đề tài + TẤT CẢ điểm + nhận xét |
| 6 | `diem` | InnoDB | maDiem (auto) | Bảng điểm riêng — TỒN TẠI NHƯNG KHÔNG DÙNG |
| 7 | `hoidong` | InnoDB | maHoiDong (auto) | Hội đồng bảo vệ |
| 8 | `thanhvienhoidong` | MyISAM | id (auto) | Thành viên hội đồng (GV + vai trò) |
| 9 | `topic_registrations_form` | InnoDB | id (auto) | Form đăng ký đề tài (thêm sau) |

### 3.2. Chi tiết từng bảng

#### `giangvien`

```sql
maGV        varchar(20)   PK
tenGV       varchar(100)  NOT NULL
email       varchar(100)
soDienThoai varchar(15)
hocVi       varchar(50)
matKhau     varchar(255)  DEFAULT '123'   ← PLAINTEXT
```

Data mẫu: 6 giảng viên, tất cả mật khẩu `'123'`.

#### `sinhvien`

```sql
mssv        varchar(20)   PK
hoTen       varchar(100)  NOT NULL
lop         varchar(50)
email       varchar(100)
soDienThoai varchar(15)
maDeTai     int           FK → detai.maDeTai
```

Data: ~130 sinh viên thật từ STU (MSSV bắt đầu bằng DH52..., email @student.stu.edu.vn).

#### `detai` — bảng phức tạp nhất

```sql
maDeTai         int           PK AUTO_INCREMENT
maMH            varchar(20)
tenMonHoc       varchar(100)
tenDeTai        text          NOT NULL
maGV_HD         varchar(20)   FK → giangvien
maGV_PB         varchar(20)   FK → giangvien
ghiChu_PB       text
ghiChu          text
diemGiuaKy      float
trangThaiGiuaKy enum('Được làm tiếp','Đình chỉ','Cảnh cáo')
nhanXetGiuaKy   text
maHoiDong       int           FK → hoidong
diemPhanBien    float
nhanXetPhanBien text
diemHuongDan    float
diemHoiDong     float
nhanXetHoiDong  text
diemTongKet     float
diemChu         varchar(5)
trangThaiHoiDong varchar(50)   'Đạt / Cần chỉnh sửa / Không đạt'
```

Vấn đề: 20 cột trong 1 bảng — gộp đề tài + điểm giữa kỳ + điểm hướng dẫn + điểm phản biện + điểm hội đồng + điểm tổng kết + tất cả nhận xét.

#### `diem` — bảng ma

```sql
maDiem    int           PK AUTO_INCREMENT
maDeTai   int           FK → detai
maGV      varchar(20)   FK → giangvien
loaiDiem  enum('HuongDan','PhanBien','HoiDong')
diemSo    float         NOT NULL
nhanXet   text
```

Bảng này tồn tại trong schema nhưng **không có data** và **không có code nào ghi vào**. Tất cả logic chấm điểm ghi thẳng vào bảng `detai`.

#### `hoidong`

```sql
maHoiDong   int           PK AUTO_INCREMENT
tenHoiDong  varchar(255)  NOT NULL
diaDiem     varchar(255)
```

Thiếu: `ngayBaoVe` (ngày bảo vệ) — yêu cầu của thầy.

#### `thanhvienhoidong`

```sql
id          int           PK AUTO_INCREMENT
maHoiDong   int           FK → hoidong
maGV        varchar(50)   FK → giangvien
vaiTro      varchar(20)   'ChuTich' | 'ThuKy' | 'UyVien'
```

#### `topic_registrations_form` — thêm sau

```sql
id                  BIGINT PK AUTO_INCREMENT
topic_title         VARCHAR(255) NOT NULL
topic_description   TEXT
topic_type          ENUM('single','group')
student1_id/name/class/email
student2_id/name/class/email     ← nullable
gvhd_code           VARCHAR(20) FK → giangvien
gvhd_workplace      VARCHAR(255)
gvpb_code            VARCHAR(20)
note                TEXT
source              VARCHAR(50) DEFAULT 'google_form'
status              ENUM('pending','approved','rejected')
registered_at       DATETIME
updated_at          DATETIME
```

Denormalized — lưu thẳng tên SV thay vì FK.

### 3.3. Quan hệ (FK)

```
giangvien ←──┐
             ├── detai.maGV_HD
             ├── detai.maGV_PB
             ├── diem.maGV
             ├── thanhvienhoidong.maGV
             └── topic_registrations_form.gvhd_code

detai ←──────┐
             ├── sinhvien.maDeTai
             └── diem.maDeTai

hoidong ←────┐
             ├── detai.maHoiDong
             └── thanhvienhoidong.maHoiDong
```

### 3.4. Vấn đề DB tổng hợp

| # | Vấn đề | Mức độ |
|---|--------|--------|
| 1 | Mật khẩu GV lưu plaintext (`'123'`) | Nghiêm trọng |
| 2 | Không dùng Laravel Migrations — không track được thay đổi schema | Nghiêm trọng |
| 3 | Bảng `detai` gộp 20 cột: đề tài + tất cả loại điểm + nhận xét | Thiết kế kém |
| 4 | Bảng `diem` tồn tại nhưng không dùng — code thừa | Lộn xộn |
| 5 | Bảng `users` chứa data test không liên quan | Rác |
| 6 | `hoidong` thiếu trường `ngayBaoVe` | Thiếu yêu cầu |
| 7 | Dùng lẫn MyISAM và InnoDB (`cauhinh` và `thanhvienhoidong` dùng MyISAM) | Không nhất quán |
| 8 | `topic_registrations_form` denormalized, lưu tên SV trực tiếp | Thiết kế kém |
| 9 | Không có bảng riêng cho admin/thư ký khoa — auth admin dùng hardcode | Thiếu |
| 10 | Không có bảng `dot_lvtn` (đợt/kỳ luận văn) để quản lý timeline | Thiếu yêu cầu |

---

## 4. Backend — Phân tích code chi tiết

### 4.1. Models (10 files)

| Model | Table | PK | Timestamps | Nhận xét |
|-------|-------|----|------------|----------|
| User | (default users) | id | có | Model mặc định Laravel, không liên quan |
| Teacher | giangvien | maGV (string) | không | Extends Authenticatable, hidden matKhau |
| Student | sinhvien | mssv (string) | không | OK |
| Topic | detai | maDeTai (int) | không | Có relationships đầy đủ |
| Council | hoidong | maHoiDong (int) | không | OK |
| CouncilMember | thanhvienhoidong | (default id) | — | Chỉ có fillable, không có relationships |
| Score | diem | maDiem (int) | không | Tồn tại nhưng không ai gọi |
| Setting | cauhinh | id | không | OK |
| ThesisForm | topic_registrations_form | id | — | OK |

Relationships trong Topic model:
- `lecturer()` → belongsTo Teacher (maGV_HD)
- `reviewer()` → belongsTo Teacher (maGV_PB)
- `council()` → belongsTo Council (maHoiDong)
- `students()` → hasMany Student (maDeTai)

Teacher model:
- `topics()` → hasMany Topic (maGV_HD)
- `reviewTopics()` → hasMany Topic (maGV_PB)
- `councils()` → belongsToMany Council qua thanhvienhoidong

### 4.2. Routes — api.php (820 dòng)

Đây là file lớn nhất và có nhiều vấn đề nhất.

#### Logic viết thẳng trong routes (closures)

| Route | Logic | Dòng code |
|-------|-------|-----------|
| `POST /login` | Đăng nhập GV, tạo token | ~50 dòng |
| `GET /me` | Lấy thông tin user hiện tại | ~15 dòng |
| `POST /logout` | Xóa token | ~10 dòng |
| `POST /change-password` | Đổi mật khẩu | ~45 dòng |
| `GET /dashboard` | Thống kê | ~15 dòng |
| `PUT /settings/stage` | Cập nhật giai đoạn | ~20 dòng |
| `POST /settings/toggle-midterm` | Bật/tắt chấm GK | ~10 dòng |
| `GET/POST/PUT/DELETE /lecturers` | CRUD giảng viên | ~70 dòng |
| `GET/POST/PUT/DELETE /councils` | CRUD hội đồng | ~100 dòng |
| `GET/POST/PUT/DELETE /topics` | CRUD đề tài | ~100 dòng |
| `POST /topics/create-group-assign` | Tạo nhóm + gán SV | ~30 dòng |
| `POST /topics/assign-hoidong` | Gán đề tài vào HĐ | ~25 dòng |
| `POST /topics/council-score` | Chấm điểm HĐ | ~50 dòng |
| `POST /topics/{topic}/score-gvhd` | Chấm điểm GVHD | ~40 dòng |
| `POST /topics/{topic}/score-gvpb` | Chấm điểm GVPB | ~40 dòng |
| `GET/POST/PUT/DELETE /scores` | CRUD bảng diem | ~50 dòng |
| `GET /options` | Dropdown data | ~10 dòng |

#### Controllers tồn tại nhưng phần lớn KHÔNG DÙNG

| Controller | Có route gọi không? | Ghi chú |
|------------|---------------------|---------|
| AuthController | KHÔNG | Dùng session auth, trong khi api.php dùng token auth |
| StudentController | CÓ | Routes students gọi đúng controller |
| TopicController | KHÔNG | Code đầy đủ nhưng api.php dùng closure thay thế |
| LecturerController | KHÔNG | Code đầy đủ nhưng api.php dùng closure |
| DashboardController | KHÔNG | api.php dùng closure |
| CouncilController | KHÔNG | api.php dùng closure |
| ThesisFormController | CÓ | Routes thesis-form gọi đúng |

#### BUG: Route lồng trong route

```php
// Dòng 429-436 trong api.php
Route::delete('/topics', function () {
    // BÊN TRONG closure lại khai báo routes mới
    Route::get('/lecturers', [LecturerController::class, 'index']);
    Route::post('/lecturers', [LecturerController::class, 'store']);
    // ...
    // Các routes này KHÔNG BAO GIỜ ĐƯỢC ĐĂNG KÝ vì nằm trong closure
});
```

Route `DELETE /topics` không xóa gì cả, bên trong chỉ khai báo routes (không hợp lệ). Đây là dead code/bug.

#### Duplicate route

`GET /topics/{topic}` được khai báo 2 lần (dòng 391 và 611) — route sau sẽ ghi đè route trước.

### 4.3. Authentication — Chi tiết

#### Flow đăng nhập

```
1. FE gửi POST /api/login { maGV, matKhau }
2. BE tìm Teacher theo maGV
3. So sánh plaintext: $password === $storedPassword
4. Tạo UUID token, lưu vào file cache với TTL 7 ngày
5. Trả token cho FE
```

#### Middleware ApiTokenAuth

```
1. Lấy Bearer token từ header
2. Tìm trong Cache::store('file')
3. Lấy role từ CouncilMember (vai trò hội đồng)
4. Gắn auth_user, auth_role, api_token vào request
```

#### Vấn đề auth

| # | Vấn đề | Giải thích |
|---|--------|-----------|
| 1 | Mật khẩu plaintext | `$password === $storedPassword` — không dùng Hash |
| 2 | Role logic sai | Role lấy từ `thanhvienhoidong.vaiTro` (ChuTich/ThuKy/UyVien). Đây là vai trò trong hội đồng, KHÔNG PHẢI vai trò hệ thống |
| 3 | Không có admin riêng | Admin password lưu trong file cache: `Cache::get('legacy_admin_password', '123')` |
| 4 | Sinh viên không thể đăng nhập | Hệ thống chỉ auth từ bảng `giangvien` |
| 5 | Token lưu file cache | Restart server = mất hết token = tất cả bị logout |
| 6 | Không có role-based access control | Mọi route đều accessible sau khi login, không check role |

### 4.4. Scoring logic — Chi tiết

#### Công thức tổng kết

```
Điểm tổng = (Điểm HD × 0.2) + (Điểm PB × 0.2) + (Điểm HĐ × 0.6)
```

#### Quy đổi điểm chữ

```
>= 9.0  → A+
>= 8.5  → A
>= 8.0  → B+
>= 7.0  → B
>= 6.5  → C+
>= 5.5  → C
>= 5.0  → D+
>= 4.0  → D
< 4.0   → F
```

#### Chấm điểm GVHD / GVPB

4 tiêu chí: Phân tích, Thiết kế, Hiện thực, Báo cáo.
Mỗi tiêu chí có `max` (điểm tối đa) và điểm thực tế.
Hỗ trợ 2 SV — nếu có SV2 thì tính trung bình.

```
Tổng điểm SV1 = (diemPhanTich1 + diemThietKe1 + diemHienThuc1 + diemBaoCao1) / totalMax * 10
Nếu có SV2: tương tự, rồi lấy trung bình
```

### 4.5. Import / Export — Trạng thái

| Chức năng | Route | Trạng thái |
|-----------|-------|-----------|
| Import SV từ Excel | `/students/import-excel` | 501 Not Implemented |
| Export midterm | `/exports/midterm` | 501 |
| Export hội đồng | `/exports/hoidong` | 501 |
| Export phản biện | `/exports/phanbien` | 501 |
| Export tổng kết | `/exports/tongket` | 501 |
| Export Word GVHD | `/exports/word/gvhd/{topic}` | 501 |
| Export Word GVPB | `/exports/word/gvpb/{topic}` | 501 |
| Export Word assignment | `/exports/word/assignment` | 501 |

Packages đã cài (`phpoffice/phpspreadsheet`, `phpoffice/phpword`) nhưng **chưa viết code** cho bất kỳ chức năng import/export nào.

### 4.6. Dockerfile & Deploy

```dockerfile
FROM php:8.3-cli
# Cài extensions: pdo_mysql, bcmath, mbstring, xml, intl, zip, gd, exif
# Dùng php artisan serve (built-in PHP server) cho production
EXPOSE 10000
CMD php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
```

Vấn đề: dùng `php artisan serve` (development server) cho production. Nên dùng nginx/apache + php-fpm.

---

## 5. Frontend — Phân tích chi tiết

### 5.1. Tech stack FE

- React 18.3 + Vite 7
- TailwindCSS 4
- React Router DOM 6 (client-side routing)
- FontAwesome + React Icons
- Lottie React (animations)
- Không có state management library (chỉ Context + localStorage)
- Không có HTTP client library (dùng native fetch)

### 5.2. Routing

```
/                    → HomePage
/users               → UsersPage (quản lý users cũ, không liên quan)
/thesis/login        → LoginPage
/thesis/dashboard    → Dashboard
/thesis/topicmanagement → TopicManagement
/thesis/assignment   → Assignment
/thesis/midterm      → Midterm
/thesis/review       → Review
/thesis/council      → Council
/thesis              → Dashboard (index redirect)
*                    → NotFoundPage
```

### 5.3. Pages chi tiết

| Page | File | Size | Chức năng |
|------|------|------|-----------|
| LoginPage | thesis/LoginPage.jsx | 2.4KB | Form đăng nhập (maGV + matKhau) |
| Dashboard | thesis/Dashboard.jsx | 10.9KB | Thống kê + quản lý giai đoạn + bật/tắt chấm GK |
| Assignment | thesis/Assignment.jsx | 3.8KB | Phân công SV cho GVHD (chọn SV + GV → tạo nhóm) |
| TopicManagement | thesis/TopicManagement.jsx | 7KB | CRUD đề tài |
| Midterm | thesis/Midterm.jsx | 4.4KB | Chấm điểm giữa kỳ |
| Review | thesis/Review.jsx | 25KB | Chấm điểm HD + PB + HĐ (file lớn nhất) |
| Council | thesis/Council.jsx | 4.8KB | CRUD hội đồng |
| ThesisForm | thesis/ThesisForm.jsx | 2.3KB | Danh sách form đăng ký |
| ThesisList | thesis/ThesisList.jsx | 2.8KB | Danh sách đề tài (view) |

### 5.4. Services (API calls)

| Service | Endpoints |
|---------|-----------|
| authService | login, logout, fetchCurrentUser, saveToken, getToken, fetchWithAuth |
| studentService | getStudents, deleteStudent, deleteAllStudents, importStudents |
| lecturerService | getLecturers, deleteLecturer |
| councilService | getCouncils, createCouncil, updateCouncil, deleteCouncil |
| thesisService | getTopics, createTopic, updateTopic, deleteTopic, assignHoidong, ... |
| thesisFormService | getThesisForms, createThesisForm, updateThesisForm, deleteThesisForm |
| dashboardService | getDashboard |
| userService | getUsers, createUser, updateUser, deleteUser |

### 5.5. Auth FE

```jsx
// AuthContext.jsx
const [user, setUser] = useState(null);
// Không persist → refresh page = mất user state

// authService.js
// Token lưu localStorage
// User data lưu localStorage
// fetchWithAuth: tự thêm Bearer token, redirect /thesis/login nếu 401
```

### 5.6. Roles FE

```javascript
// constants/roles.js
export const ROLES = {
  THUKY: "ThuKy",
  UYVIEN: "UyVien",
  CHUTICH: "ChuTich",
};
```

Chỉ có 3 roles theo vai trò hội đồng. **Thiếu**: Admin, GVHD, GVPB, SV.

### 5.7. Vấn đề FE

| # | Vấn đề | Mức độ |
|---|--------|--------|
| 1 | Không có trang cho Sinh viên | Thiếu yêu cầu |
| 2 | Không có trang "In tờ nhiệm vụ" | Thiếu yêu cầu |
| 3 | Roles chỉ có ThuKy/UyVien/ChuTich — thiếu GVHD/GVPB/SV/Admin | Thiếu |
| 4 | AuthContext không persist — refresh = mất state (dù localStorage có token) | Bug |
| 5 | `Review.jsx` 25KB — 1 file quá lớn, khó maintain | Code quality |
| 6 | Không có loading states thống nhất | UX |
| 7 | Không có error boundary | UX |
| 8 | FE gửi `{ maGV, matKhau }` nhưng BE nhận `{ username, password }` — dùng fallback | Lộn xộn |

---

## 6. File không nên commit

| File/Folder | Lý do |
|-------------|-------|
| `backend/vendor/` | Dependencies — nên dùng `composer install` |
| `backend/composer.phar` | Binary 3.2MB — Composer nên cài global |
| `.DS_Store` | File macOS system |
| `temp_db/quanly_lvtn .sql` | Có khoảng trắng trong tên file |

---

## 7. So sánh với yêu cầu thầy

Đối chiếu từng yêu cầu trong `docs/teacher_requirements.md`:

### Thư ký khoa (Admin)

| Yêu cầu | API | UI | Trạng thái |
|----------|-----|-----|-----------|
| Import DSSV từ Excel | Route có nhưng trả 501 | Có button nhưng không hoạt động | ❌ Chưa làm |
| Thiết lập thời gian LVTN | Có `giaiDoan` (1-5) + toggle chấm GK | Dashboard có | ⚠️ Sơ sài — chỉ có giai đoạn, không có mốc ngày cụ thể |
| Phân công SV cho GVHD | `POST /topics/create-group-assign` | Assignment page | ✅ Có |
| Nhận kết quả nhận đề tài | Topics list + status update | TopicManagement page | ⚠️ Có nhưng flow chưa rõ |
| In công bố kết quả 50% | Route trả 501 | Không có | ❌ Chưa làm |
| Phân công GVPB | Update `maGV_PB` trong topic | Có trong TopicManagement | ⚠️ Có nhưng UI chưa tách riêng |
| Lập hội đồng | CRUD `/councils` | Council page | ✅ Có |
| Phân công đề tài vào HĐ | `POST /topics/assign-hoidong` | Có | ✅ Có |
| Xuất danh sách bảo vệ | Route trả 501 | Không có | ❌ Chưa làm |

### GVHD

| Yêu cầu | API | UI | Trạng thái |
|----------|-----|-----|-----------|
| Nhận danh sách SV hướng dẫn | Topics list filtered | Có | ⚠️ Không filter theo GVHD đăng nhập |
| Giao đề tài (1 hoặc 2 SV) | `POST /topics/create-group-assign` | Assignment | ✅ Có |
| Đánh giá 50% | Midterm scoring | Midterm page | ⚠️ Có |
| Chấm điểm HD + export Word | Score có, export 501 | Review page, export không hoạt động | ⚠️ Chấm có, export ❌ |

### GVPB

| Yêu cầu | API | UI | Trạng thái |
|----------|-----|-----|-----------|
| Nhận danh sách phản biện | Topics list `?type=PB` | Có | ⚠️ Có nhưng không filter theo GVPB đăng nhập |
| Chấm điểm PB + export Word | Score có, export 501 | Review page, export không hoạt động | ⚠️ Chấm có, export ❌ |

### Sinh viên

| Yêu cầu | API | UI | Trạng thái |
|----------|-----|-----|-----------|
| Xem thông tin đề tài | Không có API cho SV | Không có trang SV | ❌ Hoàn toàn chưa làm |
| In tờ nhiệm vụ | Route trả 501 | Không có | ❌ Chưa làm |

### Tổng kết tiến độ

```
Hoàn thành: ████░░░░░░  ~35-40%
- CRUD cơ bản (GV, SV, đề tài, HĐ): ✅
- Phân công GVHD: ✅
- Phân công đề tài vào HĐ: ✅
- Chấm điểm (HD, PB, HĐ): ✅
- Deploy: ✅

Chưa hoàn thành: ░░░░░░████  ~60-65%
- Import Excel: ❌
- Export Word (5 mẫu): ❌
- Export Excel: ❌
- Module SV (login + xem + in form): ❌
- Role-based access control: ❌
- Auth đúng chuẩn: ❌
- Quản lý mốc thời gian chi tiết: ❌
- Công bố kết quả 50%: ❌
```

---

## 8. Tổng hợp vấn đề theo mức độ

### Nghiêm trọng (phải sửa)

| # | Vấn đề | Vị trí |
|---|--------|--------|
| 1 | Mật khẩu lưu plaintext, so sánh trực tiếp | DB + api.php dòng 52 |
| 2 | Không có Laravel Migrations | Toàn bộ DB |
| 3 | Role system dùng vai trò hội đồng thay vì vai trò hệ thống | api.php dòng 59, Middleware, FE roles.js |
| 4 | Sinh viên không thể đăng nhập / không có trang | Toàn bộ |
| 5 | Import/Export chưa triển khai (core feature) | api.php dòng 744-784 |
| 6 | Route 820 dòng closures — không dùng Controllers đã viết | api.php |
| 7 | Bug route lồng route | api.php dòng 429-436 |

### Trung bình (nên sửa)

| # | Vấn đề | Vị trí |
|---|--------|--------|
| 8 | Bảng `detai` gộp quá nhiều (20 cột) | DB schema |
| 9 | Bảng `diem` tồn tại nhưng không dùng | DB + Model Score |
| 10 | Bảng `hoidong` thiếu `ngayBaoVe` | DB schema |
| 11 | AuthContext FE không persist | AuthContext.jsx |
| 12 | Duplicate route `GET /topics/{topic}` | api.php dòng 391, 611 |
| 13 | Không có role-based access control trên API | api.php — mọi route accessible sau login |
| 14 | Dùng `php artisan serve` cho production | Dockerfile |
| 15 | `vendor/` + `composer.phar` commit vào git | .gitignore |

### Nhẹ (có thể cải thiện)

| # | Vấn đề | Vị trí |
|---|--------|--------|
| 16 | `.DS_Store` commit vào repo | Root |
| 17 | Tên file SQL có khoảng trắng | temp_db/ |
| 18 | .gitignore dùng template Visual Studio | .gitignore |
| 19 | Review.jsx 25KB — quá lớn | frontend/src/pages/thesis/ |
| 20 | Commit messages chung chung lặp lại | Git history |
| 21 | FE gửi `maGV/matKhau` nhưng BE nhận `username/password` (dùng fallback) | authService + api.php |

---

## 9. Điểm tốt

Mặc dù có nhiều vấn đề, repo cũng có những điểm đáng ghi nhận:

1. **Đã deploy được** — BE trên Render + FE trên Vercel, có link chạy thật
2. **Có Docker** — đã setup Dockerfile cho BE
3. **Đã có CRUD cơ bản** cho SV, GV, đề tài, hội đồng
4. **Chấm điểm hoạt động** — HD, PB, HĐ đều có, công thức tổng kết đúng
5. **Có validation** trên API endpoints
6. **Có file mẫu thật** — data SV thật từ STU, file mẫu Word từ thầy
7. **Có tài liệu** intro.txt mô tả flow khá chi tiết
8. **FE giao diện** có TailwindCSS, có layout riêng, có responsive cơ bản
