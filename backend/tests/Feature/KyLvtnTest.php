<?php

namespace Tests\Feature;

use App\Models\GiangVien;
use App\Models\KyLvtn;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KyLvtnTest extends TestCase
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

    public function test_get_ky_lvtn_list()
    {
        KyLvtn::create(['ten' => 'HK1 2025-2026', 'is_active' => false]);
        KyLvtn::create(['ten' => 'HK2 2025-2026', 'is_active' => true]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/ky-lvtn');

        $response->assertStatus(200);
        $this->markTestIncomplete('Stub - can list ky LVTN');
    }

    public function test_create_ky_lvtn()
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/ky-lvtn', [
                'ten' => 'HK2 2025-2026',
                'ngay_bat_dau' => '2026-02-01',
                'ngay_ket_thuc' => '2026-06-30',
            ]);

        $response->assertStatus(201);
        $this->markTestIncomplete('Stub - can tao ky LVTN');
    }

    public function test_update_ky_lvtn()
    {
        $ky = KyLvtn::create([
            'ten' => 'HK2 2025-2026',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/ky-lvtn/{$ky->id}", [
                'ten' => 'HK2 Updated',
                'ngay_bao_ve' => '2026-06-15',
            ]);

        $response->assertStatus(200);
        $this->markTestIncomplete('Stub - can update ky LVTN');
    }

    public function test_create_ky_sets_active()
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/ky-lvtn', [
                'ten' => 'Ky Moi',
            ]);

        $response->assertStatus(201);
        $this->markTestIncomplete('Stub - ky moi mac dinh active');
    }
}
