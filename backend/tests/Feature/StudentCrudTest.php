<?php

namespace Tests\Feature;

use App\Models\GiangVien;
use App\Models\KyLvtn;
use App\Models\SinhVien;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentCrudTest extends TestCase
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

    private function createSampleStudents()
    {
        SinhVien::create([
            'mssv' => 'DH52100001',
            'hoTen' => 'Hoang Van Em',
            'lop' => 'D21_TH01',
            'email' => 'em@student.stu.edu.vn',
            'matKhau' => bcrypt('123456'),
            'ky_lvtn_id' => $this->ky->id,
        ]);
        SinhVien::create([
            'mssv' => 'DH52100002',
            'hoTen' => 'Vo Thi Phuong',
            'lop' => 'D21_TH02',
            'email' => 'phuong@student.stu.edu.vn',
            'matKhau' => bcrypt('123456'),
            'ky_lvtn_id' => $this->ky->id,
        ]);
    }

    public function test_get_students_list()
    {
        $this->createSampleStudents();

        $response = $this->actingAs($this->admin)
            ->getJson('/api/students');

        $response->assertStatus(200);
        $this->markTestIncomplete('Stub - can list SV');
    }

    public function test_get_students_filter_by_lop()
    {
        $this->createSampleStudents();

        $response = $this->actingAs($this->admin)
            ->getJson('/api/students?lop=D21_TH01');

        $response->assertStatus(200);
        $this->markTestIncomplete('Stub - can filter lop');
    }

    public function test_get_students_filter_by_gvhd()
    {
        $this->createSampleStudents();

        $response = $this->actingAs($this->admin)
            ->getJson('/api/students?gvhd_id=GV001');

        $response->assertStatus(200);
        $this->markTestIncomplete('Stub - can filter GVHD');
    }

    public function test_get_students_search()
    {
        $this->createSampleStudents();

        $response = $this->actingAs($this->admin)
            ->getJson('/api/students?search=Hoang');

        $response->assertStatus(200);
        $this->markTestIncomplete('Stub - can search SV');
    }

    public function test_create_student()
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/students', [
                'mssv' => 'DH52100099',
                'hoTen' => 'Test Student',
                'lop' => 'D21_TH01',
                'email' => 'test@student.stu.edu.vn',
                'ky_lvtn_id' => $this->ky->id,
            ]);

        $response->assertStatus(201);
        $this->markTestIncomplete('Stub - can tao SV');
    }

    public function test_update_student()
    {
        $this->createSampleStudents();

        $response = $this->actingAs($this->admin)
            ->putJson('/api/students/DH52100001', [
                'hoTen' => 'Hoang Van Updated',
            ]);

        $response->assertStatus(200);
        $this->markTestIncomplete('Stub - can update SV');
    }

    public function test_delete_student()
    {
        $this->createSampleStudents();

        $response = $this->actingAs($this->admin)
            ->deleteJson('/api/students/DH52100001');

        $response->assertStatus(200);
        $this->markTestIncomplete('Stub - can xoa SV');
    }
}
