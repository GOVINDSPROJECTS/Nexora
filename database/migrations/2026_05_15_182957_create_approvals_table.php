<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->morphs('approvable'); // Link to any model (LeaveRequest, Task, etc.)
            $table->string('status')->default('pending'); // pending, approved, rejected, cancelled
            $table->text('comment')->nullable();
            $table->foreignId('action_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('action_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approvals');
    }
};
