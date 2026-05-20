<?php

namespace App\Modules\ATS\Resources;

use App\Modules\Shared\Resources\BaseResource;

class CandidateResource extends BaseResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'status' => $this->status,
            'current_stage' => $this->current_stage,
            'rating' => $this->rating,
            'resume_path' => $this->resume_path ? asset('storage/' . $this->resume_path) : null,
            'job_posting' => [
                'id' => $this->jobPosting?->id,
                'title' => $this->jobPosting?->title,
            ],
            // Conditionally load interviews if requested or eager loaded
            'interviews' => $this->whenLoaded('interviews', function () {
                return $this->interviews->map(function ($interview) {
                    return [
                        'id' => $interview->id,
                        'stage' => $interview->stage,
                        'scheduled_at' => $interview->scheduled_at,
                        'status' => $interview->status,
                        'rating' => $interview->rating,
                    ];
                });
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
