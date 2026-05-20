import { useQuery } from '@tanstack/react-query';
import api from '@/app/api/axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import ClockWidget from '@/app/components/Attendance/ClockWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AttendancePage() {
    const { data: attendanceData, isLoading } = useQuery({
        queryKey: ['attendance'],
        queryFn: async () => (await api.get('/attendance')).data.data,
    });

    const logs = attendanceData?.data || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
                    <p className="text-muted-foreground">Keep track of your working hours and daily logs.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                    <ClockWidget />
                </div>

                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Clock In</TableHead>
                                    <TableHead>Clock Out</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={4} className="text-center">Loading logs...</TableCell></TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No logs found for this period.</TableCell></TableRow>
                                ) : (
                                    logs.map((log: any) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-medium">{log.date}</TableCell>
                                            <TableCell>{log.clock_in}</TableCell>
                                            <TableCell>{log.clock_out || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant={log.status === 'present' ? 'default' : 'secondary'}>
                                                    {log.status}
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
        </div>
    );
}
