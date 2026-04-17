<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CauHinh extends Model
{
    protected $table = 'cau_hinh';

    protected $fillable = [
        'key', 'value',
    ];

    /**
     * Helper: Lấy thời gian hiện tại dựa trên Cấu hình Time Manipulation (Giả lập ngày)
     */
    public static function getSimulatedDate()
    {
        $today = date('Y-m-d');
        $useCustomDate = self::where('key', 'thoiGianTuyChinh')->first();

        if ($useCustomDate && ($useCustomDate->value === 'true'|| $useCustomDate->value === true)) {
            $dateCustomObj = self::where('key', 'tg_TuyChinh')->first();
            if ($dateCustomObj) {
                // Parse date config
                $dateCustomJson = json_decode($dateCustomObj->value);
                // Format thành Y-m-d (Đảm bảo date và month có 2 chữ số)
                $day = str_pad($dateCustomJson->date ?? $dateCustomJson->day, 2, '0', STR_PAD_LEFT);
                $month = str_pad($dateCustomJson->month, 2, '0', STR_PAD_LEFT);
                $year = $dateCustomJson->year;
                
                $today = "$year-$month-$day";
            }
        }

        return $today;
    }
}
