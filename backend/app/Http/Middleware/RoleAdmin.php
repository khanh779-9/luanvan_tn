<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        if (!$user || !($user->role === 'thuky' || $user->role === 'admin' || $user->isAdmin ?? false)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return $next($request);
    }
}
