<?php

namespace App\Modules\Task\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'title'       => $this->title,
            'description' => $this->description,
            'status'      => $this->status,
            'priority'    => $this->priority,
            'due_date'    => $this->due_date ? $this->due_date->format('Y-m-d') : null,
            'order'       => $this->order,
            'assignee'    => $this->whenLoaded('assignee', function () {
                return [
                    'id' => $this->assignee->id,
                    'name' => $this->assignee->name,
                    'profile_photo' => $this->assignee->profile_photo,
                ];
            }),
            'creator'     => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                ];
            }),
            'comments_count' => $this->comments_count,
            'created_at'  => $this->created_at->toDateTimeString(),
        ];
    }
}
