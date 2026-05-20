import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const publicApi = axios.create({
    baseURL: '/api/v1',
    headers: { Accept: 'application/json' },
});

export default function PublicJobApplyPage() {
    const { slug } = useParams();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [resume, setResume] = useState<File | null>(null);

    const { data: job, isLoading, isError } = useQuery({
        queryKey: ['public-job', slug],
        queryFn: async () => (await publicApi.get(`/public/jobs/${slug}`)).data.data,
        enabled: !!slug,
        retry: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resume) {
            toast.error('Please upload your resume');
            return;
        }
        setLoading(true);
        const fd = new FormData();
        fd.append('name', form.name);
        fd.append('email', form.email);
        if (form.phone) fd.append('phone', form.phone);
        fd.append('resume', resume);

        try {
            await publicApi.post(`/public/jobs/${slug}/apply`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSubmitted(true);
            toast.success('Application submitted!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Application failed');
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (isError || !job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        This job posting is not available or has been closed.
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <Card className="max-w-md w-full text-center">
                    <CardContent className="pt-8 pb-8 space-y-4">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                        <h2 className="text-xl font-semibold">Application submitted</h2>
                        <p className="text-sm text-muted-foreground">
                            Thank you for applying to {job.title}. We will contact you by email if you are shortlisted.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-lg mx-auto space-y-6">
                <div className="text-center space-y-2">
                    {job.company && <p className="text-sm text-muted-foreground">{job.company}</p>}
                    <h1 className="text-2xl font-bold">{job.title}</h1>
                    <p className="text-sm text-muted-foreground">
                        {[job.department, job.location, job.employment_type].filter(Boolean).join(' · ')}
                    </p>
                </div>

                {job.description && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Briefcase className="h-4 w-4" /> About the role
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Apply now</CardTitle>
                        <CardDescription>Upload your resume to apply for this position.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Full name *</Label>
                                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Resume (PDF, DOC) *</Label>
                                <Input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => setResume(e.target.files?.[0] ?? null)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit application'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
