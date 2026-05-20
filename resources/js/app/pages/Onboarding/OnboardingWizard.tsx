import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/app/api/axios';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ChevronRight, Zap, Users, Calendar, Briefcase, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    welcome: Zap,
    employees: Users,
    leave: Calendar,
    hiring: Briefcase,
    automation: Bot,
};

export default function OnboardingWizard() {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);

    const { data: onboarding, refetch } = useQuery({
        queryKey: ['onboarding'],
        queryFn: async () => (await api.get('/onboarding/status')).data.data,
    });

    const completeStepMutation = useMutation({
        mutationFn: (stepId: string) => api.post('/onboarding/step', { step: stepId }),
        onSuccess: () => {
            refetch();
            toast.success('Step marked as complete!');
        },
        onError: () => toast.error('Failed to mark step. Please try again.'),
    });

    const completeOnboarding = useMutation({
        mutationFn: () => api.post('/onboarding/complete'),
        onSuccess: () => {
            toast.success('Onboarding complete! Welcome to Nexora.');
            navigate('/dashboard');
        },
    });

    const walkthrough = onboarding?.walkthrough ?? [];
    const steps = onboarding?.steps ?? {};
    const progress = onboarding?.progress ?? 0;
    const isCompleted = onboarding?.completed ?? false;

    if (isCompleted) {
        navigate('/dashboard');
        return null;
    }

    const currentWalkStep = walkthrough[activeStep];
    const isDone = currentWalkStep ? steps[currentWalkStep.id as keyof typeof steps] : false;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
            <div className="w-full max-w-3xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="rounded-lg bg-primary p-2">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">Nexora</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Welcome aboard! 🎉</h1>
                    <p className="text-slate-500 mt-2">
                        Let's get your workspace set up. It only takes a few minutes.
                    </p>
                </div>

                {/* Progress bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                        <span>Progress</span>
                        <span className="font-semibold text-primary">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500 rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Step list */}
                    <div className="space-y-2">
                        {walkthrough.map((step: any, i: number) => {
                            const done = steps[step.id as keyof typeof steps];
                            const Icon = STEP_ICONS[step.id] ?? Zap;
                            return (
                                <button
                                    key={step.id}
                                    onClick={() => setActiveStep(i)}
                                    className={cn(
                                        'w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all',
                                        activeStep === i
                                            ? 'bg-primary text-white shadow-md'
                                            : done
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : 'bg-white border border-slate-200 text-slate-700 hover:border-primary/40 hover:bg-blue-50/50'
                                    )}
                                >
                                    <Icon className="h-4 w-4 flex-shrink-0" />
                                    <span className="text-sm font-medium">{step.title}</span>
                                    <div className="ml-auto">
                                        {done ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Circle className="h-4 w-4 opacity-40" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Step detail */}
                    <div className="md:col-span-2">
                        {currentWalkStep ? (
                            <div className="rounded-2xl border bg-white p-8 shadow-sm h-full flex flex-col">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        {(() => {
                                            const Icon = STEP_ICONS[currentWalkStep.id] ?? Zap;
                                            return (
                                                <div className="rounded-xl bg-primary/10 p-3">
                                                    <Icon className="h-6 w-6 text-primary" />
                                                </div>
                                            );
                                        })()}
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">
                                                {currentWalkStep.title}
                                            </h2>
                                            {isDone && (
                                                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" /> Completed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed mb-6">
                                        {currentWalkStep.description}
                                    </p>

                                    {/* Quick action links */}
                                    <div className="space-y-3">
                                        {currentWalkStep.id === 'employees' && (
                                            <a href="/employees/create" className="block rounded-lg border border-dashed border-primary/40 p-4 text-sm text-primary hover:bg-primary/5 transition-colors">
                                                → Create your first employee
                                            </a>
                                        )}
                                        {currentWalkStep.id === 'leave' && (
                                            <a href="/settings" className="block rounded-lg border border-dashed border-primary/40 p-4 text-sm text-primary hover:bg-primary/5 transition-colors">
                                                → Configure leave types in Settings
                                            </a>
                                        )}
                                        {currentWalkStep.id === 'hiring' && (
                                            <a href="/jobs/create" className="block rounded-lg border border-dashed border-primary/40 p-4 text-sm text-primary hover:bg-primary/5 transition-colors">
                                                → Post your first job
                                            </a>
                                        )}
                                        {currentWalkStep.id === 'automation' && (
                                            <a href="/automation" className="block rounded-lg border border-dashed border-primary/40 p-4 text-sm text-primary hover:bg-primary/5 transition-colors">
                                                → Create your first workflow
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center justify-between pt-6 border-t">
                                    <div className="flex gap-2">
                                        {!isDone && (
                                            <Button
                                                onClick={() => completeStepMutation.mutate(currentWalkStep.id)}
                                                disabled={completeStepMutation.isPending}
                                                variant="outline"
                                                size="sm"
                                            >
                                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                                Mark Done
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {activeStep < walkthrough.length - 1 ? (
                                            <Button size="sm" onClick={() => setActiveStep(activeStep + 1)}>
                                                Next <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() => completeOnboarding.mutate()}
                                                disabled={completeOnboarding.isPending || progress < 20}
                                            >
                                                {completeOnboarding.isPending ? 'Finishing...' : 'Go to Dashboard'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl border bg-white p-8 text-center text-slate-400">
                                Select a step to get started.
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center mt-6">
                    <button
                        className="text-sm text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
                        onClick={() => navigate('/dashboard')}
                    >
                        Skip for now — I'll set up later
                    </button>
                </div>
            </div>
        </div>
    );
}
