import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/app/api/axios';
import { useAuthStore } from '@/app/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function LeaveRequestPage() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: '',
    });

    const canApprove = user?.roles?.some(r => ['Tenant Admin', 'HR', 'Manager'].includes(r.name));

    const { data: leaveTypes } = useQuery({
        queryKey: ['leave-types'],
        queryFn: async () => (await api.get('/leave/types')).data.data,
    });

    const { data: leaves, isLoading } = useQuery({
        queryKey: ['leaves'],
        queryFn: async () => (await api.get('/leaves')).data.data,
    });

    const applyMutation = useMutation({
        mutationFn: (newLeave: any) => api.post('/leaves', newLeave),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            setFormData({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
            toast.success('Leave request submitted!');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to submit request');
        }
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number, status: string }) => 
            api.patch(`/leaves/${id}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            toast.success('Leave status updated');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyMutation.mutate(formData);
    };

    const handleStatusChange = (id: number, status: string) => {
        statusMutation.mutate({ id, status });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Leave Management</h1>
                <p className="text-muted-foreground">Manage your absences and track team requests.</p>
            </div>

            <Tabs defaultValue="my-leaves" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="my-leaves">My Leaves</TabsTrigger>
                    {canApprove && <TabsTrigger value="approvals">Team Approvals</TabsTrigger>}
                </TabsList>

                <TabsContent value="my-leaves" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" /> Apply for Leave
                                </CardTitle>
                                <CardDescription>Submit a new leave request for approval.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Leave Type</Label>
                                        <Select 
                                            value={formData.leave_type_id} 
                                            onValueChange={(v) => setFormData({ ...formData, leave_type_id: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {leaveTypes?.map((type: any) => (
                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Start Date</Label>
                                            <Input 
                                                type="date" 
                                                value={formData.start_date} 
                                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>End Date</Label>
                                            <Input 
                                                type="date" 
                                                value={formData.end_date} 
                                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Reason</Label>
                                        <Input 
                                            placeholder="Briefly explain the reason..."
                                            value={formData.reason} 
                                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={applyMutation.isPending}>
                                        {applyMutation.isPending ? 'Submitting...' : 'Submit Request'}
                                    </Button>
                                </CardContent>
                            </form>
                        </Card>

                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-muted-foreground" /> My Leave History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Period</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow><TableCell colSpan={3} className="text-center py-8">Loading requests...</TableCell></TableRow>
                                        ) : !leaves?.data || leaves.data.length === 0 ? (
                                            <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No records found.</TableCell></TableRow>
                                        ) : (
                                            leaves.data.map((leave: any) => (
                                                <TableRow key={leave.id}>
                                                    <TableCell className="font-medium">{leave.leave_type?.name}</TableCell>
                                                    <TableCell>
                                                        <span className="text-sm">{leave.start_date}</span>
                                                        <span className="mx-2 text-muted-foreground">→</span>
                                                        <span className="text-sm">{leave.end_date}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={
                                                            leave.status === 'approved' ? 'default' : 
                                                            leave.status === 'rejected' ? 'destructive' : 'secondary'
                                                        } className="capitalize">
                                                            {leave.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {canApprove && (
                    <TabsContent value="approvals">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Team Leave Requests</CardTitle>
                                    <CardDescription>Review and process applications from your team.</CardDescription>
                                </div>
                                <Button variant="outline" size="sm">
                                    <Filter className="mr-2 h-4 w-4" /> Filter
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Period</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
                                        ) : !leaves?.data || leaves.data.length === 0 ? (
                                            <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No pending requests.</TableCell></TableRow>
                                        ) : (
                                            leaves.data.map((leave: any) => (
                                                <TableRow key={leave.id}>
                                                    <TableCell>
                                                        <div className="font-medium">{leave.employee?.name}</div>
                                                        <div className="text-xs text-muted-foreground">{leave.employee?.department}</div>
                                                    </TableCell>
                                                    <TableCell>{leave.leave_type?.name}</TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        {leave.start_date} to {leave.end_date}
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate" title={leave.reason}>
                                                        {leave.reason || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={
                                                            leave.status === 'approved' ? 'default' : 
                                                            leave.status === 'rejected' ? 'destructive' : 'secondary'
                                                        } className="capitalize">
                                                            {leave.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {leave.status === 'pending' && (
                                                            <div className="flex justify-end gap-2">
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline" 
                                                                    className="h-8 text-green-600 border-green-200 hover:bg-green-50"
                                                                    onClick={() => handleStatusChange(leave.id, 'approved')}
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline" 
                                                                    className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                                                                    onClick={() => handleStatusChange(leave.id, 'rejected')}
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
