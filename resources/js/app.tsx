import '../css/app.css';
import './bootstrap';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/routes/router';
import { QueryProvider } from './app/providers/QueryProvider';
import { initializeTheme } from './hooks/use-appearance';

import { AuthProvider } from './app/providers/AuthProvider';
import { Toaster } from 'sonner';
const appElement = document.getElementById('app');

if (appElement) {
    const root = createRoot(appElement);

    root.render(
        <React.StrictMode>
            <QueryProvider>
                <AuthProvider>
                    <RouterProvider router={router} />
                    <Toaster position="top-right" richColors />
                </AuthProvider>
            </QueryProvider>
        </React.StrictMode>
    );
}

// Initialize theme
initializeTheme();
