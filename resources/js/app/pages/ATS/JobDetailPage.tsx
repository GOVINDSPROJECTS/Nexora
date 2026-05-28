import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/app/api/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, Copy, Calendar, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function JobDetailPage() {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [scheduleOpen, setScheduleOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [interview, setInterview] = useState({
        stage: 'Screening',
        scheduled_at: '',
        location_type: 'online',
        meeting_link: '',
        location_address: ''
    });

    const { data: job, isLoading } = useQuery({
        queryKey: ['job', id],
        queryFn: async () => (await api.get(`/jobs/${id}`)).data.data,
        enabled: !!id,
    });

    const { data: candidatesData } = useQuery({
        queryKey: ['job-candidates', id],
        queryFn: async () => (await api.get(`/jobs/${id}/candidates`)).data.data,
        enabled: !!id,
    });

    const candidates = candidatesData?.data ?? [];

    const scheduleInterview = useMutation({
        mutationFn: () =>
            api.post('/interviews', {
                candidate_id: selectedCandidate.id,
                job_posting_id: job.id,
                stage: interview.stage,
                scheduled_at: interview.scheduled_at,
                location_type: interview.location_type,
                meeting_link: interview.location_type === 'online' ? interview.meeting_link : null,
                location_address: interview.location_type === 'offline' ? interview.location_address : null,
            }),
        onSuccess: () => {
            toast.success('Interview scheduled — candidate emailed with details');
            setScheduleOpen(false);
            queryClient.invalidateQueries({ queryKey: ['job-candidates', id] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to schedule'),
    });

    const copyApplyLink = () => {
        if (job?.apply_url) {
            navigator.clipboard.writeText(job.apply_url);
            toast.success('Apply link copied');
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading job...</div>;
    }

    if (!job) {
        return <div className="p-8 text-center">Job not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/jobs"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
                    <p className="text-muted-foreground">{job.department} · {job.location}</p>
                </div>
                <Badge>{job.status}</Badge>
            </div>

            {job.status === 'published' && job.apply_url && (
                <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="pt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div>
                            <p className="font-medium text-sm">Public apply link</p>
                            <p className="text-xs text-muted-foreground break-all">{job.apply_url}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Button variant="outline" size="sm" onClick={copyApplyLink}>
                                <Copy className="h-4 w-4 mr-1" /> Copy
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <a href={job.apply_url} target="_blank" rel="noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-1" /> Open
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Applications ({candidates.length})</CardTitle>
                    <CardDescription>
                        Candidates who applied via the public link or were added manually.
                        {job.creator && <> Posted by {job.creator.name}.</>}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {candidates.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-6 text-center">
                            No applications yet. Share the apply link to receive candidates.
                        </p>
                    ) : (
                        candidates.map((c: any) => (
                            <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-medium">{c.name}</p>
                                    <p className="text-xs text-muted-foreground">{c.email} · {c.current_stage}</p>
                                    {c.source === 'public_apply' && (
                                        <Badge variant="outline" className="mt-1 text-[10px]">Public apply</Badge>
                                    )}
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setSelectedCandidate(c);
                                        setScheduleOpen(true);
                                    }}
                                >
                                    <Calendar className="h-4 w-4 mr-1" /> Schedule interview
                                </Button>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Schedule interview — {selectedCandidate?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Stage</Label>
                            <Select value={interview.stage} onValueChange={(v) => setInterview({ ...interview, stage: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['Screening', 'Technical Round', 'HR Round', 'Final Round'].map((s) => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Date & time</Label>
                            <Input
                                type="datetime-local"
                                value={interview.scheduled_at}
                                onChange={(e) => setInterview({ ...interview, scheduled_at: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Location Type</Label>
                            <Select value={interview.location_type} onValueChange={(v) => setInterview({ ...interview, location_type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="online">Online (Zoom, Meet, Teams)</SelectItem>
                                    <SelectItem value="offline">Offline (In-person / Address)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {interview.location_type === 'online' ? (
                            <div className="space-y-2">
                                <Label>Meeting Link</Label>
                                <Input
                                    type="text"
                                    placeholder="Paste Zoom, Meet, or Teams link"
                                    value={interview.meeting_link}
                                    onChange={(e) => setInterview({ ...interview, meeting_link: e.target.value })}
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>Interview Address</Label>
                                <Input
                                    type="text"
                                    placeholder="Enter physical office address"
                                    value={interview.location_address}
                                    onChange={(e) => setInterview({ ...interview, location_address: e.target.value })}
                                />
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Candidate will be emailed with the details. HR is notified via email and Zoho Cliq.
                        </p>
                        <Button className="w-full" onClick={() => scheduleInterview.mutate()} disabled={scheduleInterview.isPending}>
                            Schedule & send invite
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
