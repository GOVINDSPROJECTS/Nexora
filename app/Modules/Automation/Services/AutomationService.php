<?php

namespace App\Modules\Automation\Services;

use App\Modules\Automation\Models\Workflow;
use App\Modules\Automation\Models\WorkflowLog;
use App\Modules\Core\Tenancy\TenantManager;
use App\Modules\Notification\Services\NotificationService;
use Illuminate\Support\Facades\Log;

class AutomationService
{
    public function handleEvent($event): void
    {
        $eventType = get_class($event);
        $tenantId = $this->resolveTenantId($event);

        $query = Workflow::where('event_type', $eventType)
            ->where('is_active', true)
            ->with('actions');

        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }

        foreach ($query->get() as $workflow) {
            $this->executeWorkflow($workflow, $event);
        }
    }

    protected function resolveTenantId($event): ?int
    {
        $target = $event->target ?? null;
        if ($target && isset($target->tenant_id)) {
            return $target->tenant_id;
        }

        return app(TenantManager::class)->getTenantId();
    }

    protected function executeWorkflow(Workflow $workflow, $event): void
    {
        if (!$this->evaluateConditions($workflow->conditions, $event)) {
            return;
        }

        foreach ($workflow->actions as $action) {
            if ($action->delay_minutes > 0) {
                \App\Modules\Automation\Jobs\ExecuteWorkflowActionJob::dispatch($action, $event)
                    ->delay(now()->addMinutes($action->delay_minutes));
                continue;
            }

            $this->runAction($action, $event);
        }
    }

    public function runAction($action, $event): void
    {
        try {
            $this->executeAction($action, $event);

            WorkflowLog::create([
                'workflow_id' => $action->workflow_id,
                'target_type' => get_class($event->target ?? $event),
                'target_id' => $event->target->id ?? 0,
                'status' => 'success',
            ]);
        } catch (\Exception $e) {
            Log::error('Workflow action failed: ' . $e->getMessage());

            WorkflowLog::create([
                'workflow_id' => $action->workflow_id,
                'target_type' => get_class($event->target ?? $event),
                'target_id' => $event->target->id ?? 0,
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
        }
    }

    protected function evaluateConditions($conditions, $event): bool
    {
        if (empty($conditions)) {
            return true;
        }

        $target = $event->target ?? $event;

        foreach ($conditions as $condition) {
            $field = $condition['field'] ?? null;
            $operator = $condition['operator'] ?? '==';
            $value = $condition['value'] ?? null;

            if (!$field) {
                continue;
            }

            $actualValue = data_get($target, $field);

            $match = match ($operator) {
                '==', 'equals' => $actualValue == $value,
                '!=', 'not_equals' => $actualValue != $value,
                '>' => $actualValue > $value,
                '<' => $actualValue < $value,
                'in' => is_array($value) && in_array($actualValue, $value),
                'contains' => str_contains((string) $actualValue, (string) $value),
                default => true,
            };

            if (!$match) {
                return false;
            }
        }

        return true;
    }

    public function executeAction($action, $event): void
    {
        match ($action->type) {
            'send_email' => $this->sendEmail($action->configuration, $event),
            'send_notification' => $this->sendNotification($action->configuration, $event),
            'update_status' => $this->updateStatus($action->configuration, $event),
            'create_task' => $this->createTask($action->configuration, $event),
            default => null,
        };
    }

    protected function sendEmail($config, $event): void
    {
        $user = $this->resolveUser($event);
        if (!$user) {
            return;
        }

        app(NotificationService::class)->queueEmail(
            $user,
            $config['subject'] ?? 'Nexora Update',
            $config['body'] ?? 'An automated workflow was triggered.',
            $config['category'] ?? 'automation'
        );
    }

    protected function sendNotification($config, $event): void
    {
        $user = $this->resolveUser($event);
        if (!$user) {
            return;
        }

        app(NotificationService::class)->send(
            $user,
            $config['type'] ?? 'automation',
            $config['title'] ?? 'Automation Update',
            $config['message'] ?? 'A workflow action was triggered.',
            $config['category'] ?? 'automation',
            $config['priority'] ?? 'normal',
            $config['data'] ?? []
        );
    }

    protected function updateStatus($config, $event): void
    {
        $target = $event->target ?? null;
        $field = $config['field'] ?? 'status';
        $value = $config['value'] ?? null;

        if ($target && $value !== null) {
            $target->update([$field => $value]);
        }
    }

    protected function createTask($config, $event): void
    {
        if (!class_exists(\App\Modules\Task\Models\Task::class)) {
            return;
        }

        $target = $event->target ?? null;
        $tenantId = $target->tenant_id ?? app(TenantManager::class)->getTenantId();

        \App\Modules\Task\Models\Task::create([
            'tenant_id' => $tenantId,
            'title' => $config['title'] ?? 'Automated Task',
            'description' => $config['description'] ?? '',
            'assigned_to' => $config['assigned_to'] ?? null,
            'due_date' => now()->addDays($config['due_days'] ?? 1),
            'status' => 'todo',
            'created_by' => auth()->id(),
        ]);
    }

    protected function resolveUser($event)
    {
        if (isset($event->user)) {
            return $event->user;
        }

        $target = $event->target ?? null;
        if (!$target) {
            return null;
        }

        if (method_exists($target, 'user') && $target->user) {
            return $target->user;
        }

        if (method_exists($target, 'employee') && $target->employee?->user) {
            return $target->employee->user;
        }

        if ($target instanceof \App\Modules\Employee\Models\Employee && $target->user_id) {
            return \App\Models\User::find($target->user_id);
        }

        if ($target instanceof \App\Modules\Leave\Models\LeaveRequest) {
            return $target->employee?->user;
        }

        return null;
    }
}
