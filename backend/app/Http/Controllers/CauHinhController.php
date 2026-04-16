<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CauHinh;

class CauHinhController extends Controller
{
    // API trả về giai đoạn hiện tại
    public function giaiDoan()
    {
        $giaiDoan = CauHinh::where('key', 'giaiDoan')->first();
        return response()->json([
            'giaiDoan' => $giaiDoan ? $giaiDoan->value : null,
        ]);
    }
}
