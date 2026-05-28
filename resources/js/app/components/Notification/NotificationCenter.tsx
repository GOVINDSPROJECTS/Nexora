import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import api from '@/app/api/axios';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const priorityColors: Record<string, string> = {
    high: 'border-l-red-500',
    normal: 'border-l-blue-500',
    low: 'border-l-gray-300',
};

export default function NotificationCenter() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    const { data } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => (await api.get('/notifications', { params: { per_page: 10 } })).data.data,
        refetchInterval: 60000,
    });

    useEffect(() => {
        if (!user || !user.tenant || !window.Echo) return;

        const channelName = `tenant.${user.tenant.id}.user.${user.id}`;
        
        window.Echo.private(channelName)
            .listen('.notification.sent', (e: any) => {
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
                import('sonner').then(({ toast }) => {
                    toast.info(e.title, {
                        description: e.message,
                    });
                });
            });

        return () => {
            window.Echo.leave(channelName);
        };
    }, [user, queryClient]);

    const markRead = useMutation({
        mutationFn: (id: string) => api.post(`/notifications/${id}/read`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    const markAllRead = useMutation({
        mutationFn: () => api.post('/notifications/read-all'),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    const items = data?.items ?? [];
    const unreadCount = data?.unread_count ?? 0;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => markAllRead.mutate()}>
                            <Check className="h-3 w-3 mr-1" /> Mark all read
                        </Button>
                    )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {items.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-4 text-center">No notifications</p>
                    ) : (
                        items.map((n: any) => {
                            const d = n.data ?? {};
                            return (
                                <button
                                    key={n.id}
                                    type="button"
                                    className={cn(
                                        'w-full text-left px-4 py-3 border-b hover:bg-muted/50 border-l-2',
                                        !n.read_at && 'bg-muted/30',
                                        priorityColors[d.priority] ?? priorityColors.normal
                                    )}
                                    onClick={() => !n.read_at && markRead.mutate(n.id)}
                                >
                                    <p className="text-sm font-medium">{d.title}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{d.message}</p>
                                    <p className="text-[10px] text-gray-400 mt-1 capitalize">{d.category}</p>
                                </button>
                            );
                        })
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
