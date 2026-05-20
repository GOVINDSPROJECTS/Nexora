import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/app/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Briefcase, ShieldCheck, Mail, Phone, Calendar, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';

interface EmployeeFormProps {
    employeeId?: string;
}

export default function EmployeeForm({ employeeId }: EmployeeFormProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [errors, setErrors] = useState<any>({});
    
    const [departments, setDepartments] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    
    const [formData, setFormData] = useState<any>({
        name: '',
        email: '',
        work_email: '',
        phone: '',
        employee_id: '',
        department_id: '',
        designation_id: '',
        joining_date: '',
        manager_id: '',
        employment_type: 'full-time',
        status: 'active',
        create_user_account: false,
        password: '',
        role: 'Employee',
    });

    useEffect(() => {
        fetchMetadata();
        if (employeeId) {
            fetchEmployee();
        }
    }, [employeeId]);

    const fetchMetadata = async () => {
        try {
            const [deptRes, desigRes, empRes] = await Promise.all([
                api.get('/org/departments'),
                api.get('/org/designations'),
                api.get('/employees?per_page=100')
            ]);
            setDepartments(deptRes.data.data);
            setDesignations(desigRes.data.data);
            setEmployees(empRes.data.data.data);
        } catch (err) {
            console.error('Failed to fetch metadata', err);
        }
    };

    const fetchEmployee = async () => {
        setFetching(true);
        try {
            const response = await api.get(`/employees/${employeeId}`);
            const data = response.data.data;
            setFormData({
                ...data,
                department_id: data.department?.id?.toString() || '',
                designation_id: data.designation?.id?.toString() || '',
                manager_id: data.manager?.id?.toString() || '',
                create_user_account: !!data.user,
                role: data.user?.role || 'Employee',
                password: '',
            });
        } catch (err) {
            console.error('Failed to fetch employee', err);
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            if (employeeId) {
                await api.put(`/employees/${employeeId}`, formData);
                toast.success('Employee updated successfully');
            } else {
                await api.post('/employees', formData);
                toast.success('Employee registered successfully');
            }
            navigate('/employees');
        } catch (err: any) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
                toast.error('Validation failed. Please check the form.');
            } else {
                toast.error('Something went wrong.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {employeeId ? 'Update Employee Profile' : 'Register New Employee'}
                    </h1>
                    <p className="text-muted-foreground">
                        {employeeId ? 'Update basic info and system access.' : 'Add a new member to your organization.'}
                    </p>
                </div>
                {employeeId && (
                    <Badge variant={formData.status === 'active' ? 'default' : 'secondary'} className="px-3 py-1">
                        {formData.status.toUpperCase()}
                    </Badge>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section: Personal Information */}
                <Card className="border-none shadow-sm ring-1 ring-gray-200">
                    <CardHeader className="bg-gray-50/50">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-500" />
                            Personal Information
                        </CardTitle>
                        <CardDescription>Legal name and contact details.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input 
                                    id="name" 
                                    placeholder="e.g. John Doe" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    required 
                                />
                                {errors.name && <p className="text-xs text-red-600">{errors.name[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="work_email">Work email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="work_email" 
                                        type="email" 
                                        placeholder="john.doe@company.com (auto if empty)" 
                                        className="pl-9"
                                        value={formData.work_email} 
                                        onChange={handleChange} 
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Login email (user account)</Label>
                                <Input id="email" type="email" placeholder="Defaults to work email" value={formData.email} onChange={handleChange} />
                                {errors.email && <p className="text-xs text-red-600">{errors.email[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="phone" 
                                        placeholder="+1 (555) 000-0000" 
                                        className="pl-9"
                                        value={formData.phone} 
                                        onChange={handleChange} 
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section: Employment Details */}
                <Card className="border-none shadow-sm ring-1 ring-gray-200">
                    <CardHeader className="bg-gray-50/50">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-orange-500" />
                            Employment Details
                        </CardTitle>
                        <CardDescription>Position, department, and reporting line.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="employee_id">Employee ID</Label>
                                <Input 
                                    id="employee_id" 
                                    placeholder="EMP-001" 
                                    value={formData.employee_id} 
                                    onChange={handleChange} 
                                />
                                {errors.employee_id && <p className="text-xs text-red-600">{errors.employee_id[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Department</Label>
                                <Select 
                                    value={formData.department_id} 
                                    onValueChange={(v) => handleSelectChange('department_id', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept: any) => (
                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Designation</Label>
                                <Select 
                                    value={formData.designation_id} 
                                    onValueChange={(v) => handleSelectChange('designation_id', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Designation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {designations
                                            .filter((d: any) => !formData.department_id || d.department_id?.toString() === formData.department_id)
                                            .map((desig: any) => (
                                            <SelectItem key={desig.id} value={desig.id.toString()}>
                                                {desig.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Reporting Manager</Label>
                                <Select 
                                    value={formData.manager_id} 
                                    onValueChange={(v) => handleSelectChange('manager_id', v)}
                                >
                                    <SelectTrigger className="flex items-center">
                                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="Select Manager" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Manager (Upper Management)</SelectItem>
                                        {employees.filter(e => e.id.toString() !== employeeId).map((emp: any) => (
                                            <SelectItem key={emp.id} value={emp.id.toString()}>
                                                {emp.name} ({emp.designation?.name || 'N/A'})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="employment_type">Employment Type</Label>
                                <Select 
                                    value={formData.employment_type} 
                                    onValueChange={(v) => handleSelectChange('employment_type', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full-time">Full-time</SelectItem>
                                        <SelectItem value="part-time">Part-time</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Current Status</Label>
                                <Select 
                                    value={formData.status} 
                                    onValueChange={(v) => handleSelectChange('status', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="onboarding">Onboarding</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section: User Account Management */}
                <Card className={`border-none shadow-sm ring-1 transition-all ${formData.create_user_account ? 'ring-primary/50 bg-primary/5' : 'ring-gray-200'}`}>
                    <CardHeader className={formData.create_user_account ? 'bg-primary/5' : 'bg-gray-50/50'}>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShieldCheck className={`h-5 w-5 ${formData.create_user_account ? 'text-primary' : 'text-gray-400'}`} />
                                System Access
                            </CardTitle>
                            <div className="flex items-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    id="create_user_account" 
                                    checked={formData.create_user_account}
                                    onChange={(e) => setFormData((prev: any) => ({ ...prev, create_user_account: e.target.checked }))}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                />
                                <Label htmlFor="create_user_account" className="cursor-pointer font-medium text-sm">
                                    {employeeId ? 'Modify Access' : 'Create Login Account'}
                                </Label>
                            </div>
                        </div>
                        <CardDescription>Grant login permissions and assign system roles.</CardDescription>
                    </CardHeader>
                    {formData.create_user_account && (
                        <CardContent className="pt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        {employeeId ? 'Reset Password (optional)' : 'Login Password'}
                                    </Label>
                                    <Input 
                                        id="password" 
                                        type="password" 
                                        placeholder={employeeId ? 'Leave blank to keep current' : 'Min. 8 characters'}
                                        value={formData.password} 
                                        onChange={handleChange} 
                                    />
                                    {errors.password && <p className="text-xs text-red-600">{errors.password[0]}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">System Role</Label>
                                    <Select 
                                        value={formData.role} 
                                        onValueChange={(v) => handleSelectChange('role', v)}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Employee">Basic Employee</SelectItem>
                                            <SelectItem value="Manager">Department Manager</SelectItem>
                                            <SelectItem value="HR">HR Specialist</SelectItem>
                                            <SelectItem value="Tenant Admin">Company Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.role && <p className="text-xs text-red-600">{errors.role[0]}</p>}
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-6">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => navigate('/employees')}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" className="px-8" disabled={loading}>
                        {loading ? (
                            <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                {employeeId ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            <>
                                {employeeId ? <Briefcase className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                {employeeId ? 'Update Profile' : 'Add Employee'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
