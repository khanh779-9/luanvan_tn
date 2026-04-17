<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GiaiDoan extends Model
{
    protected $table = 'giai_doan';
    public $timestamps = false;

    protected $fillable = [
        'mo_ta', 'loai', 'ngay_bat_dau', 'ngay_ket_thuc', 'data',
    ];

    /**
     * Helper: Tìm giai đoạn hiện hành hoặc sắp tới để hiển thị lên Dashboard.
     * Tự động lấy tham chiếu từ Ngày giả lập (CauHinh::getSimulatedDate)
     */
    public static function getDashboardCurrentStage()
    {
        $today = \App\Models\CauHinh::getSimulatedDate();
        $giai_doans = self::orderBy('ngay_bat_dau', 'asc')->get();
        
        $currentStageObj = null;
        $currentIndex = null;

        foreach ($giai_doans as $index => $gd) {
            // Chỉ cần ngày kết thúc còn trong tương lai/hiện tại
            if ($gd->ngay_ket_thuc >= $today) {
                $currentStageObj = [
                    'mo_ta' => $gd->mo_ta,
                    'ngay_bat_dau' => $gd->ngay_bat_dau,
                    'ngay_ket_thuc' => $gd->ngay_ket_thuc
                ];
                $currentIndex = $index ;
                break;
            }
        }

        // Nếu tất cả các stage đều đã expired, thiết lập chỉ mục thành stage cuối cùng
        if (is_null($currentIndex) && $giai_doans->isNotEmpty()) {
            $currentIndex = $giai_doans->count();
        }

        return [
            'stage_object' => $currentStageObj,
            'stage_index' => $currentIndex,
            'total_stages' => $giai_doans->count()
        ];
    }
}
