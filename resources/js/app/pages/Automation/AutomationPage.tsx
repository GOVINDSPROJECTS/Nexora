import { useQuery } from '@tanstack/react-query';
import api from '@/app/api/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';

export default function AutomationPage() {
    const { data: workflows, isLoading } = useQuery({
        queryKey: ['workflows'],
        queryFn: async () => (await api.get('/workflows')).data.data,
    });

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading workflows...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Zap className="h-6 w-6 text-amber-500" />
                    Workflow Automation
                </h1>
                <p className="text-muted-foreground">Configuration-based automations triggered by platform events.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {workflows?.map((wf: any) => (
                    <Card key={wf.id}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">{wf.name}</CardTitle>
                                <Badge variant={wf.is_active ? 'default' : 'secondary'}>
                                    {wf.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <CardDescription className="text-xs font-mono truncate">
                                {wf.event_type?.split('\\').pop()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-2">
                                {wf.actions?.length ?? 0} action(s) configured
                            </p>
                            <ul className="text-xs space-y-1">
                                {wf.actions?.map((a: any) => (
                                    <li key={a.id} className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        <span className="capitalize">{a.type.replace(/_/g, ' ')}</span>
                                        {a.delay_minutes > 0 && (
                                            <span className="text-muted-foreground">(+{a.delay_minutes}m delay)</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {(!workflows || workflows.length === 0) && (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        No workflows configured. Run <code className="text-xs bg-muted px-1 rounded">php artisan db:seed --class=WorkflowSeeder</code> to load defaults.
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
