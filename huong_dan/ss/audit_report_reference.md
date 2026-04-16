# Audit: Xay_Dung_PM_Web_Report.docx

> Phân tích bản báo cáo LVTN mẫu/reference để so sánh với project TT-CD2.
> Ngày audit: 2026-03-31

---

## 1. Tổng quan report

- **Đề tài**: Xây dựng phần mềm Web quản lý Khóa luận Tốt nghiệp
- **Trường**: Đại học Công Nghệ Sài Gòn (STU)
- **Khoa**: Công Nghệ Thông Tin
- **Tech stack**: PHP thuần (PDO) + MySQL + HTML/CSS/JS thuần
- **Không dùng framework** (không Laravel, không React)

### Cấu trúc report (5 chương)

| Chương | Nội dung | Ghi chú |
|--------|----------|---------|
| 1 | Giới thiệu (vấn đề, mục tiêu, phạm vi, KPIs) | Đầy đủ, tốt |
| 2 | Phương pháp (hệ thống tương tự, công nghệ, yêu cầu, use case) | Có so sánh Excel vs LMS |
| 3 | Thiết kế (DB 3 mức, sequence diagram, activity diagram, giao diện) | DB quá đơn giản |
| 4 | *(Không có trong file — có thể bị lược hoặc là phần cài đặt/demo)* | Thiếu |
| 5 | Kết luận (đối chiếu mục tiêu, tồn đọng, hướng mở rộng) | OK |

---

## 2. Phân tích nghiệp vụ trong report

### 2.1. Đối tượng sử dụng

| Vai trò | Mô tả trong report |
|---------|-------------------|
| Admin (Giáo vụ/Trưởng khoa) | Quyền cao nhất, khởi tạo dữ liệu, điều phối quy trình |
| Giảng viên | Hướng dẫn + Phản biện + Hội đồng (1 GV có thể đóng nhiều vai trò) |
| Sinh viên | Đăng ký đề tài, xem kết quả điểm |

### 2.2. Quy trình chính

```
1. Admin nhập DS Sinh viên + Giảng viên
2. SV đăng ký đề tài HOẶC GVHD phân công
3. Admin chốt danh sách, phân công GVPB
4. GVHD chấm điểm hướng dẫn (20%)
5. GVPB chấm điểm phản biện (20%)
6. Admin tạo Hội đồng bảo vệ
7. Thư ký HĐ nhập điểm hội đồng (60%)
8. Hệ thống tính điểm tổng kết tự động
9. Xuất phiếu chấm Word + bảng tổng kết Excel
```

### 2.3. Công thức tính điểm

```
Điểm Tổng Kết = (Điểm HD × 0.2) + (Điểm PB × 0.2) + (Điểm HĐ × 0.6)
```

- Điểm HĐ = trung bình cộng điểm các thành viên hội đồng
- Quy đổi sang điểm chữ: A, B, C, D, F theo quy chế tín chỉ
- Điểm từ 0-10, validate khi nhập

### 2.4. Trạng thái đề tài

```
Đăng ký → Duyệt → Giữa kỳ → Được bảo vệ / Hủy → Chấm HD/PB → Chấm HĐ → Hoàn thành
```

Report nhấn mạnh: hệ thống phải khóa chức năng theo giai đoạn (không cho chấm điểm khi chưa đến lượt).

### 2.5. Chức năng chi tiết theo vai trò

**Admin:**
- CRUD sinh viên, giảng viên
- Import dữ liệu
- Phê duyệt đề tài
- Phân công GVHD, GVPB
- Tạo hội đồng (Chủ tịch + Thư ký + Ủy viên)
- Phân công đề tài vào hội đồng
- Cấu hình mở/khóa giai đoạn
- Dashboard thống kê
- Xuất báo cáo tổng hợp

**Giảng viên:**
- Xem DS nhóm SV hướng dẫn / phản biện
- Chấm điểm HD (thái độ, tiến độ, nội dung + nhận xét)
- Chấm điểm PB
- Chấm điểm HĐ (nếu là thành viên HĐ)
- Xuất phiếu chấm cá nhân (Word)

**Sinh viên:**
- Xem thông tin đề tài, GVHD
- Xem kết quả điểm + nhận xét

---

## 3. Phân tích thiết kế database trong report

### 3.1. Mức ý niệm (Conceptual)

Thực thể: SinhVien, GiangVien, DeTai, HoiDong, Diem

Quan hệ:
- SV – Đề tài: **1-1** (mỗi SV 1 đề tài)
- GV – Đề tài: **1-n** (1 GV nhiều đề tài)
- HĐ – Đề tài: **1-n** (1 HĐ chấm nhiều đề tài)

### 3.2. Mức luận lý (Logical)

| Bảng | Trường | Ghi chú |
|------|--------|---------|
| SinhVien | MSSV (PK), HoTen, Email, Lop, SoDienThoai | |
| GiangVien | MaGV (PK), HoTen, Email, HocHam, HocVi, DonViCongTac | |
| DeTai | MaDeTai (PK), TenDeTai, MoTa, MSSV (FK), MaGV_HD (FK), MaGV_PB (FK), TrangThai | |
| Diem | ID (PK), MaDeTai (FK), DiemHuongDan, DiemPhanBien, DiemHoiDong, NhanXet | |

### 3.3. Mức vật lý (Physical) — CHỈ CÓ 3 BẢNG

**Bảng sinhvien:**

| Trường | Kiểu | Độ dài | Ràng buộc | Mô tả |
|--------|------|--------|-----------|-------|
| mssv | VARCHAR | 20 | PK, Not Null | Mã số sinh viên |
| ho_ten | VARCHAR | 100 | Not Null | Họ tên |
| email | VARCHAR | 100 | Unique | Email đăng nhập |
| mat_khau | VARCHAR | 255 | Not Null | Mật khẩu (MD5/Bcrypt) |
| lop | VARCHAR | 50 | Null | Lớp chuyên ngành |

**Bảng detai:**

| Trường | Kiểu | Độ dài | Ràng buộc | Mô tả |
|--------|------|--------|-----------|-------|
| ma_de_tai | INT | 11 | PK, Auto Inc | Mã đề tài |
| ten_de_tai | TEXT | - | Not Null | Tên KLTN |
| mssv | VARCHAR | 20 | FK | Liên kết SinhVien |
| gvhd_id | INT | 11 | FK | FK GiangVien (HD) |
| gvpb_id | INT | 11 | FK | FK GiangVien (PB) |
| trang_thai | TINYINT | 1 | Default 0 | 0: Chờ, 1: Duyệt, 2: Xong |

**Bảng diem:**

| Trường | Kiểu | Độ dài | Ràng buộc | Mô tả |
|--------|------|--------|-----------|-------|
| id | INT | 11 | PK, Auto Inc | ID điểm |
| ma_de_tai | INT | 11 | FK | Liên kết DeTai |
| diem_hd | FLOAT | - | Check (0-10) | Điểm HD (20%) |
| diem_pb | FLOAT | - | Check (0-10) | Điểm PB (20%) |
| diem_hdong | FLOAT | - | Check (0-10) | Điểm HĐ (60%) |
| diem_tong | FLOAT | - | - | Điểm tổng kết |

---

## 4. So sánh Report vs Project TT-CD2

### 4.1. Điểm giống

| Phần | Report | TT-CD2 |
|------|--------|--------|
| Đề tài | Quản lý KLTN | Quản lý SV LVTN |
| Trường | STU | STU |
| Đối tượng | Admin, GV, SV | Admin (thư ký), GVHD, GVPB, SV |
| Chấm điểm | HD + PB + HĐ | Có chấm HD, PB |
| Export Word | PHPWord xuất phiếu chấm | phpoffice/phpword |
| Export Excel | Có | Có (import + export) |
| Hội đồng | Tạo HĐ, phân công | Tạo HĐ, phân công có thứ tự |
| Database | MySQL | MySQL |
| Mẫu phiếu chấm | Mẫu 01.01, 01.02, 02.01, 02.02 | Cùng mẫu (đã có file .doc) |

### 4.2. Điểm khác biệt

| Điểm | Report | TT-CD2 | Ảnh hưởng |
|------|--------|--------|-----------|
| **Framework** | PHP thuần (PDO) | **Laravel 12** | Kiến trúc code hoàn toàn khác |
| **Frontend** | HTML/CSS/JS thuần | Blade hoặc React/Angular | Cách viết view khác |
| **Auth** | Session thủ công | Laravel built-in auth | Bảo mật tốt hơn |
| **SV đăng ký đề tài** | SV tự đăng ký online | GVHD giao đề tài | Flow khác |
| **Import SV** | Admin nhập CRUD | **Import từ Excel** (P.Đào tạo) | Cần package maatwebsite |
| **Nhóm SV** | 1 SV = 1 đề tài (1-1) | Nhóm 2 hoặc 1 SV (n-1) | DB design khác |
| **Đánh giá 50%** | Không đề cập | Thầy nhắc "đánh giá 50%" | Cần làm rõ nghiệp vụ |
| **Form nhiệm vụ** | Không có | SV in tờ nhiệm vụ LVTN | Thêm chức năng export |
| **Domain** | Không đề cập | Mua domain (.io.vn/.id.vn) | Cần deploy thật |
| **Công thức điểm** | 20% HD + 20% PB + 60% HĐ | Chưa rõ | Cần hỏi thầy xác nhận |
| **Mốc thời gian** | Có giai đoạn (tuần 1-7) | Thầy nói "thiết lập thời gian" | Cần module cấu hình |

---

## 5. Các lỗi / thiếu sót trong report

### 5.1. Database quá đơn giản

Report chỉ có 3 bảng ở mức vật lý (sinhvien, detai, diem) — **thiếu nghiêm trọng**:

- **Thiếu bảng giangvien** — có ở mức luận lý nhưng mất ở mức vật lý
- **Thiếu bảng hoidong** — report nói có HĐ nhưng không có bảng
- **Thiếu bảng thành viên HĐ** — HĐ gồm chủ tịch + thư ký + ủy viên
- **Thiếu bảng users** — auth bằng gì nếu không có bảng users chung?
- **Quan hệ SV-Đề tài sai** — report nói 1-1 nhưng thực tế cần hỗ trợ nhóm
- **Bảng diem quá đơn giản** — gộp chung HD + PB + HĐ vào 1 row, không lưu chi tiết tiêu chí

### 5.2. Thiếu Chương 4

Report nhảy từ Chương 3 sang Chương 5 — không có phần cài đặt, demo, hoặc kết quả chạy thử.

### 5.3. Đánh số sai

- Mục 2.3.1, 2.3.2, 2.3.3 trong phần "Sơ đồ chức năng" lẽ ra phải là 2.4.2.1, 2.4.2.2, 2.4.2.3
- Hình 2.3.2 nằm trong mục 3.2.3 — đánh số hình không khớp mục

### 5.4. Bảo mật

- Report đề cập MD5 cho mật khẩu — **MD5 đã lỗi thời và không an toàn**
- Có nhắc Bcrypt nhưng để song song với MD5 ("MD5/Bcrypt") — nên chỉ dùng Bcrypt
- Project TT-CD2 dùng Laravel → mặc định Bcrypt, không cần lo phần này

### 5.5. Thiếu chi tiết export Word

Report nói dùng PHPWord nhưng không mô tả cách map dữ liệu vào template .doc cụ thể nào.

---

## 6. Những thứ tham khảo được cho TT-CD2

### 6.1. Cấu trúc báo cáo (tốt)

Cấu trúc 5 chương của report phù hợp để tham khảo khi viết báo cáo LVTN:

```
Chương 1: Giới thiệu
  1.1 Đặt vấn đề + Mục tiêu
  1.2 Thách thức
  1.3 Nội dung và phạm vi
  1.4 Kết quả cần đạt (bảng KPIs)

Chương 2: Phương pháp thực hiện
  2.1 Hệ thống tương tự (so sánh)
  2.2 Cơ sở lý thuyết
  2.3 Công nghệ sử dụng
  2.4 Phân tích yêu cầu (quy trình, use case)

Chương 3: Thiết kế hệ thống
  3.1 Mô hình dữ liệu (3 mức)
  3.2 Mô hình xử lý (sequence, activity diagram)
  3.3 Thiết kế giao diện

Chương 4: Cài đặt và Kiểm thử (report thiếu chương này)

Chương 5: Kết luận
  5.1 Đối chiếu mục tiêu
  5.2 Tồn đọng
  5.3 Hướng mở rộng
```

### 6.2. Bảng KPIs (mục 1.4)

Bảng đánh giá kết quả cần đạt trong report rất tốt — gồm 6 tiêu chí:
1. Database (3NF, utf8mb4, ràng buộc)
2. Phân quyền (3 vai trò, chặn truy cập URL, session)
3. Quản lý đề tài + quy trình (trạng thái theo giai đoạn, khóa read-only)
4. Chấm điểm + tính toán (trọng số, real-time, quy đổi chữ)
5. Xuất báo cáo (Word đúng mẫu, Excel, không lỗi font)
6. UI/UX (responsive, tốc độ < 2s)

### 6.3. Phần so sánh hệ thống tương tự

Report so sánh 2 phương pháp hiện tại (Excel + LMS) rồi kết luận cần hệ thống riêng — tham khảo tốt cho phần đặt vấn đề.

### 6.4. Use case đặc tả chi tiết

Mẫu đặc tả use case "Chấm điểm HD" (UC_04) có đầy đủ:
- Tên, mã, actor
- Mô tả, tiền điều kiện
- Luồng chính (Basic Flow) — 9 bước
- Luồng rẽ nhánh (Alternative Flow) — validate điểm, lỗi DB
- Hậu điều kiện

### 6.5. Thiết kế giao diện

Report có mô tả chi tiết 2 màn hình:
- **Login**: Logo STU + input username/password + nút đăng nhập + quên MK
- **Dashboard Admin**: Sidebar menu + 4 stat cards + biểu đồ tròn + thông báo

---

## 7. Kết luận audit

### Dùng report này để:
- Tham khảo **cấu trúc báo cáo** (5 chương)
- Tham khảo **nghiệp vụ** (quy trình, vai trò, công thức điểm)
- Tham khảo **cách viết** use case, đặc tả giao diện, bảng KPIs
- Tham khảo **phần đặt vấn đề** và so sánh hệ thống tương tự

### KHÔNG dùng report này để:
- Copy code — tech stack khác hoàn toàn (PHP thuần vs Laravel)
- Copy database design — quá đơn giản, thiếu nhiều bảng
- Copy kiến trúc — không có MVC framework

### Cần làm rõ với thầy:
1. Công thức điểm có giống report không (20% HD + 20% PB + 60% HĐ)?
2. "Đánh giá 50%" mà thầy nhắc nghĩa là gì chính xác?
3. SV có tự đăng ký đề tài không, hay chỉ GVHD giao?
4. Các giai đoạn thời gian cụ thể (mấy tuần, mốc nào)?
5. Phân công phương án FE: dùng Blade luôn hay tách React?
