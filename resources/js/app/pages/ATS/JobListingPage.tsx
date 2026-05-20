import { useQuery } from '@tanstack/react-query';
import api from '@/app/api/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Briefcase, MapPin, Users, Link2 } from 'lucide-react';
import { Link } from 'react-router-dom';

type Job = {
    id: number;
    title: string;
    department?: string;
    location?: string;
    status: string;
    candidates_count?: number;
    apply_url?: string | null;
};

export default function JobListingPage() {
    const { data: jobsData, isLoading } = useQuery({
        queryKey: ['jobs'],
        queryFn: async () => (await api.get('/jobs', { params: { per_page: 50 } })).data.data,
    });

    const jobs: Job[] = Array.isArray(jobsData) ? jobsData : (jobsData?.data ?? []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Job Postings</h1>
                    <p className="text-muted-foreground">Create jobs, share apply links, and manage candidates.</p>
                </div>
                <Button asChild>
                    <Link to="/jobs/create">
                        <Plus className="mr-2 h-4 w-4" /> New Job
                    </Link>
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center py-10 text-muted-foreground">Loading jobs...</div>
            ) : jobs.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <p>No job postings yet.</p>
                        <Button className="mt-4" asChild>
                            <Link to="/jobs/create">Create your first job</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <Card key={job.id} className="hover:border-primary/50 transition-colors flex flex-col">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="bg-primary/10 p-2 rounded-lg">
                                        <Briefcase className="h-5 w-5 text-primary" />
                                    </div>
                                    <Badge variant={job.status === 'published' ? 'default' : 'secondary'}>
                                        {job.status}
                                    </Badge>
                                </div>
                                <CardTitle className="mt-4">
                                    <Link to={`/jobs/${job.id}`} className="hover:underline">
                                        {job.title}
                                    </Link>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground flex-1">
                                {job.department && (
                                    <div className="flex items-center">
                                        <Users className="mr-2 h-4 w-4" />
                                        {job.department}
                                    </div>
                                )}
                                {job.location && (
                                    <div className="flex items-center">
                                        <MapPin className="mr-2 h-4 w-4" />
                                        {job.location}
                                    </div>
                                )}
                                <p>{job.candidates_count ?? 0} applicant(s)</p>
                                {job.status === 'published' && job.apply_url && (
                                    <p className="text-xs flex items-start gap-1 break-all">
                                        <Link2 className="h-3 w-3 mt-0.5 shrink-0" />
                                        {job.apply_url}
                                    </p>
                                )}
                            </CardContent>
                            <CardFooter className="border-t pt-4 flex gap-2">
                                <Button variant="outline" className="flex-1" asChild>
                                    <Link to={`/jobs/${job.id}`}>Manage</Link>
                                </Button>
                                <Button variant="outline" className="flex-1" asChild>
                                    <Link to={`/candidates?job_posting_id=${job.id}`}>Pipeline</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
