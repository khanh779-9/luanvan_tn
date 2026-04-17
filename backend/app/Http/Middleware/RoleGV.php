<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleGV
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        if (!$user || !($user->role === 'gv' || $user->isAdmin ?? false)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return $next($request);
    }
}
