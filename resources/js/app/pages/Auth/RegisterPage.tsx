import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/app/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        company_name: '',
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        subdomain: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            await api.get('/sanctum/csrf-cookie', { baseURL: '' });
            await api.post('/register', formData);
            navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
        } catch (err: any) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ general: 'Registration failed. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <Card className="w-full max-w-lg">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
                    <CardDescription>
                        Start your 14-day free trial. No credit card required.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {errors.general && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                                {errors.general}
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="company_name">Company Name</Label>
                                <Input
                                    id="company_name"
                                    placeholder="Acme Inc."
                                    required
                                    value={formData.company_name}
                                    onChange={handleChange}
                                />
                                {errors.company_name && <p className="text-xs text-red-600">{errors.company_name[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subdomain">Subdomain (Optional)</Label>
                                <div className="flex items-center">
                                    <Input
                                        id="subdomain"
                                        placeholder="acme"
                                        value={formData.subdomain}
                                        onChange={handleChange}
                                        className="rounded-r-none"
                                    />
                                    <span className="inline-flex items-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-sm text-muted-foreground h-10">
                                        .nexora.app
                                    </span>
                                </div>
                                {errors.subdomain && <p className="text-xs text-red-600">{errors.subdomain[0]}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                required
                                value={formData.name}
                                onChange={handleChange}
                            />
                            {errors.name && <p className="text-xs text-red-600">{errors.name[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Work Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@acme.com"
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && <p className="text-xs text-red-600">{errors.email[0]}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                {errors.password && <p className="text-xs text-red-600">{errors.password[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create Account'}
                        </Button>
                        <div className="text-center text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-600 hover:underline">
                                Sign in instead
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
