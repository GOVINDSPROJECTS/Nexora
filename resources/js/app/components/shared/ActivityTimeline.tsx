import { cn } from '@/lib/utils';

export interface TimelineItem {
    id: number | string;
    type: string;
    description: string;
    created_at: string;
    user?: { name: string };
}

interface ActivityTimelineProps {
    items: TimelineItem[];
    className?: string;
}

export default function ActivityTimeline({ items, className }: ActivityTimelineProps) {
    if (!items?.length) {
        return <p className="text-sm text-muted-foreground py-4 text-center">No activity yet.</p>;
    }

    return (
        <div className={cn('space-y-4', className)}>
            {items.map((item) => (
                <div key={item.id} className="flex items-start gap-4 pb-4 border-b last:border-0 border-gray-100">
                    <div
                        className={cn(
                            'mt-1 h-2 w-2 rounded-full shrink-0',
                            item.type === 'note' ? 'bg-blue-500' :
                            item.type === 'status_change' ? 'bg-amber-500' :
                            item.type === 'interview_scheduled' ? 'bg-violet-500' : 'bg-primary'
                        )}
                    />
                    <div className="flex-1 space-y-1 min-w-0">
                        <p className="text-sm font-medium capitalize">{item.type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                        <p className="text-[10px] text-gray-400">
                            {item.user?.name ? `${item.user.name} · ` : ''}
                            {new Date(item.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
