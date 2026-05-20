import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/app/api/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar, Mail, Phone, FileText, Plus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ActivityTimeline from '@/app/components/shared/ActivityTimeline';

const STAGES = ['Applied', 'Screening', 'Technical Round', 'HR Round', 'Final Round', 'Selected', 'Rejected'];

export default function CandidatePipelinePage() {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const jobPostingId = searchParams.get('job_posting_id') ?? '';
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [addOpen, setAddOpen] = useState(false);
    const [scheduleOpen, setScheduleOpen] = useState(false);
    const [newCandidate, setNewCandidate] = useState({ job_posting_id: '', name: '', email: '', phone: '' });
    const [interview, setInterview] = useState({ stage: 'Screening', scheduled_at: '' });

    useEffect(() => {
        if (jobPostingId) {
            setNewCandidate((prev) => ({ ...prev, job_posting_id: jobPostingId }));
        }
    }, [jobPostingId]);

    const { data: candidates, isLoading } = useQuery({
        queryKey: ['candidates', jobPostingId],
        queryFn: async () =>
            (await api.get('/candidates', {
                params: { all: 1, ...(jobPostingId ? { job_posting_id: jobPostingId } : {}) },
            })).data.data,
    });

    const { data: jobs } = useQuery({
        queryKey: ['jobs'],
        queryFn: async () => (await api.get('/jobs')).data.data,
    });

    const jobList: { id: number; title: string }[] = Array.isArray(jobs)
        ? jobs
        : (jobs?.data ?? []);

    const { data: activities } = useQuery({
        queryKey: ['candidate-activities', selectedCandidate?.id],
        queryFn: async () => {
            if (!selectedCandidate) return [];
            const res = (await api.get(`/candidates/${selectedCandidate.id}/activities`)).data.data;
            return res?.data ?? res?.items ?? res ?? [];
        },
        enabled: !!selectedCandidate,
    });

    const updateStageMutation = useMutation({
        mutationFn: ({ id, current_stage }: { id: number; current_stage: string }) =>
            api.put(`/candidates/${id}`, { current_stage }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['candidates'] }),
    });

    const createCandidate = useMutation({
        mutationFn: () => api.post('/candidates', newCandidate),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['candidates'] });
            setAddOpen(false);
            setNewCandidate({ job_posting_id: '', name: '', email: '', phone: '' });
        },
    });

    const scheduleInterview = useMutation({
        mutationFn: () => api.post('/interviews', {
            candidate_id: selectedCandidate.id,
            job_posting_id: selectedCandidate.job_posting?.id,
            stage: interview.stage,
            scheduled_at: interview.scheduled_at,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['candidates'] });
            queryClient.invalidateQueries({ queryKey: ['candidate-activities'] });
            setScheduleOpen(false);
        },
    });

    const handleDragStart = (e: React.DragEvent, candidateId: number) => {
        e.dataTransfer.setData('candidateId', candidateId.toString());
    };

    const handleDrop = (e: React.DragEvent, targetStage: string) => {
        e.preventDefault();
        const candidateId = parseInt(e.dataTransfer.getData('candidateId'));
        if (candidateId) {
            updateStageMutation.mutate({ id: candidateId, current_stage: targetStage });
        }
    };

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading pipeline...</div>;

    const list = Array.isArray(candidates) ? candidates : candidates?.items ?? [];
    const filteredCandidates = list.filter(
        (c: any) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.job_posting?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Hiring Pipeline</h1>
                    <p className="text-muted-foreground">
                        {jobPostingId
                            ? `Filtered by job #${jobPostingId}. `
                            : ''}
                        Kanban view with interview scheduling and activity tracking.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="Search candidates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-[250px]"
                    />
                    <Dialog open={addOpen} onOpenChange={setAddOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="h-4 w-4 mr-1" /> Add Candidate</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Add Candidate</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <Label>Job</Label>
                                    <Select value={newCandidate.job_posting_id} onValueChange={(v) => setNewCandidate({ ...newCandidate, job_posting_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
                                        <SelectContent>
                                            {jobList.map((j) => (
                                                <SelectItem key={j.id} value={String(j.id)}>{j.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2"><Label>Name</Label><Input value={newCandidate.name} onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Email</Label><Input type="email" value={newCandidate.email} onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })} /></div>
                                <Button className="w-full" onClick={() => createCandidate.mutate()} disabled={createCandidate.isPending}>Create</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
                {STAGES.map((stage) => {
                    const stageCandidates = filteredCandidates.filter((c: any) => c.current_stage === stage);
                    return (
                        <div
                            key={stage}
                            className="flex-shrink-0 w-[300px] flex flex-col bg-muted/30 rounded-lg p-3"
                            onDrop={(e) => handleDrop(e, stage)}
                            onDragOver={handleDragOver}
                        >
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="font-semibold text-sm">{stage}</h3>
                                <Badge variant="secondary" className="rounded-full">{stageCandidates.length}</Badge>
                            </div>
                            <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                                {stageCandidates.map((candidate: any) => (
                                    <Card
                                        key={candidate.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, candidate.id)}
                                        className="cursor-move hover:border-primary/50 transition-colors shadow-sm"
                                        onClick={() => setSelectedCandidate(candidate)}
                                    >
                                        <CardContent className="p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="bg-primary/10 text-xs">
                                                            {candidate.name.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-medium leading-none">{candidate.name}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">{candidate.job_posting?.title}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                                {candidate.email && <Button variant="outline" size="icon" className="h-6 w-6 rounded-full" title={candidate.email}><Mail className="h-3 w-3" /></Button>}
                                                {candidate.phone && <Button variant="outline" size="icon" className="h-6 w-6 rounded-full" title={candidate.phone}><Phone className="h-3 w-3" /></Button>}
                                                {candidate.resume_path && <Button variant="outline" size="icon" className="h-6 w-6 rounded-full" title="Resume"><FileText className="h-3 w-3 text-blue-500" /></Button>}
                                                <div className="flex-1" />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 rounded-full"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedCandidate(candidate); setScheduleOpen(true); }}
                                                >
                                                    <Calendar className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <Dialog open={!!selectedCandidate && !scheduleOpen} onOpenChange={(o) => !o && setSelectedCandidate(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{selectedCandidate?.name}</DialogTitle>
                    </DialogHeader>
                    {selectedCandidate && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">{selectedCandidate.email} · {selectedCandidate.job_posting?.title}</p>
                            <ActivityTimeline items={Array.isArray(activities) ? activities : activities?.data ?? []} />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Schedule Interview</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Stage</Label>
                            <Select value={interview.stage} onValueChange={(v) => setInterview({ ...interview, stage: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {STAGES.filter((s) => !['Applied', 'Selected', 'Rejected'].includes(s)).map((s) => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Date & time</Label>
                            <Input type="datetime-local" value={interview.scheduled_at} onChange={(e) => setInterview({ ...interview, scheduled_at: e.target.value })} />
                        </div>
                        <Button className="w-full" onClick={() => scheduleInterview.mutate()} disabled={scheduleInterview.isPending}>
                            Schedule & generate meeting link
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}



