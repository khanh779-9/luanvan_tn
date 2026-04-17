<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CauHinh;

class CauHinhController extends Controller
{
   
    public function getThoiGianTuyChinh()
    {
        $tgTuyChinh = CauHinh::where('key', 'tg_TuyChinh')->first();
        $thoiGianTuyChinh = CauHinh::where('key', 'thoiGianTuyChinh')->first();
        return response()->json([
            'thoiGianTuyChinh' => $thoiGianTuyChinh ? ($thoiGianTuyChinh->value === 'true') : false,
            'tg_TuyChinh' => $tgTuyChinh ? json_decode($tgTuyChinh->value, true) : null,
        ]);
    }

    
    public function setThoiGianTuyChinh(Request $request)
    {
        $validated = $request->validate([
            'thoiGianTuyChinh' => 'required|boolean',
            'tg_TuyChinh' => 'required|array',
            'tg_TuyChinh.date' => 'required|integer|min:1|max:31',
            'tg_TuyChinh.month' => 'required|integer|min:1|max:12',
            'tg_TuyChinh.year' => 'required|integer|min:2000',
        ]);

        // Update or create thoiGianTuyChinh
        CauHinh::updateOrCreate(
            ['key' => 'thoiGianTuyChinh'],
            ['value' => $validated['thoiGianTuyChinh'] ? 'true' : 'false']
        );
        // Update or create tg_TuyChinh
        CauHinh::updateOrCreate(
            ['key' => 'tg_TuyChinh'],
            ['value' => json_encode($validated['tg_TuyChinh'])]
        );

        return response()->json(['message' => 'Cập nhật thành công']);
    }
    public function createKey(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string|max:50|unique:cau_hinh,key',
            'value' => 'nullable|string|max:255',
        ]);

        $cauHinh = CauHinh::create($validated);

        return response()->json([
            'message' => 'Cấu hình mới đã được tạo.',
            'data' => $cauHinh,
        ], 201);
    }

    public function updateKey(Request $request, $key)
    {
        $cauHinh = CauHinh::where('key', $key)->first();
        if (!$cauHinh) {
            return response()->json([
                'message' => 'Không tìm thấy cấu hình với key: ' . $key,
            ], 404);
        }

        $validated = $request->validate([
            'value' => 'nullable|string|max:255',
        ]);

        $cauHinh->update($validated);

        return response()->json([
            'message' => 'Cấu hình đã được cập nhật.',
            'data' => $cauHinh,
        ]);
    }
}
