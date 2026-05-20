import { useAuthStore } from '@/app/store/authStore';
import { useQuery } from '@tanstack/react-query';
import api from '@/app/api/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Calendar, Briefcase, CheckCircle, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import ClockWidget from '@/app/components/Attendance/ClockWidget';
import HiringFunnelChart from '@/app/components/Analytics/HiringFunnelChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RePieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardPage() {
    const { user } = useAuthStore();

    const { data: stats } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => (await api.get('/dashboard/stats')).data.data,
    });

    const { data: summary } = useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: async () => (await api.get('/dashboard/summary')).data.data,
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
                <p className="text-muted-foreground">{user?.tenant?.name} Operational Overview</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Employees" value={stats?.total_employees} icon={Users} />
                <StatCard title="Pending Leaves" value={stats?.pending_leaves} icon={Calendar} />
                <StatCard title="Open Jobs" value={stats?.open_jobs} icon={Briefcase} />
                <StatCard title="Today Attendance" value={stats?.attendance_today} icon={CheckCircle} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            Employee Growth
                        </CardTitle>
                        <CardDescription>Headcount trend over recent months.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={summary?.growth}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <ClockWidget />
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <PieChart className="h-4 w-4 text-emerald-500" />
                                Departments
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={summary?.departments}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="count"
                                    >
                                        {summary?.departments?.map((_: unknown, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </RePieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-orange-500" />
                            Task Status
                        </CardTitle>
                        <CardDescription>Current operational task distribution.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={summary?.tasks}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="status" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-violet-500" />
                            Hiring Funnel
                        </CardTitle>
                        <CardDescription>Candidates by pipeline stage.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <HiringFunnelChart data={summary?.hiring_funnel} />
                    </CardContent>
                </Card>
            </div>

            {summary?.leaves?.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Leave Trends</CardTitle>
                        <CardDescription>Approved leave requests by month.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={summary.leaves}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function StatCard({ title, value, icon: Icon }: { title: string; value?: number; icon: React.ComponentType<{ className?: string }> }) {
    return (
        <Card className="border-none shadow-sm ring-1 ring-gray-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value || 0}</div>
            </CardContent>
        </Card>
    );
}
