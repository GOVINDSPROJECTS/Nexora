import { useQuery } from '@tanstack/react-query';
import api from '@/app/api/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Building2, DollarSign, TrendingUp, Activity, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SuperAdminDashboard() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => (await api.get('/admin/stats')).data.data,
    });

    const { data: tenants } = useQuery({
        queryKey: ['admin-tenants'],
        queryFn: async () => (await api.get('/admin/tenants')).data.data,
    });

    const statCards = [
        {
            title: 'Total Tenants',
            value: stats?.total_tenants ?? 0,
            icon: Building2,
            color: 'text-violet-400',
            bg: 'bg-violet-950/50',
        },
        {
            title: 'Active Tenants',
            value: stats?.active_tenants ?? 0,
            icon: ShieldCheck,
            color: 'text-green-400',
            bg: 'bg-green-950/50',
        },
        {
            title: 'Total Users',
            value: stats?.total_users ?? 0,
            icon: Users,
            color: 'text-blue-400',
            bg: 'bg-blue-950/50',
        },
        {
            title: 'MRR',
            value: stats?.mrr ?? '$0',
            icon: DollarSign,
            color: 'text-amber-400',
            bg: 'bg-amber-950/50',
            isRaw: true,
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Activity className="h-6 w-6 text-violet-400" />
                    Platform Overview
                </h1>
                <p className="text-slate-400 text-sm mt-1">Real-time health of the entire Nexora SaaS platform.</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map(({ title, value, icon: Icon, color, bg, isRaw }) => (
                    <Card key={title} className="bg-slate-900 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
                            <div className={`rounded-lg p-2 ${bg}`}>
                                <Icon className={`h-4 w-4 ${color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="h-8 w-16 rounded bg-slate-800 animate-pulse" />
                            ) : (
                                <div className="text-3xl font-bold text-white">
                                    {isRaw ? value : value.toLocaleString()}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Tenants */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-violet-400" />
                        Recent Tenants
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Latest organisations onboarded to the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!tenants || tenants.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-8">No tenants found.</p>
                    ) : (
                        <div className="space-y-3">
                            {tenants.slice(0, 8).map((tenant: any) => (
                                <div
                                    key={tenant.id}
                                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/40 px-4 py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-700 text-white text-xs font-bold flex-shrink-0">
                                            {tenant.name?.[0]?.toUpperCase() ?? 'T'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{tenant.name}</p>
                                            <p className="text-xs text-slate-400">{tenant.domain ?? tenant.subdomain ?? 'No domain set'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            variant="outline"
                                            className={
                                                tenant.deleted_at
                                                    ? 'border-red-700 text-red-400'
                                                    : 'border-green-700 text-green-400'
                                            }
                                        >
                                            {tenant.deleted_at ? 'Suspended' : 'Active'}
                                        </Badge>
                                        <span className="text-xs text-slate-500">
                                            {new Date(tenant.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
