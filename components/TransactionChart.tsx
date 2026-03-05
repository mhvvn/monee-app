"use client";

import { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";

interface ChartData {
    date: string;
    Pemasukan: number;
    Pengeluaran: number;
}

export default function TransactionChart({ data }: { data: ChartData[] }) {
    // Jika tidak ada data
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-neutral-500">
                <p>Belum ada data transaksi bulan ini.</p>
            </div>
        );
    }

    // Custom Tooltip component for Recharts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl shadow-2xl">
                    <p className="text-neutral-900 dark:text-white font-medium mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center space-x-2 text-sm mt-1">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-neutral-500 dark:text-neutral-400">{entry.name}:</span>
                            <span
                                className="font-semibold"
                                style={{ color: entry.color }}
                            >
                                Rp {entry.value.toLocaleString("id-ID")}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 0,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#737373"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="#737373"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value: any) => `${value >= 1000 ? value / 1000 + 'k' : value}`}
                        dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#404040', strokeWidth: 1, strokeDasharray: '3 3' }} />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="Pemasukan"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, fill: "#10b981", stroke: "#064e3b", strokeWidth: 2 }}
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="Pengeluaran"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, fill: "#ef4444", stroke: "#7f1d1d", strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
