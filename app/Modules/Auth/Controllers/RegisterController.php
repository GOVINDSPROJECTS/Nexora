<?php

namespace App\Modules\Auth\Controllers;

use App\Modules\Shared\Controllers\BaseController;
use App\Modules\Auth\Requests\RegisterRequest;
use App\Modules\Auth\Services\RegistrationService;
use Illuminate\Http\JsonResponse;

class RegisterController extends BaseController
{
    public function __construct(protected RegistrationService $registrationService)
    {
    }

    /**
     * Handle tenant registration.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->registrationService->registerTenant($request->validated());

        return $this->success([
            'user' => $result['user'],
            'tenant' => $result['tenant'],
        ], 'Tenant registered successfully', 201);
    }
}
