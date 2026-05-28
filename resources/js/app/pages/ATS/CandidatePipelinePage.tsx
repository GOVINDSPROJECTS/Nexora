import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/app/api/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Calendar, Mail, Phone, FileText, Plus, Copy, Check, ThumbsUp, ThumbsDown, Star, User,
    ChevronRight, XCircle, Award, ShieldAlert, Landmark, MapPin, Building2, UserCheck
} from 'lucide-react';
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

    // Interview Scheduling State
    const [interview, setInterview] = useState({
        stage: 'Screening',
        scheduled_at: '',
        interviewer_id: '',
        location_type: 'online',
        meeting_link: '',
        location_address: ''
    });

    // Offer Generation State
    const [offerCandidate, setOfferCandidate] = useState<any>(null);
    const [managerSearch, setManagerSearch] = useState('');
    const [offerForm, setOfferForm] = useState({
        manager_id: '',
        department_id: '',
        designation_id: '',
        joining_date: '',
        employment_type: 'full-time',
        offered_salary: '',
    });

    // Round Feedback Decision State
    const [decisionInterview, setDecisionInterview] = useState<any>(null);
    const [decisionForm, setDecisionForm] = useState({
        feedback: '',
        rating: 5,
        decision: 'proceed', // proceed or reject
    });

    // Clipboard Copy State
    const [copiedInterviewId, setCopiedInterviewId] = useState<number | null>(null);

    useEffect(() => {
        if (jobPostingId) {
            setNewCandidate((prev) => ({ ...prev, job_posting_id: jobPostingId }));
        }
    }, [jobPostingId]);

    // Load active candidates (filtering out those that are Hired, but keeping others)
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

    // Load all employees (including for Manager selection and Interviewer selection)
    const { data: employeesData } = useQuery({
        queryKey: ['employees-all'],
        queryFn: async () => (await api.get('/employees', { params: { per_page: 1000 } })).data.data,
    });
    const employeeList = employeesData?.data ?? employeesData ?? [];

    // Filter employees who have user accounts to serve as interviewers
    const interviewersList = employeeList.filter((emp: any) => emp.user_id !== null);

    // Load departments
    const { data: departmentsData } = useQuery({
        queryKey: ['departments-all'],
        queryFn: async () => (await api.get('/org/departments')).data.data,
    });
    const departmentList = departmentsData ?? [];

    // Load designations
    const { data: designationsData } = useQuery({
        queryKey: ['designations-all'],
        queryFn: async () => (await api.get('/org/designations')).data.data,
    });
    const designationList = designationsData ?? [];

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

    // Schedule Interview with Interviewer ID
    const scheduleInterview = useMutation({
        mutationFn: async (payload: any) => {

            const response = await api.post('/interviews', payload);

            return response.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['candidates'] });
            queryClient.invalidateQueries({ queryKey: ['candidate-activities'] });

            setScheduleOpen(false);

            setInterview({
                stage: 'Screening',
                scheduled_at: '',
                interviewer_id: '',
                location_type: 'online',
                meeting_link: '',
                location_address: ''
            });
        },

        onError: (error: any) => {
            console.error('Interview Schedule Error:', error);

            if (error?.response?.data) {
                console.log(error.response.data);
            }
        }
    });

    // DATE FORMATTER
    const formatDateTime = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:00`;
    };
    // Submit Offer Generation
    const generateOfferMutation = useMutation({
        mutationFn: () => api.post(`/candidates/${offerCandidate.id}/generate-offer`, {
            manager_id: offerForm.manager_id || null,
            department_id: offerForm.department_id || null,
            designation_id: offerForm.designation_id || null,
            joining_date: offerForm.joining_date,
            employment_type: offerForm.employment_type,
            offered_salary: parseFloat(offerForm.offered_salary),
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['candidates'] });
            setOfferCandidate(null);
            setOfferForm({
                manager_id: '',
                department_id: '',
                designation_id: '',
                joining_date: '',
                employment_type: 'full-time',
                offered_salary: '',
            });
            setManagerSearch('');
        },
    });

    // Record Round Decision
    const recordDecisionMutation = useMutation({
        mutationFn: () => api.post(`/interviews/${decisionInterview.id}/decision`, decisionForm),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['candidates'] });
            setDecisionInterview(null);
            setSelectedCandidate(null);
            setDecisionForm({ feedback: '', rating: 5, decision: 'proceed' });
        },
    });

    const handleDragStart = (e: React.DragEvent, candidateId: number) => {
        e.dataTransfer.setData('candidateId', candidateId.toString());
    };

    const handleDrop = (e: React.DragEvent, targetStage: string) => {
        e.preventDefault();
        const candidateId = parseInt(e.dataTransfer.getData('candidateId'));
        if (candidateId) {
            if (targetStage === 'Selected') {
                const candidateObj = filteredCandidates.find((c: any) => c.id === candidateId);
                if (candidateObj) {
                    setOfferCandidate(candidateObj);
                }
            } else {
                updateStageMutation.mutate({ id: candidateId, current_stage: targetStage });
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    const handleMoveToNextStage = (candidate: any) => {
        const currentIndex = STAGES.indexOf(candidate.current_stage);
        if (currentIndex !== -1 && currentIndex < STAGES.length - 2) {
            const nextStage = STAGES[currentIndex + 1];
            if (nextStage === 'Selected') {
                setOfferCandidate(candidate);
            } else {
                updateStageMutation.mutate({ id: candidate.id, current_stage: nextStage });
            }
        }
    };

    const copyToClipboard = (meetingLink: string, interviewId: number) => {
        if (!meetingLink) return;
        navigator.clipboard.writeText(meetingLink).then(() => {
            setCopiedInterviewId(interviewId);
            setTimeout(() => setCopiedInterviewId(null), 2000);
        });
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading pipeline...</div>;

    const list = Array.isArray(candidates) ? candidates : candidates?.items ?? [];
    // Only show candidates that have NOT been converted to employees (i.e. exclude 'Hired' stage)
    const activeCandidates = list.filter((c: any) => c.current_stage !== 'Hired');

    const filteredCandidates = activeCandidates.filter(
        (c: any) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.job_posting?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter managers list based on managers search bar
    const filteredManagers = employeeList.filter((emp: any) =>
        emp.name.toLowerCase().includes(managerSearch.toLowerCase()) ||
        emp.employee_id?.toLowerCase().includes(managerSearch.toLowerCase())
    );

    const selectedManagerObj = employeeList.find((e: any) => String(e.id) === offerForm.manager_id);

    return (
        <div className="space-y-6 h-[calc(100vh-10rem)] flex flex-col w-full max-w-full overflow-hidden">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Hiring Pipeline</h1>
                    <p className="text-muted-foreground">
                        {jobPostingId ? `Filtered by job #${jobPostingId}. ` : ''}
                        Kanban view with interview decisions and automated offer letters.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="Search candidates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-[250px] shadow-sm bg-white"
                    />
                    <Dialog open={addOpen} onOpenChange={setAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"><Plus className="h-4 w-4 mr-1" /> Add Candidate</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-slate-900 font-bold">Add Candidate</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-slate-700">Associated Job Posting</Label>
                                    <Select value={newCandidate.job_posting_id} onValueChange={(v) => setNewCandidate({ ...newCandidate, job_posting_id: v })}>
                                        <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Select job posting" /></SelectTrigger>
                                        <SelectContent>
                                            {jobList.map((j) => (
                                                <SelectItem key={j.id} value={String(j.id)}>{j.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-slate-700">Full Name</Label>
                                    <Input value={newCandidate.name} onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })} className="bg-white" placeholder="Candidate's Name" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-slate-700">Personal Email</Label>
                                    <Input type="email" value={newCandidate.email} onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })} className="bg-white" placeholder="candidate@example.com" />
                                </div>
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold" onClick={() => createCandidate.mutate()} disabled={createCandidate.isPending}>Create Profile</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Kanban Columns */}
            <div className="flex-1 flex gap-4 overflow-x-auto pb-4 items-stretch w-full min-w-0">
                {STAGES.map((stage) => {
                    const stageCandidates = filteredCandidates.filter((c: any) => c.current_stage === stage);
                    return (
                        <div
                            key={stage}
                            className="flex-shrink-0 w-[300px] flex flex-col bg-slate-50 border border-slate-100 rounded-xl p-3"
                            onDrop={(e) => handleDrop(e, stage)}
                            onDragOver={handleDragOver}
                        >
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="font-bold text-sm text-slate-700 tracking-wide uppercase">{stage}</h3>
                                <Badge className="rounded-full bg-slate-200/80 text-slate-700 hover:bg-slate-200/80 border-none font-medium px-2">{stageCandidates.length}</Badge>
                            </div>
                            <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-h-[400px]">
                                {stageCandidates.map((candidate: any) => (
                                    <Card
                                        key={candidate.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, candidate.id)}
                                        className="cursor-grab active:cursor-grabbing hover:border-indigo-400 hover:shadow-md transition-all duration-200 border-slate-100 shadow-sm bg-white"
                                        onClick={() => setSelectedCandidate(candidate)}
                                    >
                                        <CardContent className="p-3.5 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback className="bg-gradient-to-tr from-indigo-50 to-indigo-100/80 text-indigo-700 font-semibold text-xs border border-indigo-200/50">
                                                        {candidate.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="space-y-0.5 overflow-hidden">
                                                    <p className="text-sm font-semibold leading-none text-slate-900 truncate">{candidate.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{candidate.job_posting?.title}</p>
                                                </div>
                                            </div>

                                            {candidate.offered_salary && (
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold text-[10px]">
                                                    Offer Sent: {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(candidate.offered_salary)}
                                                </Badge>
                                            )}

                                            <div className="flex gap-1.5 pt-2.5 border-t border-slate-50 items-center justify-between">
                                                <div className="flex gap-1">
                                                    {candidate.email && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 rounded-full text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                                                            title={candidate.email}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.location.href = `mailto:${candidate.email}`;
                                                            }}
                                                        >
                                                            <Mail className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                    {candidate.phone && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 rounded-full text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                                                            title={candidate.phone}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.location.href = `tel:${candidate.phone}`;
                                                            }}
                                                        >
                                                            <Phone className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                    {candidate.resume_path && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                                            title="View Resume"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(candidate.resume_path, '_blank');
                                                            }}
                                                        >
                                                            <FileText className="h-3.5 w-3.5 text-blue-500" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    {stage !== 'Selected' && stage !== 'Rejected' && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 rounded-full text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                                                                title="Schedule Interview"
                                                                onClick={(e) => { e.stopPropagation(); setSelectedCandidate(candidate); setScheduleOpen(true); }}
                                                            >
                                                                <Calendar className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 rounded-full text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                                                                title="Move to Next Stage"
                                                                onClick={(e) => { e.stopPropagation(); handleMoveToNextStage(candidate); }}
                                                            >
                                                                <ChevronRight className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Candidate Details & Activities Dialog */}
            <Dialog open={!!selectedCandidate && !scheduleOpen && !decisionInterview} onOpenChange={(o) => !o && setSelectedCandidate(null)}>
                <DialogContent className="max-w-2xl sm:rounded-2xl shadow-xl">
                    <DialogHeader className="border-b border-slate-100 pb-4">
                        <div className="flex items-start gap-4 justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-base">
                                        {selectedCandidate?.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1 text-left">
                                    <DialogTitle className="text-xl font-bold text-slate-900">{selectedCandidate?.name}</DialogTitle>
                                    <p className="text-xs text-slate-500 flex flex-wrap gap-2 items-center">
                                        {selectedCandidate?.email && (
                                            <a href={`mailto:${selectedCandidate.email}`} className="text-indigo-600 hover:underline flex items-center gap-1">
                                                <Mail className="h-3 w-3" /> {selectedCandidate.email}
                                            </a>
                                        )}
                                        {selectedCandidate?.phone && (
                                            <a href={`tel:${selectedCandidate.phone}`} className="text-indigo-600 hover:underline flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {selectedCandidate.phone}
                                            </a>
                                        )}
                                        {selectedCandidate?.resume_path && (
                                            <a href={selectedCandidate.resume_path} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                <FileText className="h-3 w-3" /> View Resume
                                            </a>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-none font-semibold text-xs px-2.5 py-1">
                                    Stage: {selectedCandidate?.current_stage}
                                </Badge>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 max-h-[500px] overflow-y-auto pr-1">
                        {/* Left column: Quick Actions & Interviews */}
                        <div className="space-y-5 text-left">
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hiring Actions</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCandidate?.current_stage !== 'Selected' && selectedCandidate?.current_stage !== 'Rejected' && (
                                        <>
                                            <Button
                                                onClick={() => {
                                                    handleMoveToNextStage(selectedCandidate);
                                                    setSelectedCandidate(null);
                                                }}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs gap-1.5 shadow-sm"
                                            >
                                                <ChevronRight className="w-3.5 h-3.5" /> Move to Next Stage
                                            </Button>
                                            <Button
                                                onClick={() => setOfferCandidate(selectedCandidate)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs gap-1.5 shadow-sm"
                                            >
                                                <UserCheck className="w-3.5 h-3.5" /> Select & Send Offer
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    updateStageMutation.mutate({ id: selectedCandidate.id, current_stage: 'Rejected' });
                                                    setSelectedCandidate(null);
                                                }}
                                                variant="outline"
                                                className="border-rose-200 hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-semibold text-xs gap-1.5"
                                            >
                                                <XCircle className="w-3.5 h-3.5" /> Reject Candidate
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Interviews List */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interview Rounds</h4>
                                {selectedCandidate?.interviews && selectedCandidate.interviews.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedCandidate.interviews.map((item: any) => (
                                            <Card key={item.id} className="border-slate-100/80 shadow-sm bg-slate-50/50">
                                                <CardContent className="p-3 space-y-3 text-sm">
                                                    <div className="flex items-center justify-between">
                                                        <strong className="text-slate-800">{item.stage}</strong>
                                                        <Badge variant="outline" className={`font-semibold capitalize text-[10px] ${item.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                                            }`}>
                                                            {item.status}
                                                        </Badge>
                                                    </div>

                                                    <div className="space-y-1.5 text-xs text-slate-600">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                            <span>{new Date(item.scheduled_at).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <User className="h-3.5 w-3.5 text-slate-400" />
                                                            <span>Interviewer: {item.interviewer?.name || 'TBD'}</span>
                                                        </div>
                                                        {item.location_type && (
                                                            <div className="flex items-center gap-1.5">
                                                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                                                <span className="capitalize">{item.location_type} {item.location_type === 'offline' && item.location_address && `— ${item.location_address}`}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Feedback display */}
                                                    {item.feedback && (
                                                        <div className="bg-white rounded-lg p-2 border border-slate-100 text-xs mt-2 space-y-1">
                                                            <div className="flex items-center gap-1 text-amber-500 font-semibold">
                                                                <Star className="h-3 w-3 fill-current" /> {item.rating}/5
                                                            </div>
                                                            <p className="text-slate-600 leading-relaxed italic">"{item.feedback}"</p>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100/50">
                                                        {item.meeting_link && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 text-xs font-medium gap-1 text-slate-600 border-slate-200"
                                                                onClick={() => copyToClipboard(item.meeting_link, item.id)}
                                                            >
                                                                {copiedInterviewId === item.id ? (
                                                                    <>
                                                                        <Check className="h-3.5 w-3.5 text-emerald-500" /> Copied Link
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Copy className="h-3.5 w-3.5" /> Copy Meeting Link
                                                                    </>
                                                                )}
                                                            </Button>
                                                        )}

                                                        {item.status === 'scheduled' && (
                                                            <Button
                                                                size="sm"
                                                                className="h-7 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white gap-1"
                                                                onClick={() => setDecisionInterview(item)}
                                                            >
                                                                <ThumbsUp className="w-3 h-3" /> Record Outcome
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground leading-loose">No interviews scheduled yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Right column: Activity History */}
                        <div className="space-y-3 text-left">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Activity History</h4>
                            <ActivityTimeline items={Array.isArray(activities) ? activities : activities?.data ?? []} />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Schedule Interview Dialog */}
            <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900 font-bold">Schedule Interview Round</DialogTitle>
                        <p className="text-xs text-muted-foreground">For: <strong>{selectedCandidate?.name}</strong></p>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="space-y-1.5 text-left">
                            <Label className="text-xs font-semibold text-slate-700">Interview Stage</Label>
                            <Select value={interview.stage} onValueChange={(v) => setInterview({ ...interview, stage: v })}>
                                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {STAGES.filter((s) => !['Applied', 'Selected', 'Rejected'].includes(s)).map((s) => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5 text-left">
                            <Label className="text-xs font-semibold text-slate-700">Interviewer (Corporate Employee)</Label>
                            <Select value={interview.interviewer_id} onValueChange={(v) => setInterview({ ...interview, interviewer_id: v })}>
                                <SelectTrigger className="bg-white"><SelectValue placeholder="Select interviewer" /></SelectTrigger>
                                <SelectContent>
                                    {interviewersList.map((emp: any) => (
                                        <SelectItem key={emp.id} value={String(emp.user_id)}>
                                            {emp.name} ({emp.designation?.name || 'User'})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-muted-foreground leading-snug">Only employees with corporate logins can be selected as interviewers.</p>
                        </div>
                        <div className="space-y-1.5 text-left">
                            <Label className="text-xs font-semibold text-slate-700">Date & time</Label>
                            <DatePicker
                                selected={
                                    interview.scheduled_at
                                        ? new Date(interview.scheduled_at)
                                        : null
                                }
                                onChange={(date: Date | null) => {
                                    setInterview({
                                        ...interview,
                                        scheduled_at: date
                                            ? formatDateTime(date)
                                            : '',
                                    });
                                }}
                                showTimeSelect
                                timeIntervals={15}
                                minDate={new Date()}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                placeholderText="Select interview date & time"
                                className="
        flex h-9 w-full rounded-md
        border border-input bg-white
        px-3 py-1 text-sm shadow-sm
        focus:outline-none
        focus:ring-2
        focus:ring-indigo-500
    "
                            />
                        </div>
                        <div className="space-y-1.5 text-left">
                            <Label className="text-xs font-semibold text-slate-700">Location Type</Label>
                            <Select value={interview.location_type} onValueChange={(v) => setInterview({ ...interview, location_type: v })}>
                                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="online">🖥️ Online (Zoom, Meet, Teams)</SelectItem>
                                    <SelectItem value="offline">🏢 Offline (In-person / Address)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {interview.location_type === 'online' ? (
                            <div className="space-y-1.5 text-left">
                                <Label className="text-xs font-semibold text-slate-700">Meeting Link</Label>
                                <Input
                                    type="url"
                                    placeholder="Paste Zoom, Google Meet, or Teams link"
                                    value={interview.meeting_link}
                                    onChange={(e) => setInterview({ ...interview, meeting_link: e.target.value })}
                                    className="bg-white"
                                />
                            </div>
                        ) : (
                            <div className="space-y-1.5 text-left">
                                <Label className="text-xs font-semibold text-slate-700">Interview Venue / Address</Label>
                                <Input
                                    type="text"
                                    placeholder="e.g. 3rd Floor, Tower B, Nexora HQ, Bangalore"
                                    value={interview.location_address}
                                    onChange={(e) => setInterview({ ...interview, location_address: e.target.value })}
                                    className="bg-white"
                                />
                            </div>
                        )}
                        <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md"
                            onClick={() => {

                                const payload = {
                                    candidate_id: Number(selectedCandidate.id),

                                    job_posting_id: Number(
                                        selectedCandidate.job_posting?.id
                                    ),

                                    stage: interview.stage,

                                    scheduled_at: interview.scheduled_at,

                                    interviewer_id: Number(
                                        interview.interviewer_id
                                    ),

                                    location_type: interview.location_type,

                                    meeting_link:
                                        interview.location_type === 'online'
                                            ? interview.meeting_link
                                            : null,

                                    location_address:
                                        interview.location_type === 'offline'
                                            ? interview.location_address
                                            : null,
                                };

                                console.log('Submitting Payload:', payload);

                                scheduleInterview.mutate(payload);
                            }}
                            disabled={scheduleInterview.isPending || !interview.scheduled_at}
                        >
                            {scheduleInterview.isPending ? 'Scheduling...' : 'Schedule & Send Invites'}

                        </Button>
                    </div>
                </DialogContent>
            </Dialog>


            {/* Select Candidate & Fill Offer details Dialog */}
            <Dialog open={!!offerCandidate} onOpenChange={(o) => !o && setOfferCandidate(null)}>
                <DialogContent className="max-w-lg sm:rounded-2xl shadow-xl">
                    <DialogHeader className="border-b border-slate-100 pb-3">
                        <DialogTitle className="text-lg font-bold text-slate-900">Select & Generate Offer</DialogTitle>
                        <p className="text-xs text-muted-foreground">Setup employment offer letter details for <strong>{offerCandidate?.name}</strong>.</p>
                    </DialogHeader>

                    <div className="space-y-4 pt-3 text-left max-h-[480px] overflow-y-auto pr-1">
                        {/* Searchable Manager list */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700">Prospective Reporting Manager</Label>
                            <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 space-y-2">
                                <Input
                                    placeholder="Search employees by name..."
                                    value={managerSearch}
                                    onChange={(e) => setManagerSearch(e.target.value)}
                                    className="bg-white text-xs h-8"
                                />
                                {offerForm.manager_id && selectedManagerObj && (
                                    <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded px-2 py-1 text-xs text-indigo-800">
                                        <span>Selected Manager: <strong>{selectedManagerObj.name}</strong></span>
                                        <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent text-rose-500 font-bold hover:text-rose-600" onClick={() => setOfferForm({ ...offerForm, manager_id: '' })}>Clear</Button>
                                    </div>
                                )}
                                <div className="max-h-28 overflow-y-auto space-y-1 text-xs border border-slate-150 rounded bg-white">
                                    {filteredManagers.length > 0 ? (
                                        filteredManagers.map((emp: any) => (
                                            <div
                                                key={emp.id}
                                                onClick={() => setOfferForm({ ...offerForm, manager_id: String(emp.id) })}
                                                className={`p-2 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between ${offerForm.manager_id === String(emp.id) ? 'bg-indigo-50/40 text-indigo-900 font-semibold' : 'text-slate-700'
                                                    }`}
                                            >
                                                <span>{emp.name} ({emp.designation?.name || emp.department?.name || 'Staff'})</span>
                                                <Badge variant="outline" className="text-[10px]">{emp.employee_id}</Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="p-3 text-center text-muted-foreground text-[11px]">No managers matching search.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Department</Label>
                                <Select value={offerForm.department_id} onValueChange={(v) => setOfferForm({ ...offerForm, department_id: v })}>
                                    <SelectTrigger className="bg-white text-xs"><SelectValue placeholder="Select dept" /></SelectTrigger>
                                    <SelectContent>
                                        {departmentList.map((d: any) => (
                                            <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Designation</Label>
                                <Select value={offerForm.designation_id} onValueChange={(v) => setOfferForm({ ...offerForm, designation_id: v })}>
                                    <SelectTrigger className="bg-white text-xs"><SelectValue placeholder="Select title" /></SelectTrigger>
                                    <SelectContent>
                                        {designationList.map((ds: any) => (
                                            <SelectItem key={ds.id} value={String(ds.id)}>{ds.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Proposed Joining Date</Label>
                                <Input type="date" value={offerForm.joining_date} onChange={(e) => setOfferForm({ ...offerForm, joining_date: e.target.value })} className="bg-white text-xs" />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Employment Type</Label>
                                <Select value={offerForm.employment_type} onValueChange={(v) => setOfferForm({ ...offerForm, employment_type: v })}>
                                    <SelectTrigger className="bg-white text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full-time">Full-time</SelectItem>
                                        <SelectItem value="part-time">Part-time</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                        <SelectItem value="internship">Internship</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700">Annual Salary / CTC (INR)</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 1200000"
                                value={offerForm.offered_salary}
                                onChange={(e) => setOfferForm({ ...offerForm, offered_salary: e.target.value })}
                                className="bg-white text-xs font-semibold"
                            />
                        </div>
                    </div>

                    <DialogFooter className="border-t border-slate-100 pt-3">
                        <Button variant="outline" size="sm" onClick={() => setOfferCandidate(null)}>Cancel</Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md text-xs"
                            onClick={() => generateOfferMutation.mutate()}
                            disabled={generateOfferMutation.isPending || !offerForm.joining_date || !offerForm.offered_salary}
                        >
                            {generateOfferMutation.isPending ? 'Generating Letter...' : 'Confirm & Email Offer Letter'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Record Round Decision Dialog */}
            <Dialog open={!!decisionInterview} onOpenChange={(o) => !o && setDecisionInterview(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900 font-bold">Record Interview Decision</DialogTitle>
                        <p className="text-xs text-muted-foreground">Submit feedback and decide the recruitment outcome for this round.</p>
                    </DialogHeader>
                    <div className="space-y-4 pt-2 text-left">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700 font-bold">Star Rating (1 to 5)</Label>
                            <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setDecisionForm({ ...decisionForm, rating: star })}
                                        className="focus:outline-none"
                                    >
                                        <Star className={`h-6 w-6 ${star <= decisionForm.rating ? 'text-amber-400 fill-current' : 'text-slate-200'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700">Interview Notes & Feedback</Label>
                            <Textarea
                                placeholder="Enter detailed round assessment feedback..."
                                value={decisionForm.feedback}
                                onChange={(e) => setDecisionForm({ ...decisionForm, feedback: e.target.value })}
                                className="bg-white min-h-[90px] text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700">Round Outcome / Decision</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    type="button"
                                    variant={decisionForm.decision === 'proceed' ? 'default' : 'outline'}
                                    className={`text-xs gap-1.5 font-semibold ${decisionForm.decision === 'proceed' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'border-slate-200 hover:bg-slate-50'
                                        }`}
                                    onClick={() => setDecisionForm({ ...decisionForm, decision: 'proceed' })}
                                >
                                    <ThumbsUp className="w-3.5 h-3.5" /> Proceed to Next Round
                                </Button>
                                <Button
                                    type="button"
                                    variant={decisionForm.decision === 'reject' ? 'default' : 'outline'}
                                    className={`text-xs gap-1.5 font-semibold ${decisionForm.decision === 'reject' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                        }`}
                                    onClick={() => setDecisionForm({ ...decisionForm, decision: 'reject' })}
                                >
                                    <ThumbsDown className="w-3.5 h-3.5" /> Reject Candidate
                                </Button>
                            </div>
                        </div>

                        <Button
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold mt-2 shadow-md text-xs h-9"
                            onClick={() => recordDecisionMutation.mutate()}
                            disabled={recordDecisionMutation.isPending || !decisionForm.feedback}
                        >
                            {recordDecisionMutation.isPending ? 'Submitting decision...' : 'Submit Round Outcome'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
