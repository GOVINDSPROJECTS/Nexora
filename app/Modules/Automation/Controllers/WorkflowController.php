<?php

namespace App\Modules\Automation\Controllers;

use App\Modules\Automation\Models\Workflow;
use App\Modules\Automation\Models\WorkflowAction;
use App\Modules\Shared\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkflowController extends BaseController
{
    public function index(): JsonResponse
    {
        $workflows = Workflow::with('actions')->latest()->get();
        return $this->success($workflows);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'event_type' => 'required|string',
            'conditions' => 'nullable|array',
            'is_active' => 'boolean',
            'actions' => 'nullable|array',
            'actions.*.type' => 'required|string|in:send_email,send_notification,update_status,create_task',
            'actions.*.configuration' => 'nullable|array',
            'actions.*.delay_minutes' => 'integer|min:0',
            'actions.*.order' => 'integer|min:0',
        ]);

        $workflow = Workflow::create([
            'name' => $validated['name'],
            'event_type' => $validated['event_type'],
            'conditions' => $validated['conditions'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        foreach ($validated['actions'] ?? [] as $index => $action) {
            WorkflowAction::create([
                'workflow_id' => $workflow->id,
                'type' => $action['type'],
                'configuration' => $action['configuration'] ?? [],
                'delay_minutes' => $action['delay_minutes'] ?? 0,
                'order' => $action['order'] ?? $index,
            ]);
        }

        return $this->success($workflow->load('actions'), 'Workflow created', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $workflow = Workflow::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'event_type' => 'sometimes|string',
            'conditions' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $workflow->update($validated);
        return $this->success($workflow->load('actions'), 'Workflow updated');
    }

    public function destroy(int $id): JsonResponse
    {
        Workflow::findOrFail($id)->delete();
        return $this->success(null, 'Workflow deleted');
    }

    public function logs(int $id): JsonResponse
    {
        $workflow = Workflow::findOrFail($id);
        $logs = $workflow->logs()->latest()->limit(50)->get();
        return $this->success($logs);
    }
}
