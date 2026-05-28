import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import React from 'react';
import { useAuthStore } from '@/app/store/authStore';
import LoginPage from '@/app/pages/Auth/LoginPage';
import RegisterPage from '@/app/pages/Auth/RegisterPage';
import DashboardPage from '@/app/pages/DashboardPage';
import AuthenticatedLayout from '@/app/layouts/AuthenticatedLayout';
import EmployeeListingPage from '@/app/pages/Employee/EmployeeListingPage';
import CreateEmployeePage from '@/app/pages/Employee/CreateEmployeePage';
import EditEmployeePage from '@/app/pages/Employee/EditEmployeePage';
import LeaveRequestPage from '@/app/pages/Leave/LeaveRequestPage';
import AttendancePage from '@/app/pages/Attendance/AttendancePage';
import JobListingPage from '@/app/pages/ATS/JobListingPage';
import CandidatePipelinePage from '@/app/pages/ATS/CandidatePipelinePage';
import TaskBoard from '@/app/pages/Task/TaskBoard';
import AutomationPage from '@/app/pages/Automation/AutomationPage';
import SettingsPage from '@/app/pages/Settings/SettingsPage';
import CreateJobPage from '@/app/pages/ATS/CreateJobPage';
import JobDetailPage from '@/app/pages/ATS/JobDetailPage';
import PublicJobApplyPage from '@/app/pages/ATS/PublicJobApplyPage';
import PublicOfferPage from '@/app/pages/ATS/PublicOfferPage';

// Protected Route Component
const ProtectedRoute = () => {
    const { isAuthenticated } = useAuthStore();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

// Public Route Component (Redirect to dashboard if already logged in)
const PublicRoute = () => {
    const { isAuthenticated } = useAuthStore();
    
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

const RootLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Outlet />
        </div>
    );
};

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            { path: 'apply/:slug', element: <PublicJobApplyPage /> },
            { path: 'offers/:token', element: <PublicOfferPage /> },
            // Public Routes
            {
                element: <PublicRoute />,
                children: [
                    { path: 'login', element: <LoginPage /> },
                    { path: 'register', element: <RegisterPage /> },
                    { path: 'forgot-password', element: <div>Forgot Password Placeholder</div> },
                ],
            },
            // Protected Routes
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        element: <AuthenticatedLayout />,
                        children: [
                            { path: 'dashboard', element: <DashboardPage /> },
                            // Employee Module
                            { path: 'employees', element: <EmployeeListingPage /> },
                            { path: 'employees/create', element: <CreateEmployeePage /> },
                            { path: 'employees/:id/edit', element: <EditEmployeePage /> },
                            { path: 'employees/:id', element: <div>Employee Profile Placeholder</div> },
                            // Leave Module
                            { path: 'leaves', element: <LeaveRequestPage /> },
                            // Task Module
                            { path: 'tasks', element: <TaskBoard /> },
                            // Attendance Module
                            { path: 'attendance', element: <AttendancePage /> },
                            // ATS Module
                            { path: 'jobs', element: <JobListingPage /> },
                            { path: 'jobs/create', element: <CreateJobPage /> },
                            { path: 'jobs/:id', element: <JobDetailPage /> },
                            { path: 'candidates', element: <CandidatePipelinePage /> },
                            { path: 'automation', element: <AutomationPage /> },
                            { path: 'settings', element: <SettingsPage /> },
                        ],
                    },
                ],
            },
            // Default Redirects
            { path: '', element: <Navigate to="/dashboard" replace /> },
            { path: '*', element: <Navigate to="/dashboard" replace /> },
        ],
    },
]);
