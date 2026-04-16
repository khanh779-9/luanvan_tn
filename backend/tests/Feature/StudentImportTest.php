<?php

namespace Tests\Feature;

use App\Models\GiangVien;
use App\Models\KyLvtn;
use App\Models\SinhVien;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class StudentImportTest extends TestCase
{
    use RefreshDatabase;

    private $admin;
    private $ky;

    protected function setUp(): void
    {
        parent::setUp();
        $this->ky = KyLvtn::create([
            'ten' => 'HK2 2025-2026',
            'is_active' => true,
        ]);
        $this->admin = GiangVien::create([
            'maGV' => 'GV001',
            'tenGV' => 'Admin Test',
            'email' => 'admin@test.com',
            'matKhau' => bcrypt('123456'),
            'isAdmin' => true,
        ]);
    }

    public function test_import_valid_excel()
    {
        $file = new UploadedFile(
            base_path('tests/fixtures/du_lieu_sv_valid.xlsx'),
            'du_lieu_sv_valid.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );

        $response = $this->actingAs($this->admin)
            ->postJson('/api/students/import', [
                'file' => $file,
                'ky_lvtn_id' => $this->ky->id,
            ]);

        $response->assertStatus(200);
        $this->markTestIncomplete('Stub - can controller import');
    }

    public function test_import_duplicate_mssv()
    {
        $file = new UploadedFile(
            base_path('tests/fixtures/du_lieu_sv_error.xlsx'),
            'du_lieu_sv_error.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );

        $response = $this->actingAs($this->admin)
            ->postJson('/api/students/import', [
                'file' => $file,
                'ky_lvtn_id' => $this->ky->id,
            ]);

        $this->markTestIncomplete('Stub - can xu ly MSSV trung');
    }

    public function test_import_requires_auth()
    {
        $response = $this->postJson('/api/students/import', []);

        $response->assertStatus(401);
        $this->markTestIncomplete('Stub - can auth middleware');
    }

    public function test_import_requires_file()
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/students/import', []);

        $response->assertStatus(422);
        $this->markTestIncomplete('Stub - can validation file');
    }
}
