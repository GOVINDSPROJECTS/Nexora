import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Zap, Shield, Globe } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary selection:text-white">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-primary p-1">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">Nexora</span>
                    </div>
                    <nav className="hidden gap-6 md:flex">
                        <a href="#features" className="text-sm font-medium text-slate-600 hover:text-primary">Features</a>
                        <a href="#solutions" className="text-sm font-medium text-slate-600 hover:text-primary">Solutions</a>
                        <Link to="/pricing" className="text-sm font-medium text-slate-600 hover:text-primary">Pricing</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-primary hidden md:block">Log in</Link>
                        <Link to="/register">
                            <Button className="rounded-full shadow-sm hover:shadow-md transition-shadow">
                                Get Started <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white"></div>
                <div className="container mx-auto px-4 text-center md:px-6">
                    <div className="mx-auto max-w-3xl space-y-8">
                        <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
                            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                            Nexora 2.0 is now live
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl">
                            The operating system for your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">modern workforce.</span>
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg text-slate-600 leading-relaxed">
                            A unified platform combining core HR, advanced applicant tracking, and event-driven workflow automation. Built for startups that want to scale without the enterprise bloat.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link to="/register">
                                <Button size="lg" className="w-full sm:w-auto rounded-full h-12 px-8 text-base shadow-lg hover:shadow-xl transition-all">
                                    Start your free trial
                                </Button>
                            </Link>
                            <Link to="/pricing">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full h-12 px-8 text-base">
                                    View Pricing
                                </Button>
                            </Link>
                        </div>
                        <p className="text-xs text-slate-500 pt-4">No credit card required. 14-day free trial on all Pro plans.</p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Everything you need to manage your team</h2>
                        <p className="mt-4 text-lg text-slate-600">Replace your fragmented HR stack with a single, powerful, and beautifully designed platform.</p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Feature 1 */}
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-8 hover:shadow-lg transition-shadow">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                <Globe className="h-6 w-6" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-slate-900">Global Core HR</h3>
                            <p className="text-slate-600 leading-relaxed">Manage employee records, organizational charts, and time-off policies across multiple geographies from a single dashboard.</p>
                        </div>
                        {/* Feature 2 */}
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-8 hover:shadow-lg transition-shadow">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-slate-900">Modern ATS</h3>
                            <p className="text-slate-600 leading-relaxed">Visual Kanban pipelines, interview scheduling, scorecard feedback, and seamless candidate communication.</p>
                        </div>
                        {/* Feature 3 */}
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-8 hover:shadow-lg transition-shadow">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                                <Zap className="h-6 w-6" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-slate-900">Workflow Automation</h3>
                            <p className="text-slate-600 leading-relaxed">Automate onboarding, task assignment, and notifications with our powerful event-driven visual builder.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section className="py-24 bg-slate-900 text-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto">
                        <div className="flex-1 space-y-6">
                            <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-blue-300">
                                <Shield className="mr-2 h-4 w-4" /> Enterprise-grade security
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Secure by design, private by default.</h2>
                            <p className="text-lg text-slate-300">Your data is isolated and protected. We employ strict tenant isolation, at-rest encryption, and comprehensive audit logging to keep your workforce data safe.</p>
                            <ul className="space-y-3 pt-4">
                                {['SOC2 Compliance Ready', 'Strict Tenant Data Isolation', 'Granular Role-Based Access Control'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-blue-400" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex-1 w-full relative">
                            {/* Decorative graphic */}
                            <div className="aspect-square rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-3xl absolute inset-0"></div>
                            <div className="relative rounded-2xl border border-white/10 bg-slate-800/50 p-6 backdrop-blur-xl shadow-2xl">
                                <div className="space-y-4">
                                    <div className="h-4 w-1/3 rounded bg-white/10"></div>
                                    <div className="space-y-2">
                                        <div className="h-3 w-full rounded bg-white/5"></div>
                                        <div className="h-3 w-5/6 rounded bg-white/5"></div>
                                        <div className="h-3 w-4/6 rounded bg-white/5"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t bg-white py-12">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2 text-slate-900">
                            <Zap className="h-5 w-5 text-primary" />
                            <span className="text-lg font-bold">Nexora</span>
                        </div>
                        <p className="text-sm text-slate-500">© 2026 Nexora Inc. All rights reserved.</p>
                        <div className="flex gap-4 text-sm text-slate-500">
                            <a href="#" className="hover:text-primary">Privacy</a>
                            <a href="#" className="hover:text-primary">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
