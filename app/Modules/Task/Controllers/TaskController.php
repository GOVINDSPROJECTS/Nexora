<?php

namespace App\Modules\Task\Controllers;

use App\Modules\Shared\Controllers\BaseController;
use App\Modules\Task\Models\Task;
use App\Modules\Task\Models\TaskActivity;
use App\Modules\Task\Models\TaskComment;
use App\Modules\Task\Resources\TaskResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Task::with(['assignee', 'creator'])->withCount('comments');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        $tasks = $query->orderBy('order')->get();

        return $this->success(TaskResource::collection($tasks));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'nullable|string|in:todo,in-progress,review,completed',
            'priority'    => 'nullable|string|in:low,medium,high,critical',
            'due_date'    => 'nullable|date',
            'assigned_to' => 'nullable|exists:employees,id',
        ]);

        $validated['created_by'] = Auth::id();
        $validated['tenant_id'] = Auth::user()->tenant_id;

        $task = Task::create($validated);

        TaskActivity::create([
            'tenant_id' => $task->tenant_id,
            'task_id'   => $task->id,
            'user_id'   => Auth::id(),
            'activity_type' => 'created',
            'description'   => 'Task created by ' . Auth::user()->name,
        ]);

        return $this->success(new TaskResource($task->load(['assignee', 'creator'])), 'Task created successfully', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $task = Task::find($id);
        if (!$task) return $this->error('Task not found', 404);

        $validated = $request->validate([
            'title'       => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'nullable|string|in:todo,in-progress,review,completed',
            'priority'    => 'nullable|string|in:low,medium,high,critical',
            'due_date'    => 'nullable|date',
            'assigned_to' => 'nullable|exists:employees,id',
            'order'       => 'nullable|integer',
        ]);

        $oldStatus = $task->status;
        $task->update($validated);

        if (isset($validated['status']) && $oldStatus !== $validated['status']) {
            TaskActivity::create([
                'tenant_id' => $task->tenant_id,
                'task_id'   => $task->id,
                'user_id'   => Auth::id(),
                'activity_type' => 'status_changed',
                'description'   => "Status changed from $oldStatus to " . $validated['status'],
                'properties'    => ['old' => $oldStatus, 'new' => $validated['status']]
            ]);
        }

        return $this->success(new TaskResource($task->load(['assignee', 'creator'])));
    }

    public function addComment(Request $request, int $id): JsonResponse
    {
        $request->validate(['content' => 'required|string']);

        $comment = TaskComment::create([
            'tenant_id' => Auth::user()->tenant_id,
            'task_id'   => $id,
            'user_id'   => Auth::id(),
            'content'   => $request->content,
        ]);

        return $this->success($comment, 'Comment added');
    }

    public function timeline(int $id): JsonResponse
    {
        $activities = TaskActivity::with('user')
            ->where('task_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->success($activities);
    }
}
