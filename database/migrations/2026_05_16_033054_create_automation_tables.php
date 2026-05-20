<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Workflows
        Schema::create('workflows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('name');
            $table->string('event_type'); // e.g., 'App\Modules\Employee\Events\EmployeeCreated'
            $table->json('conditions')->nullable(); // JSON rules
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Workflow Actions
        Schema::create('workflow_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('workflows')->onDelete('cascade');
            $table->string('type'); // e.g., 'send_email', 'send_notification', 'update_status'
            $table->json('configuration')->nullable(); // Template, recipient, etc.
            $table->integer('delay_minutes')->default(0);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // Workflow Logs
        Schema::create('workflow_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('workflows')->onDelete('cascade');
            $table->nullableMorphs('target'); // The entity the workflow ran on
            $table->string('status'); // success, failed
            $table->text('error_message')->nullable();
            $table->json('result_data')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workflow_logs');
        Schema::dropIfExists('workflow_actions');
        Schema::dropIfExists('workflows');
    }
};
