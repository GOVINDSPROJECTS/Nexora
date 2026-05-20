import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/app/api/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal, Calendar, User, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const COLUMNS = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'completed', title: 'Completed' },
];

const PRIORITY_COLORS: any = {
    low: 'bg-blue-100 text-blue-700 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    critical: 'bg-red-100 text-red-700 border-red-200',
};

export default function TaskBoard() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assigned_to: '',
        due_date: '',
    });

    const { data: tasks, isLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const payload = (await api.get('/tasks')).data.data;
            return Array.isArray(payload) ? payload : (payload?.data ?? []);
        },
    });

    const { data: employees } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const payload = (await api.get('/employees', { params: { per_page: 100 } })).data.data;
            return Array.isArray(payload) ? payload : (payload?.data ?? []);
        },
    });

    const createMutation = useMutation({
        mutationFn: (newTask: any) => api.post('/tasks', newTask),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setIsCreateOpen(false);
            setFormData({ title: '', description: '', status: 'todo', priority: 'medium', assigned_to: '', due_date: '' });
            toast.success('Task created successfully');
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) => api.patch(`/tasks/${id}`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    if (isLoading) return <div className="flex items-center justify-center h-64">Loading Board...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Task Board</h1>
                    <p className="text-muted-foreground">Manage operational tasks and team productivity.</p>
                </div>
                
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Task</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input 
                                    id="title" 
                                    value={formData.title} 
                                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                                    placeholder="Task title"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea 
                                    id="description" 
                                    value={formData.description} 
                                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                    placeholder="Task details..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <Select 
                                        value={formData.priority} 
                                        onValueChange={(v) => setFormData({...formData, priority: v})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select 
                                        value={formData.status} 
                                        onValueChange={(v) => setFormData({...formData, status: v})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todo">To Do</SelectItem>
                                            <SelectItem value="in-progress">In Progress</SelectItem>
                                            <SelectItem value="review">Review</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Assigned To</Label>
                                    <Select 
                                        value={formData.assigned_to} 
                                        onValueChange={(v) => setFormData({...formData, assigned_to: v})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Assignee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees?.map((emp: any) => (
                                                <SelectItem key={emp.id} value={emp.id.toString()}>
                                                    {emp.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Due Date</Label>
                                    <Input 
                                        type="date" 
                                        value={formData.due_date} 
                                        onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? 'Creating...' : 'Create Task'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
                {COLUMNS.map((column) => (
                    <div key={column.id} className="flex flex-col min-w-[280px]">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                {column.title}
                                <Badge variant="secondary" className="font-normal text-[10px]">
                                    {tasks?.filter((t: any) => t.status === column.id).length || 0}
                                </Badge>
                            </h3>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-3 p-2 rounded-lg bg-gray-100/50 min-h-[500px]">
                            {tasks?.filter((t: any) => t.status === column.id).map((task: any) => (
                                <Card key={task.id} className="group cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all shadow-sm border-none">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <Badge className={`text-[10px] px-1.5 py-0 capitalize border shadow-none font-medium ${PRIORITY_COLORS[task.priority]}`}>
                                                {task.priority}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreHorizontal className="h-3 w-3" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: task.id, status: 'todo' })}>Move to Todo</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: task.id, status: 'in-progress' })}>Move to Progress</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: task.id, status: 'review' })}>Move to Review</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: task.id, status: 'completed' })}>Mark Completed</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        
                                        <h4 className="font-medium text-sm leading-tight text-gray-800">{task.title}</h4>
                                        
                                        {task.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                                        )}

                                        <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center text-[11px] text-muted-foreground">
                                                    <MessageSquare className="mr-1 h-3 w-3" />
                                                    {task.comments_count}
                                                </div>
                                                {task.due_date && (
                                                    <div className="flex items-center text-[11px] text-muted-foreground">
                                                        <Clock className="mr-1 h-3 w-3" />
                                                        {new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {task.assignee ? (
                                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-[10px] font-bold text-primary" title={task.assignee.name}>
                                                    {task.assignee.name.charAt(0)}
                                                </div>
                                            ) : (
                                                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                                                    <User className="h-3 w-3 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            
                            {tasks?.filter((t: any) => t.status === column.id).length === 0 && (
                                <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
                                    <p className="text-[10px] uppercase font-medium">No tasks</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
