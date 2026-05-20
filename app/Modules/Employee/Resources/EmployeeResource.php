<?php

namespace App\Modules\Employee\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'employee_id'     => $this->employee_id,
            'name'            => $this->name,
            'email'           => $this->email,
            'work_email'      => $this->work_email,
            'phone'           => $this->phone,
            'department'      => $this->department ? [
                'id' => $this->department->id,
                'name' => $this->department->name,
                'code' => $this->department->code,
            ] : null,
            'designation'     => $this->designation ? [
                'id' => $this->designation->id,
                'name' => $this->designation->name,
            ] : null,
            'joining_date'    => $this->joining_date,
            'employment_type' => $this->employment_type,
            'status'          => $this->status,
            'profile_photo'   => $this->profile_photo,
            'manager'         => new EmployeeResource($this->whenLoaded('manager')),
            'user'            => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'email' => $this->user->email,
                    'role' => $this->user->roles->first()?->name ?? 'Employee',
                ];
            }),
            'created_at'      => $this->created_at,
            'updated_at'      => $this->updated_at,
        ];
    }
}
