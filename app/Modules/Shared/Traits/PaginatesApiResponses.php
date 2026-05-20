<?php

namespace App\Modules\Shared\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

trait PaginatesApiResponses
{
    protected function paginated($query, string $resourceClass, Request $request): JsonResponse
    {
        $perPage = min($request->integer('per_page', 15), 100);
        $paginator = $query->paginate($perPage);

        $data = $resourceClass::collection($paginator->items())->resolve();

        return $this->success([
            'items' => $data,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
        ]);
    }
}
