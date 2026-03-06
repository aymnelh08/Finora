'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface CashflowData {
    name: string;
    income: number;
    expense: number;
}

interface CashflowChartProps {
    data?: CashflowData[];
}

export function CashflowChart({ data }: CashflowChartProps) {
    // Default empty data if none provided
    const chartData = data && data.length > 0 ? data : [
        { name: 'No data', income: 0, expense: 0 }
    ];

    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00A36C" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#00A36C" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f22" vertical={false} />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value > 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString()} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#27272a', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => `${value.toFixed(2)} MAD`}
                    />
                    <Area type="monotone" dataKey="income" name="Income" stroke="#00A36C" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" name="Expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
