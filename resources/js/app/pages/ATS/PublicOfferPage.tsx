import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/app/api/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, Download, Printer, Landmark, Calendar, MapPin, Building, Briefcase } from 'lucide-react';

export default function PublicOfferPage() {
    const { token } = useParams();
    const [actionState, setActionState] = useState<'view' | 'accepted' | 'declined'>('view');

    const { data: offerData, isLoading, error } = useQuery({
        queryKey: ['public-offer', token],
        queryFn: async () => {
            const res = await api.get(`/public/offers/${token}`);
            return res.data.data;
        },
        enabled: !!token,
    });

    useEffect(() => {
        if (offerData?.candidate?.offer_accepted_at) {
            setActionState('accepted');
        } else if (offerData?.candidate?.offer_declined_at) {
            setActionState('declined');
        }
    }, [offerData]);

    const acceptMutation = useMutation({
        mutationFn: () => api.post(`/public/offers/${token}/accept`),
        onSuccess: () => {
            setActionState('accepted');
        },
    });

    const declineMutation = useMutation({
        mutationFn: () => api.post(`/public/offers/${token}/decline`),
        onSuccess: () => {
            setActionState('declined');
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 p-4">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-muted-foreground text-sm font-medium">Retrieving your employment offer...</p>
            </div>
        );
    }

    if (error || !offerData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 p-4 text-center">
                <XCircle className="h-16 w-16 text-rose-500 mb-4" />
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Offer Not Found</h2>
                <p className="text-muted-foreground mt-2 max-w-md">
                    This employment offer link is invalid, expired, or has been revoked. Please reach out to your HR contact at Nexora.
                </p>
            </div>
        );
    }

    const { candidate, job, company } = offerData;

    const handlePrint = () => {
        window.print();
    };

    if (actionState === 'accepted') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4">
                <Card className="w-full max-w-lg shadow-xl border-slate-100/80 animate-in fade-in zoom-in-95 duration-300">
                    <CardContent className="p-8 text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Offer Accepted!</h2>
                            <p className="text-muted-foreground">
                                Congratulations, <strong>{candidate.name}</strong>! You have successfully accepted the offer of employment for the <strong>{job.title}</strong> role at <strong>{company}</strong>.
                            </p>
                        </div>
                        <div className="bg-slate-50/80 rounded-xl p-6 text-left border border-slate-100/50 space-y-3">
                            <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Your Credentials & Work Email</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                We've generated your corporate employee account and work email. A welcome email containing your temporary login credentials and next steps has been dispatched to your personal inbox (<strong>{candidate.email}</strong>).
                            </p>
                            {acceptMutation.data?.data?.data?.work_email && (
                                <div className="pt-2 border-t border-slate-200/50">
                                    <span className="text-xs font-semibold text-slate-600 block">Proposed Corporate Work Email:</span>
                                    <code className="text-sm text-indigo-600 font-mono font-medium select-all">{acceptMutation.data.data.data.work_email}</code>
                                </div>
                            )}
                        </div>
                        <div className="pt-2">
                            <p className="text-xs text-muted-foreground">
                                Joining Date: <strong>{new Date(candidate.joining_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</strong>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (actionState === 'declined') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4">
                <Card className="w-full max-w-lg shadow-xl border-slate-100/80 animate-in fade-in zoom-in-95 duration-300">
                    <CardContent className="p-8 text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                            <XCircle className="w-10 h-10 text-slate-500" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Offer Declined</h2>
                            <p className="text-muted-foreground">
                                You have declined the employment offer for the <strong>{job.title}</strong> role at <strong>{company}</strong>. We appreciate your time and consideration during the recruitment process and wish you the absolute best in your future endeavors.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Actions banner */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200/80">Pending Decision</Badge>
                        <span className="text-xs text-muted-foreground">Please review and respond by signing below.</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                            <Printer className="h-4 w-4" /> Print / Save PDF
                        </Button>
                    </div>
                </div>

                {/* Offer Letter Document */}
                <Card className="bg-white border-slate-200/80 shadow-lg relative overflow-hidden rounded-2xl">
                    {/* Visual accents */}
                    <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <CardContent className="p-8 sm:p-12 space-y-10">
                        {/* Header / Letterhead */}
                        <div className="flex justify-between items-start flex-wrap gap-6 border-b border-slate-100 pb-8">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{company}</h1>
                                <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Employment Offer Letter</p>
                            </div>
                            <div className="text-right text-xs text-slate-500 space-y-1">
                                <p>Date: {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                <p>Ref: NX-OFF-{token?.substring(0, 8).toUpperCase()}</p>
                            </div>
                        </div>

                        {/* Letter Content */}
                        <div className="space-y-6 text-slate-800 leading-relaxed">
                            <p className="font-semibold text-slate-900">Dear {candidate.name},</p>
                            <p>
                                We are absolutely thrilled to offer you employment at <strong>{company}</strong> for the position of <strong>{job.title}</strong>. 
                                Our hiring team was thoroughly impressed by your interviews, skills, and background, and we are confident that you will be a spectacular addition to our engineering organization.
                            </p>
                            <p>
                                Below, you will find the principal terms and details of your formal employment contract. Please review them carefully.
                            </p>

                            {/* Terms Table */}
                            <div className="bg-slate-50/50 rounded-xl border border-slate-200/60 p-6 space-y-4">
                                <h3 className="font-bold text-sm text-slate-900 tracking-wide uppercase border-b border-slate-200/50 pb-2">Principal Employment Terms</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                    <div className="flex items-start gap-3">
                                        <Briefcase className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-xs text-muted-foreground block font-medium">Job Title / Designation</span>
                                            <strong className="text-slate-900">{job.designation || job.title}</strong>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Building className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-xs text-muted-foreground block font-medium">Department</span>
                                            <strong className="text-slate-900">{job.department || 'Engineering'}</strong>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Landmark className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-xs text-muted-foreground block font-medium">Offered Salary (Annual CTC)</span>
                                            <strong className="text-slate-900 text-base">
                                                {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(candidate.offered_salary)}
                                            </strong>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-xs text-muted-foreground block font-medium">Proposed Joining Date</span>
                                            <strong className="text-slate-900">
                                                {new Date(candidate.joining_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                            </strong>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-xs text-muted-foreground block font-medium">Employment Type</span>
                                            <strong className="text-slate-900 capitalize">{candidate.employment_type}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p>
                                By accepting this offer, you agree to comply with our corporate policies, procedures, and data protection guidelines. 
                                We are excited to work with you and build the next generation of workforce solutions.
                            </p>
                            <p>
                                Welcome to the team!
                            </p>
                        </div>

                        {/* Signatures */}
                        <div className="grid grid-cols-2 gap-12 pt-10 border-t border-slate-100">
                            <div className="space-y-4">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider block font-semibold">For {company}</span>
                                <div className="h-12 border-b border-slate-200 flex items-end pb-1">
                                    <span className="font-mono text-indigo-600/80 italic text-sm">Nexora HR Department</span>
                                </div>
                                <span className="text-xs font-semibold text-slate-800 block">Authorized Signatory</span>
                            </div>
                            <div className="space-y-4">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider block font-semibold">Candidate Confirmation</span>
                                <div className="h-12 border-b border-slate-200 flex items-end pb-1">
                                    {/* Empty for manual sign or digital sign */}
                                </div>
                                <span className="text-xs font-semibold text-slate-800 block">{candidate.name}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Respond / Accept / Decline Buttons card */}
                <Card className="bg-white border-slate-200/80 shadow-md rounded-2xl print:hidden">
                    <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-center sm:text-left space-y-1">
                            <h4 className="font-bold text-slate-800">Respond to employment offer</h4>
                            <p className="text-xs text-muted-foreground">Select an option to confirm your decision.</p>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button 
                                variant="outline" 
                                className="w-full sm:w-auto border-rose-200 hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-medium"
                                onClick={() => declineMutation.mutate()}
                                disabled={declineMutation.isPending || acceptMutation.isPending}
                            >
                                {declineMutation.isPending ? 'Declining...' : 'Decline Offer'}
                            </Button>
                            <Button 
                                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md font-semibold"
                                onClick={() => acceptMutation.mutate()}
                                disabled={acceptMutation.isPending || declineMutation.isPending}
                            >
                                {acceptMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Accepting & Onboarding...
                                    </>
                                ) : (
                                    'Accept & Sign Offer'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
