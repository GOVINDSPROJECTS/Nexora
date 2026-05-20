import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#22c55e', '#ef4444'];

interface HiringFunnelChartProps {
    data?: { current_stage: string; count: number }[];
}

export default function HiringFunnelChart({ data = [] }: HiringFunnelChartProps) {
    const chartData = data.map((d) => ({
        stage: d.current_stage,
        count: d.count,
    }));

    if (!chartData.length) {
        return <p className="text-sm text-muted-foreground text-center py-8">No hiring data yet.</p>;
    }

    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="stage" fontSize={11} tickLine={false} axisLine={false} width={75} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18}>
                    {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
