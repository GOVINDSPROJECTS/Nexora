<?php

namespace App\Modules\Employee\Controllers;

use App\Modules\Shared\Controllers\BaseController;
use App\Modules\Employee\Requests\StoreEmployeeRequest;
use App\Modules\Employee\Services\EmployeeService;
use App\Modules\Employee\Resources\EmployeeResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeController extends BaseController
{
    public function __construct(protected EmployeeService $service)
    {
    }

    /**
     * List employees.
     */
    public function index(Request $request): JsonResponse
    {
        $employees = $this->service->list($request->all());
        return $this->success(EmployeeResource::collection($employees)->response()->getData(true));
    }

    /**
     * Store a new employee.
     */
    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $employee = $this->service->create($request->validated());
        return $this->success(new EmployeeResource($employee), 'Employee created successfully', 201);
    }

    /**
     * Display the specified employee.
     */
    public function show(int $id): JsonResponse
    {
        $employee = $this->service->getById($id);
        if (!$employee) return $this->error('Employee not found', 404);
        
        return $this->success(new EmployeeResource($employee->load('manager', 'user.roles')));
    }

    /**
     * Update the specified employee.
     */
    public function update(StoreEmployeeRequest $request, int $id): JsonResponse
    {
        $employee = $this->service->update($id, $request->validated());
        if (!$employee) return $this->error('Employee not found or update failed', 404);

        return $this->success(new EmployeeResource($this->service->getById($id)), 'Employee updated successfully');
    }

    /**
     * Remove the specified employee.
     */
    public function destroy(int $id): JsonResponse
    {
        $success = $this->service->delete($id);
        if (!$success) return $this->error('Employee not found', 404);

        return $this->success(null, 'Employee deleted successfully');
    }
}
