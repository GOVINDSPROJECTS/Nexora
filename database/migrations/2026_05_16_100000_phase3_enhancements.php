<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('category');
            $table->boolean('in_app')->default(true);
            $table->boolean('email')->default(true);
            $table->timestamps();
            $table->unique(['user_id', 'category']);
        });

        Schema::table('tenants', function (Blueprint $table) {
            if (!Schema::hasColumn('tenants', 'onboarding_completed_at')) {
                $table->timestamp('onboarding_completed_at')->nullable()->after('settings');
            }
            if (!Schema::hasColumn('tenants', 'branding')) {
                $table->json('branding')->nullable()->after('onboarding_completed_at');
            }
        });

        Schema::table('candidates', function (Blueprint $table) {
            $table->index(['tenant_id', 'current_stage']);
            $table->index(['tenant_id', 'job_posting_id']);
        });

        Schema::table('interviews', function (Blueprint $table) {
            $table->index(['tenant_id', 'candidate_id']);
            $table->index(['scheduled_at']);
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->index(['tenant_id', 'department_id']);
            $table->index(['tenant_id', 'status']);
        });

        Schema::table('leave_requests', function (Blueprint $table) {
            $table->index(['tenant_id', 'status']);
            $table->index(['start_date']);
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->index(['tenant_id', 'status']);
            $table->index(['due_date']);
        });

        Schema::table('workflows', function (Blueprint $table) {
            $table->index(['tenant_id', 'event_type', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');

        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['onboarding_completed_at', 'branding']);
        });
    }
};
