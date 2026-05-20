import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/app/store/authStore';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Shield, Zap } from 'lucide-react';
import api from '@/app/api/axios';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const navItems = [
    { to: '/super-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/super-admin/tenants', label: 'Tenants', icon: Users },
];

export default function SuperAdminLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch {
            // silently fail
        }
        logout();
        navigate('/login');
        toast.success('Signed out successfully');
    };

    return (
        <div className="flex min-h-screen bg-slate-950">
            {/* Sidebar */}
            <aside className="w-60 flex-shrink-0 border-r border-slate-800 flex flex-col">
                {/* Logo */}
                <div className="h-16 flex items-center gap-2 px-5 border-b border-slate-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                        <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">Nexora</p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Super Admin</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map(({ to, label, icon: Icon }) => {
                        const active = location.pathname === to;
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    active
                                        ? 'bg-violet-600 text-white'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Back to App */}
                <div className="px-3 py-4 border-t border-slate-800 space-y-1">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        <Zap className="h-4 w-4" />
                        Back to App
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
                    <h1 className="text-sm font-semibold text-white">Platform Administration</h1>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-xs font-medium text-white">{user?.name}</p>
                            <p className="text-[10px] text-slate-400">{user?.email}</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                            {user?.name?.[0]?.toUpperCase() ?? 'A'}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 bg-slate-950">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
