import { AppShell } from '@/components/app-shell';
import { AppHeader } from '@/components/app-header';
import { AppSidebar } from '@/components/app-sidebar';
import { AppContent } from '@/components/app-content';
import { Outlet } from 'react-router-dom';

export default function AuthenticatedLayout() {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent>
                <AppHeader />
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <Outlet />
                </div>
            </AppContent>
        </AppShell>
    );
}
