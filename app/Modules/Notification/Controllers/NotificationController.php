<?php

namespace App\Modules\Notification\Controllers;

use App\Modules\Notification\Models\NotificationPreference;
use App\Modules\Shared\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Auth::user()->notifications()
            ->where('tenant_id', Auth::user()->tenant_id);

        if ($request->boolean('unread_only')) {
            $query->whereNull('read_at');
        }

        if ($request->category) {
            $query->where('data->category', $request->category);
        }

        $notifications = $query->latest()->paginate(min($request->integer('per_page', 20), 50));

        return $this->success([
            'items' => $notifications->items(),
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'last_page' => $notifications->lastPage(),
            ],
            'unread_count' => Auth::user()->unreadNotifications()
                ->where('tenant_id', Auth::user()->tenant_id)
                ->count(),
        ]);
    }

    public function markAsRead(string $id): JsonResponse
    {
        $notification = Auth::user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return $this->success(null, 'Notification marked as read');
    }

    public function markAllAsRead(): JsonResponse
    {
        Auth::user()->unreadNotifications()
            ->where('tenant_id', Auth::user()->tenant_id)
            ->update(['read_at' => now()]);

        return $this->success(null, 'All notifications marked as read');
    }

    public function preferences(): JsonResponse
    {
        $prefs = NotificationPreference::where('user_id', Auth::id())->get();
        return $this->success($prefs);
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'preferences' => 'required|array',
            'preferences.*.category' => 'required|string',
            'preferences.*.in_app' => 'boolean',
            'preferences.*.email' => 'boolean',
        ]);

        foreach ($validated['preferences'] as $pref) {
            NotificationPreference::updateOrCreate(
                ['user_id' => Auth::id(), 'category' => $pref['category']],
                ['in_app' => $pref['in_app'] ?? true, 'email' => $pref['email'] ?? true]
            );
        }

        return $this->success(null, 'Preferences updated');
    }
}
