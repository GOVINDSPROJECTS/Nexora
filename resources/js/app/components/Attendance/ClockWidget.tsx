import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, LogIn, LogOut } from 'lucide-react';
import api from '@/app/api/axios';
import { useAuthStore } from '@/app/store/authStore';

export default function ClockWidget() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'in' | 'out' | null>(null);

    const handleClockIn = async () => {
        setLoading(true);
        try {
            await api.post('/attendance/clock-in', { employee_id: user?.id });
            setStatus('in');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClockOut = async () => {
        setLoading(true);
        try {
            await api.post('/attendance/clock-out', { employee_id: user?.id });
            setStatus('out');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex flex-col space-y-4">
                    <div className="text-2xl font-bold">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            className="flex-1" 
                            variant={status === 'in' ? 'secondary' : 'default'}
                            onClick={handleClockIn}
                            disabled={loading || status === 'in'}
                        >
                            <LogIn className="mr-2 h-4 w-4" /> Clock In
                        </Button>
                        <Button 
                            className="flex-1" 
                            variant="outline"
                            onClick={handleClockOut}
                            disabled={loading || status !== 'in'}
                        >
                            <LogOut className="mr-2 h-4 w-4" /> Clock Out
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
