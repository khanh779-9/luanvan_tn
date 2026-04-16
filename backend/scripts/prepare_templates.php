<?php

require __DIR__ . '/../vendor/autoload.php';

use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\Style\Font;
use PhpOffice\PhpWord\SimpleType\JcTable;
use PhpOffice\PhpWord\SimpleType\TblWidth;

$templateDir = __DIR__ . '/../storage/app/templates';
if (!is_dir($templateDir)) {
    mkdir($templateDir, 0755, true);
}

function makeHeaderTable(PhpWord $phpWord, $section, $mauSo) {
    $tableStyle = [
        'borderSize' => 6, 'borderColor' => '000000',
        'cellMargin' => 80, 'width' => 100 * 50,
    ];
    $section->addTable($tableStyle);
    $table = $section->getElement(count($section->getElements()) - 1);

    $bold = ['bold' => true, 'size' => 11, 'name' => 'Times New Roman'];
    $normal = ['size' => 11, 'name' => 'Times New Roman'];

    $table->addRow();
    $table->addCell(4500)->addText($mauSo, $bold, ['alignment' => 'left']);
    $table->addCell(5500)->addText('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', $bold, ['alignment' => 'center']);

    $table->addRow();
    $table->addCell(4500)->addText('TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN', $bold, ['alignment' => 'center']);
    $table->addCell(5500)->addText('Độc lập – Tự do – Hạnh phúc', $bold, ['alignment' => 'center']);

    $table->addRow();
    $table->addCell(4500)->addText('KHOA: CÔNG NGHỆ THÔNG TIN', $normal, ['alignment' => 'left']);
    $table->addCell(5500)->addText('', $normal);
}

function addScoreTable(PhpWord $phpWord, $section, $tieu_chi_labels) {
    $tableStyle = [
        'borderSize' => 6, 'borderColor' => '000000',
        'cellMargin' => 80, 'width' => 100 * 50,
    ];
    $section->addTable($tableStyle);
    $table = $section->getElement(count($section->getElements()) - 1);

    $bold = ['bold' => true, 'size' => 11, 'name' => 'Times New Roman'];
    $normal = ['size' => 11, 'name' => 'Times New Roman'];

    // Header
    $table->addRow();
    $table->addCell(5000)->addText('Nội dung, tiêu chí đánh giá', $bold, ['alignment' => 'center']);
    $table->addCell(1500)->addText('Thang điểm', $bold, ['alignment' => 'center']);
    $table->addCell(2000)->addText('Điểm đánh giá', $bold, ['alignment' => 'center']);
    $table->addCell(1500)->addText('Ghi chú', $bold, ['alignment' => 'center']);

    // Tieu chi 1-5
    foreach ($tieu_chi_labels as $i => $label) {
        $tcKey = 'tc' . ($i + 1);
        $table->addRow();
        $table->addCell(5000)->addText($label, $normal);
        $table->addCell(1500)->addText('20%', $normal, ['alignment' => 'center']);
        $table->addCell(2000)->addText('${' . $tcKey . '}', $normal, ['alignment' => 'center']);
        $table->addCell(1500)->addText('', $normal);
    }

    // Tong cong
    $table->addRow();
    $table->addCell(5000)->addText('Tổng cộng', $bold, ['alignment' => 'center']);
    $table->addCell(1500)->addText('100%', $bold, ['alignment' => 'center']);
    $table->addCell(2000)->addText('', $normal);
    $table->addCell(1500)->addText('', $normal);

    // Diem cham
    $table->addRow();
    $table->addCell(5000)->addText('Điểm chấm (thang điểm 10)', $bold);
    $table->addCell(1500)->addText('10 điểm', $normal, ['alignment' => 'center']);
    $table->addCell(2000)->addText('${diem_tong}', $bold, ['alignment' => 'center']);
    $table->addCell(1500)->addText('', $normal);
}

$tieuChiHD = [
    '1. Hình thức trình bày và cấu trúc luận văn',
    '2. Nội dung nghiên cứu và kết quả đạt được',
    '3. Tính ứng dụng thực tiễn',
    '4. Kỹ năng phân tích, tổng hợp và lập luận',
    '5. Tiến độ thực hiện và thái độ làm việc',
];

$tieuChiPB = [
    '1. Hình thức trình bày và cấu trúc luận văn',
    '2. Nội dung nghiên cứu và kết quả đạt được',
    '3. Tính ứng dụng và sáng tạo',
    '4. Khả năng phân tích và trả lời câu hỏi',
    '5. Chất lượng demo sản phẩm',
];

$bold = ['bold' => true, 'size' => 12, 'name' => 'Times New Roman'];
$normal = ['size' => 11, 'name' => 'Times New Roman'];
$italic = ['italic' => true, 'size' => 11, 'name' => 'Times New Roman'];

// ============================================================
// Mau_01_02.docx — Phieu cham GVHD — 1 SV
// ============================================================
$phpWord = new PhpWord();
$phpWord->setDefaultFontName('Times New Roman');
$phpWord->setDefaultFontSize(11);

$section = $phpWord->addSection(['marginTop' => 720, 'marginBottom' => 720, 'marginLeft' => 1080, 'marginRight' => 720]);

makeHeaderTable($phpWord, $section, 'Mẫu 01.02');

$section->addText('PHIẾU CHẤM ĐỒ ÁN/KHÓA LUẬN TỐT NGHIỆP', ['bold' => true, 'size' => 14, 'name' => 'Times New Roman'], ['alignment' => 'center', 'spaceAfter' => 0]);
$section->addText('dành cho Giảng viên hướng dẫn chấm điểm', $italic, ['alignment' => 'center', 'spaceBefore' => 0]);

$section->addText('Sinh viên thực hiện đề tài:', $bold);
$section->addText('Họ tên sinh viên: ${ho_ten_sv}', $normal);
$section->addText('Mã số sinh viên: ${mssv}                    Lớp: ${lop}', $normal);
$section->addText('Tên đề tài: ${ten_de_tai}', $normal);
$section->addText('Họ tên giảng viên hướng dẫn: ${ten_gvhd}', $normal);

$section->addText('Nhận xét chung:', $bold);
$section->addText('${nhan_xet}', $normal);

$section->addText('Giảng viên hướng dẫn chấm điểm quyển đồ án/khóa luận tốt nghiệp theo các mục sau:', $normal);

addScoreTable($phpWord, $section, $tieuChiHD);

$section->addText('Điểm đánh giá (theo thang điểm 10):', $bold);
$section->addText('Bằng số: ${diem_tong}', $normal);
$section->addText('Bằng chữ: ${diem_chu}', $normal);

$section->addText('Tp. Hồ Chí Minh, ngày ${ngay} tháng ${thang} năm ${nam}', $normal, ['alignment' => 'right']);
$section->addText('Người chấm ký và ghi rõ họ tên', $bold, ['alignment' => 'right']);
$section->addText('${ten_gvhd}', $normal, ['alignment' => 'right']);

$writer = IOFactory::createWriter($phpWord, 'Word2007');
$writer->save($templateDir . '/Mau_01_02.docx');
echo "Mau_01_02.docx created\n";

// ============================================================
// Mau_01_01.docx — Phieu cham GVHD — nhom 2 SV
// ============================================================
$phpWord = new PhpWord();
$phpWord->setDefaultFontName('Times New Roman');
$phpWord->setDefaultFontSize(11);

$section = $phpWord->addSection(['marginTop' => 720, 'marginBottom' => 720, 'marginLeft' => 1080, 'marginRight' => 720]);

makeHeaderTable($phpWord, $section, 'Mẫu 01.01');

$section->addText('PHIẾU CHẤM ĐỒ ÁN/KHÓA LUẬN TỐT NGHIỆP', ['bold' => true, 'size' => 14, 'name' => 'Times New Roman'], ['alignment' => 'center', 'spaceAfter' => 0]);
$section->addText('dành cho Giảng viên hướng dẫn chấm điểm (Nhóm sinh viên)', $italic, ['alignment' => 'center', 'spaceBefore' => 0]);

$section->addText('Sinh viên thực hiện đề tài:', $bold);
$section->addText('SV 1 - Họ tên: ${ho_ten_sv_01}', $normal);
$section->addText('MSSV: ${mssv_01}                    Lớp: ${lop_01}', $normal);
$section->addText('SV 2 - Họ tên: ${ho_ten_sv_02}', $normal);
$section->addText('MSSV: ${mssv_02}                    Lớp: ${lop_02}', $normal);
$section->addText('Tên đề tài: ${ten_de_tai}', $normal);
$section->addText('Họ tên giảng viên hướng dẫn: ${ten_gvhd}', $normal);

$section->addText('Nhận xét chung:', $bold);
$section->addText('${nhan_xet}', $normal);

$section->addText('Giảng viên hướng dẫn chấm điểm quyển đồ án/khóa luận tốt nghiệp theo các mục sau:', $normal);

addScoreTable($phpWord, $section, $tieuChiHD);

$section->addText('Điểm đánh giá (theo thang điểm 10):', $bold);
$section->addText('Bằng số: ${diem_tong}', $normal);
$section->addText('Bằng chữ: ${diem_chu}', $normal);

$section->addText('Tp. Hồ Chí Minh, ngày ${ngay} tháng ${thang} năm ${nam}', $normal, ['alignment' => 'right']);
$section->addText('Người chấm ký và ghi rõ họ tên', $bold, ['alignment' => 'right']);
$section->addText('${ten_gvhd}', $normal, ['alignment' => 'right']);

$writer = IOFactory::createWriter($phpWord, 'Word2007');
$writer->save($templateDir . '/Mau_01_01.docx');
echo "Mau_01_01.docx created\n";

// ============================================================
// Mau_02_02.docx — Phieu cham GVPB — 1 SV
// ============================================================
$phpWord = new PhpWord();
$phpWord->setDefaultFontName('Times New Roman');
$phpWord->setDefaultFontSize(11);

$section = $phpWord->addSection(['marginTop' => 720, 'marginBottom' => 720, 'marginLeft' => 1080, 'marginRight' => 720]);

makeHeaderTable($phpWord, $section, 'Mẫu 02.02');

$section->addText('PHIẾU CHẤM ĐỒ ÁN/KHÓA LUẬN TỐT NGHIỆP', ['bold' => true, 'size' => 14, 'name' => 'Times New Roman'], ['alignment' => 'center', 'spaceAfter' => 0]);
$section->addText('dành cho Giảng viên phản biện chấm điểm', $italic, ['alignment' => 'center', 'spaceBefore' => 0]);

$section->addText('Sinh viên thực hiện đề tài:', $bold);
$section->addText('Họ tên sinh viên: ${ho_ten_sv}', $normal);
$section->addText('Mã số sinh viên: ${mssv}                    Lớp: ${lop}', $normal);
$section->addText('Tên đề tài: ${ten_de_tai}', $normal);
$section->addText('Họ tên giảng viên phản biện: ${ten_gvpb}', $normal);

$section->addText('Nhận xét chung:', $bold);
$section->addText('${nhan_xet}', $normal);

$section->addText('Giảng viên phản biện chấm điểm quyển đồ án/khóa luận tốt nghiệp theo các mục sau:', $normal);

addScoreTable($phpWord, $section, $tieuChiPB);

$section->addText('Điểm đánh giá (theo thang điểm 10):', $bold);
$section->addText('Bằng số: ${diem_tong}', $normal);
$section->addText('Bằng chữ: ${diem_chu}', $normal);

$section->addText('Tp. Hồ Chí Minh, ngày ${ngay} tháng ${thang} năm ${nam}', $normal, ['alignment' => 'right']);
$section->addText('Người chấm ký và ghi rõ họ tên', $bold, ['alignment' => 'right']);
$section->addText('${ten_gvpb}', $normal, ['alignment' => 'right']);

$writer = IOFactory::createWriter($phpWord, 'Word2007');
$writer->save($templateDir . '/Mau_02_02.docx');
echo "Mau_02_02.docx created\n";

// ============================================================
// Mau_02_01.docx — Phieu cham GVPB — nhom 2 SV
// ============================================================
$phpWord = new PhpWord();
$phpWord->setDefaultFontName('Times New Roman');
$phpWord->setDefaultFontSize(11);

$section = $phpWord->addSection(['marginTop' => 720, 'marginBottom' => 720, 'marginLeft' => 1080, 'marginRight' => 720]);

makeHeaderTable($phpWord, $section, 'Mẫu 02.01');

$section->addText('PHIẾU CHẤM ĐỒ ÁN/KHÓA LUẬN TỐT NGHIỆP', ['bold' => true, 'size' => 14, 'name' => 'Times New Roman'], ['alignment' => 'center', 'spaceAfter' => 0]);
$section->addText('dành cho Giảng viên phản biện chấm điểm (Nhóm sinh viên)', $italic, ['alignment' => 'center', 'spaceBefore' => 0]);

$section->addText('Sinh viên thực hiện đề tài:', $bold);
$section->addText('SV 1 - Họ tên: ${ho_ten_sv_01}', $normal);
$section->addText('MSSV: ${mssv_01}                    Lớp: ${lop_01}', $normal);
$section->addText('SV 2 - Họ tên: ${ho_ten_sv_02}', $normal);
$section->addText('MSSV: ${mssv_02}                    Lớp: ${lop_02}', $normal);
$section->addText('Tên đề tài: ${ten_de_tai}', $normal);
$section->addText('Họ tên giảng viên phản biện: ${ten_gvpb}', $normal);

$section->addText('Nhận xét chung:', $bold);
$section->addText('${nhan_xet}', $normal);

$section->addText('Giảng viên phản biện chấm điểm quyển đồ án/khóa luận tốt nghiệp theo các mục sau:', $normal);

addScoreTable($phpWord, $section, $tieuChiPB);

$section->addText('Điểm đánh giá (theo thang điểm 10):', $bold);
$section->addText('Bằng số: ${diem_tong}', $normal);
$section->addText('Bằng chữ: ${diem_chu}', $normal);

$section->addText('Tp. Hồ Chí Minh, ngày ${ngay} tháng ${thang} năm ${nam}', $normal, ['alignment' => 'right']);
$section->addText('Người chấm ký và ghi rõ họ tên', $bold, ['alignment' => 'right']);
$section->addText('${ten_gvpb}', $normal, ['alignment' => 'right']);

$writer = IOFactory::createWriter($phpWord, 'Word2007');
$writer->save($templateDir . '/Mau_02_01.docx');
echo "Mau_02_01.docx created\n";

echo "\nDone! 4 templates created in: $templateDir\n";
