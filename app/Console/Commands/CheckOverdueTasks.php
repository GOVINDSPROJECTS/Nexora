<?php

namespace App\Console\Commands;

use App\Modules\Automation\Events\TaskOverdue;
use App\Modules\Task\Models\Task;
use Illuminate\Console\Command;

class CheckOverdueTasks extends Command
{
    protected $signature = 'nexora:check-overdue-tasks';
    protected $description = 'Dispatch automation events for overdue tasks';

    public function handle(): int
    {
        Task::whereNotIn('status', ['completed'])
            ->whereNotNull('due_date')
            ->where('due_date', '<', now()->startOfDay())
            ->each(function (Task $task) {
                event(new TaskOverdue($task));
            });

        $this->info('Overdue task check completed.');
        return self::SUCCESS;
    }
}
