import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Zap } from 'lucide-react';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary selection:text-white">
            <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="rounded-lg bg-primary p-1">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">Nexora</span>
                    </Link>
                    <nav className="hidden gap-6 md:flex">
                        <Link to="/" className="text-sm font-medium text-slate-600 hover:text-primary">Home</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-primary hidden md:block">Log in</Link>
                        <Link to="/register">
                            <Button className="rounded-full shadow-sm hover:shadow-md transition-shadow">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="py-24">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Simple, transparent pricing</h1>
                    <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">Start for free, then grow with plans that scale with your workforce.</p>

                    <div className="mt-16 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
                        {/* Free Tier */}
                        <div className="rounded-2xl border bg-white p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900">Free Forever</h3>
                            <p className="mt-2 text-sm text-slate-500">Perfect for small teams getting started.</p>
                            <div className="mt-4 flex items-baseline text-5xl font-extrabold text-slate-900">
                                $0
                                <span className="ml-1 text-xl font-medium text-slate-500">/mo</span>
                            </div>
                            <Link to="/register">
                                <Button className="mt-8 w-full" variant="outline">Sign up for Free</Button>
                            </Link>
                            <ul className="mt-8 space-y-4">
                                {['Up to 10 Employees', 'Core HR & Directory', 'Basic Leave Management', 'Basic Applicant Tracking (ATS)'].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-slate-700">
                                        <CheckCircle className="h-5 w-5 text-green-500" /> {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Startup Tier */}
                        <div className="rounded-2xl border-2 border-primary bg-white p-8 shadow-xl relative transform md:-translate-y-4">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">Most Popular</div>
                            <h3 className="text-xl font-bold text-slate-900">Startup</h3>
                            <p className="mt-2 text-sm text-slate-500">For growing teams that need automation.</p>
                            <div className="mt-4 flex items-baseline text-5xl font-extrabold text-slate-900">
                                $49
                                <span className="ml-1 text-xl font-medium text-slate-500">/mo</span>
                            </div>
                            <Link to="/register">
                                <Button className="mt-8 w-full shadow-md hover:shadow-lg transition-all">Start 14-day Free Trial</Button>
                            </Link>
                            <ul className="mt-8 space-y-4">
                                {['Up to 50 Employees', 'Everything in Free', 'Workflow Automation Engine', 'Advanced ATS Pipelines', 'White-label Branding'].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-slate-700">
                                        <CheckCircle className="h-5 w-5 text-primary" /> {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
