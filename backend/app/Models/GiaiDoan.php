<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class GiaiDoan extends Model
{
    protected $table = 'giai_doan';
    public $timestamps = false;

    protected $fillable = [
        'mo_ta',
        'loai',
        'ngay_bat_dau',
        'ngay_ket_thuc',
        'data',
    ];

    /**
     * Helper: Tìm giai đoạn hiện hành hoặc sắp tới để hiển thị lên Dashboard.
     * Tự động lấy tham chiếu từ Ngày giả lập (CauHinh::getSimulatedDate)
     */
    public static function getDashboardCurrentStage()
    {
        $today = \App\Models\CauHinh::getSimulatedDate();
        $giai_doans = self::orderBy('ngay_bat_dau', 'asc')->get();
        $useDateCustom = CauHinh::where('key', 'thoiGianTuyChinh')->first();
        if ($useDateCustom && ($useDateCustom->value === true || $useDateCustom->value === 'true')) {
            $dateCustomJson = CauHinh::where('key', 'tg_TuyChinh')->first();
            $dateCustomJson = json_decode($dateCustomJson->value);
            $dateCustom = Carbon::create(
                $dateCustomJson->year,
                $dateCustomJson->month,
                $dateCustomJson->day
            );
            $today = $dateCustom;
        }

        $currentStageObj = GiaiDoan::where('ngay_bat_dau', '<=', $today)
            ->where('ngay_ket_thuc', '>=', $today)
            ->first();

        return [
            'stage_object' => $currentStageObj,
            'stage_index' => $currentStageObj ? $currentStageObj->id : null,
            'total_stages' => $giai_doans->count()
        ];
    }
}
