<?php

namespace Database\Seeders;

use App\Modules\Automation\Events\CandidateSelected;
use App\Modules\Automation\Events\EmployeeCreated;
use App\Modules\Automation\Events\InterviewScheduled;
use App\Modules\Automation\Events\LeaveApproved;
use App\Modules\Automation\Models\Workflow;
use App\Modules\Automation\Models\WorkflowAction;
use App\Modules\Tenant\Models\Tenant;
use Illuminate\Database\Seeder;

class WorkflowSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();
        if (!$tenant) {
            return;
        }

        $workflows = [
            [
                'name' => 'Welcome new employee',
                'event_type' => EmployeeCreated::class,
                'actions' => [
                    [
                        'type' => 'send_notification',
                        'configuration' => [
                            'type' => 'employee_welcome',
                            'title' => 'Welcome to the team!',
                            'message' => 'Your employee profile has been created.',
                            'category' => 'hr',
                            'priority' => 'normal',
                        ],
                        'order' => 0,
                    ],
                ],
            ],
            [
                'name' => 'Notify on leave approval',
                'event_type' => LeaveApproved::class,
                'actions' => [
                    [
                        'type' => 'send_notification',
                        'configuration' => [
                            'type' => 'leave_approved',
                            'title' => 'Leave approved',
                            'message' => 'Your leave request has been approved.',
                            'category' => 'leave',
                            'priority' => 'high',
                        ],
                        'order' => 0,
                    ],
                ],
            ],
            [
                'name' => 'Interview scheduled notification',
                'event_type' => InterviewScheduled::class,
                'actions' => [
                    [
                        'type' => 'send_notification',
                        'configuration' => [
                            'type' => 'interview_scheduled',
                            'title' => 'Interview scheduled',
                            'message' => 'A new interview has been scheduled.',
                            'category' => 'ats',
                            'priority' => 'high',
                        ],
                        'order' => 0,
                    ],
                ],
            ],
            [
                'name' => 'Onboarding tasks for selected candidate',
                'event_type' => CandidateSelected::class,
                'conditions' => [['field' => 'current_stage', 'operator' => '==', 'value' => 'Selected']],
                'actions' => [
                    [
                        'type' => 'create_task',
                        'configuration' => [
                            'title' => 'Prepare onboarding documents',
                            'description' => 'Automated task from candidate selection workflow.',
                            'due_days' => 3,
                        ],
                        'order' => 0,
                    ],
                    [
                        'type' => 'send_notification',
                        'configuration' => [
                            'type' => 'candidate_selected',
                            'title' => 'Candidate selected',
                            'message' => 'A candidate has been marked as selected. Onboarding tasks created.',
                            'category' => 'ats',
                            'priority' => 'high',
                        ],
                        'delay_minutes' => 0,
                        'order' => 1,
                    ],
                ],
            ],
        ];

        foreach ($workflows as $def) {
            $workflow = Workflow::firstOrCreate(
                ['tenant_id' => $tenant->id, 'name' => $def['name']],
                [
                    'event_type' => $def['event_type'],
                    'conditions' => $def['conditions'] ?? null,
                    'is_active' => true,
                ]
            );

            if ($workflow->actions()->count() === 0) {
                foreach ($def['actions'] as $action) {
                    WorkflowAction::create([
                        'workflow_id' => $workflow->id,
                        'type' => $action['type'],
                        'configuration' => $action['configuration'],
                        'delay_minutes' => $action['delay_minutes'] ?? 0,
                        'order' => $action['order'] ?? 0,
                    ]);
                }
            }
        }
    }
}
