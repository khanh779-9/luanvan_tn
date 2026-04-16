<?php

namespace Tests\Feature;

use App\Models\GiangVien;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LecturerCrudTest extends TestCase
{
    use RefreshDatabase;

    private $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = GiangVien::create([
            'maGV' => 'GV001',
            'tenGV' => 'Admin Test',
            'email' => 'admin@test.com',
            'matKhau' => bcrypt('123456'),
            'isAdmin' => true,
        ]);
    }

    private function createSampleLecturers()
    {
        GiangVien::create([
            'maGV' => 'GV002',
            'tenGV' => 'Tran Thi Binh',
            'email' => 'binh@stu.edu.vn',
            'hocVi' => 'TS',
            'matKhau' => bcrypt('123456'),
            'isAdmin' => false,
        ]);
        GiangVien::create([
            'maGV' => 'GV003',
            'tenGV' => 'Le Van Cuong',
            'email' => 'cuong@stu.edu.vn',
            'hocVi' => 'ThS',
            'matKhau' => bcrypt('123456'),
            'isAdmin' => false,
        ]);
    }

    public function test_get_lecturers_with_counts()
    {
        $this->createSampleLecturers();

        $response = $this->actingAs($this->admin)
            ->getJson('/api/giang-vien');

        $response->assertStatus(200);
        $this->markTestIncomplete('Stub - can list GV voi counts');
    }

    public function test_create_lecturer()
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/giang-vien', [
                'maGV' => 'GV010',
                'tenGV' => 'Nguyen Moi',
                'email' => 'moi@stu.edu.vn',
                'hocVi' => 'ThS',
                'matKhau' => '123456',
            ]);

        $response->assertStatus(201);
        $this->markTestIncomplete('Stub - can tao GV');
    }

    public function test_create_lecturer_duplicate_email()
    {
        $this->createSampleLecturers();

        $response = $this->actingAs($this->admin)
            ->postJson('/api/giang-vien', [
                'maGV' => 'GV099',
                'tenGV' => 'Duplicate Email',
                'email' => 'binh@stu.edu.vn',
                'hocVi' => 'ThS',
                'matKhau' => '123456',
            ]);

        $response->assertStatus(422);
        $this->markTestIncomplete('Stub - can reject email trung');
    }

    public function test_update_lecturer()
    {
        $this->createSampleLecturers();

        $response = $this->actingAs($this->admin)
            ->putJson('/api/giang-vien/GV002', [
                'tenGV' => 'Tran Thi Updated',
            ]);

        $response->assertStatus(200);
        $this->markTestIncomplete('Stub - can update GV');
    }

    public function test_update_lecturer_without_password()
    {
        $this->createSampleLecturers();

        $response = $this->actingAs($this->admin)
            ->putJson('/api/giang-vien/GV002', [
                'tenGV' => 'Ten Moi',
            ]);

        $response->assertStatus(200);
        $this->markTestIncomplete('Stub - password optional khi update');
    }

    public function test_delete_lecturer()
    {
        $this->createSampleLecturers();

        $response = $this->actingAs($this->admin)
            ->deleteJson('/api/giang-vien/GV002');

        $response->assertStatus(200);
        $this->markTestIncomplete('Stub - can xoa GV');
    }
}
