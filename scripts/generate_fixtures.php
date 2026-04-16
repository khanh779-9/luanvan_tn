<?php

require __DIR__ . '/../backend/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

$outputDir = __DIR__ . '/../backend/tests/fixtures';
if (!is_dir($outputDir)) {
    mkdir($outputDir, 0755, true);
}

// File 1: du_lieu_sv_valid.xlsx - 5 dong hop le
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

$sheet->setCellValue('A1', 'MSSV');
$sheet->setCellValue('B1', 'Ho ten');
$sheet->setCellValue('C1', 'Lop');
$sheet->setCellValue('D1', 'Email');

$data = [
    ['DH52200001', 'Nguyen Van A', 'D22_TH01', 'a@student.stu.edu.vn'],
    ['DH52200002', 'Tran Thi B', 'D22_TH01', 'b@student.stu.edu.vn'],
    ['DH52200003', 'Le Van C', 'D22_TH02', 'c@student.stu.edu.vn'],
    ['DH52200004', 'Pham Thi D', 'D22_TH02', 'd@student.stu.edu.vn'],
    ['DH52200005', 'Hoang Van E', 'D22_TH03', 'e@student.stu.edu.vn'],
];

$row = 2;
foreach ($data as $item) {
    $sheet->setCellValue("A{$row}", $item[0]);
    $sheet->setCellValue("B{$row}", $item[1]);
    $sheet->setCellValue("C{$row}", $item[2]);
    $sheet->setCellValue("D{$row}", $item[3]);
    $row++;
}

$writer = new Xlsx($spreadsheet);
$writer->save($outputDir . '/du_lieu_sv_valid.xlsx');
echo "Tao xong: du_lieu_sv_valid.xlsx\n";

// File 2: du_lieu_sv_error.xlsx - co MSSV trung
$spreadsheet2 = new Spreadsheet();
$sheet2 = $spreadsheet2->getActiveSheet();

$sheet2->setCellValue('A1', 'MSSV');
$sheet2->setCellValue('B1', 'Ho ten');
$sheet2->setCellValue('C1', 'Lop');
$sheet2->setCellValue('D1', 'Email');

$errorData = [
    ['DH52200010', 'Nguyen X', 'D22_TH01', 'x@student.stu.edu.vn'],
    ['DH52200011', 'Tran Y', 'D22_TH01', 'y@student.stu.edu.vn'],
    ['DH52200010', 'Le Z', 'D22_TH02', 'z@student.stu.edu.vn'],
];

$row = 2;
foreach ($errorData as $item) {
    $sheet2->setCellValue("A{$row}", $item[0]);
    $sheet2->setCellValue("B{$row}", $item[1]);
    $sheet2->setCellValue("C{$row}", $item[2]);
    $sheet2->setCellValue("D{$row}", $item[3]);
    $row++;
}

$writer2 = new Xlsx($spreadsheet2);
$writer2->save($outputDir . '/du_lieu_sv_error.xlsx');
echo "Tao xong: du_lieu_sv_error.xlsx\n";

echo "Done!\n";
