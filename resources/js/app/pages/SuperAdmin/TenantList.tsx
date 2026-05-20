import { useQuery } from '@tanstack/react-query';
import api from '@/app/api/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function TenantList() {
    const [search, setSearch] = useState('');

    const { data: tenants, isLoading } = useQuery({
        queryKey: ['admin-tenants'],
        queryFn: async () => (await api.get('/admin/tenants')).data.data,
    });

    const filtered = (tenants ?? []).filter((t: any) =>
        t.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.domain?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-violet-400" />
                    All Tenants
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    Every organisation registered on the Nexora platform.
                </p>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
                    <div>
                        <CardTitle className="text-white">Tenant Registry</CardTitle>
                        <CardDescription className="text-slate-400">
                            {filtered.length} tenant{filtered.length !== 1 ? 's' : ''} found
                        </CardDescription>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search tenants..."
                            className="pl-8 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800 hover:bg-transparent">
                                <TableHead className="text-slate-400">Organisation</TableHead>
                                <TableHead className="text-slate-400">Domain</TableHead>
                                <TableHead className="text-slate-400">Subdomain</TableHead>
                                <TableHead className="text-slate-400">Onboarded</TableHead>
                                <TableHead className="text-slate-400">Status</TableHead>
                                <TableHead className="text-slate-400">Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <TableRow key={i} className="border-slate-800">
                                        {Array.from({ length: 6 }).map((__, j) => (
                                            <TableCell key={j}>
                                                <div className="h-4 rounded bg-slate-800 animate-pulse" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : filtered.length === 0 ? (
                                <TableRow className="border-slate-800">
                                    <TableCell colSpan={6} className="text-center text-slate-400 py-12">
                                        No tenants found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((tenant: any) => (
                                    <TableRow key={tenant.id} className="border-slate-800 hover:bg-slate-800/40">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-violet-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                    {tenant.name?.[0]?.toUpperCase() ?? 'T'}
                                                </div>
                                                <span className="font-medium text-white">{tenant.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-300">{tenant.domain ?? '-'}</TableCell>
                                        <TableCell className="text-slate-300">
                                            {tenant.subdomain ? `${tenant.subdomain}.nexora.app` : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    tenant.onboarding_completed_at
                                                        ? 'border-green-700 text-green-400'
                                                        : 'border-amber-700 text-amber-400'
                                                }
                                            >
                                                {tenant.onboarding_completed_at ? 'Complete' : 'Pending'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
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
                                        </TableCell>
                                        <TableCell className="text-slate-400 text-sm">
                                            {new Date(tenant.created_at).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
