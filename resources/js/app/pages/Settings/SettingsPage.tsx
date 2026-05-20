import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/app/api/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export default function SettingsPage() {
    const queryClient = useQueryClient();
    const [branding, setBranding] = useState({ primary_color: '#2563eb', accent_color: '#10b981', company_tagline: '' });

    const { data: settings } = useQuery({
        queryKey: ['tenant-settings'],
        queryFn: async () => {
            const res = await api.get('/tenant/settings');
            const b = res.data.data.branding ?? {};
            setBranding({
                primary_color: b.primary_color ?? '#2563eb',
                accent_color: b.accent_color ?? '#10b981',
                company_tagline: b.company_tagline ?? '',
            });
            return res.data.data;
        },
    });

    const { data: onboarding } = useQuery({
        queryKey: ['onboarding'],
        queryFn: async () => (await api.get('/onboarding/status')).data.data,
    });

    const saveSettings = useMutation({
        mutationFn: (payload: object) => api.put('/tenant/settings', payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenant-settings'] }),
    });

    const completeOnboarding = useMutation({
        mutationFn: () => api.post('/onboarding/complete'),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboarding'] }),
    });

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Company Settings</h1>
                <p className="text-muted-foreground">Branding and SaaS onboarding for your workspace.</p>
            </div>

            {onboarding && !onboarding.completed && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Onboarding Progress</CardTitle>
                        <CardDescription>{onboarding.progress}% complete</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <span className="block h-full bg-primary transition-all" style={{ width: `${onboarding.progress}%` }} />
                        </div>
                        <ul className="space-y-2">
                            {Object.entries(onboarding.steps ?? {}).map(([key, done]) => (
                                <li key={key} className="flex items-center gap-2 text-sm">
                                    {done ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                                    <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                                </li>
                            ))}
                        </ul>
                        {onboarding.progress >= 80 && (
                            <Button onClick={() => completeOnboarding.mutate()}>Complete onboarding</Button>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Branding</CardTitle>
                    <CardDescription>Customize your company appearance (foundation for white-label SaaS).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Primary color</Label>
                        <Input type="color" value={branding.primary_color} onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Accent color</Label>
                        <Input type="color" value={branding.accent_color} onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Tagline</Label>
                        <Input value={branding.company_tagline} onChange={(e) => setBranding({ ...branding, company_tagline: e.target.value })} placeholder="Your company tagline" />
                    </div>
                    <Button onClick={() => saveSettings.mutate({ branding })} disabled={saveSettings.isPending}>
                        Save branding
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Workspace</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Company:</strong> {settings?.name}</p>
                    <p><strong>Timezone:</strong> {settings?.timezone ?? 'UTC'}</p>
                    <p><strong>Subdomain:</strong> {settings?.subdomain}</p>
                </CardContent>
            </Card>
        </div>
    );
}
