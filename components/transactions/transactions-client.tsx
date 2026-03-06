'use client';

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileSpreadsheet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Papa from "papaparse";

export function TransactionsClient({ initialTransactions }: { initialTransactions: any[] }) {
    const [transactions, setTransactions] = useState(initialTransactions);
    const [filter, setFilter] = useState('all');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            complete: async (results) => {
                // Transform CSV data to match our schema
                const newTransactions = results.data.map((row: any) => ({
                    date: row.date || row.Date,
                    description: row.description || row.Description,
                    amount: parseFloat(row.amount || row.Amount),
                    type: parseFloat(row.amount || row.Amount) > 0 ? 'income' : 'expense',
                    category: row.category || row.Category || 'Uncategorized',
                    status: 'pending'
                })).filter(tx => tx.date && tx.amount);

                // TODO: Save to database via server action
                setTransactions([...newTransactions, ...transactions]);
                alert(`Imported ${newTransactions.length} transactions`);
            }
        });
    };

    const filteredTransactions = transactions.filter(tx => {
        if (filter === 'all') return true;
        return tx.type === filter;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Transactions</h1>
                    <p className="text-gray-400 mt-1">Import and manage your bank transactions.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                        <Upload className="w-4 h-4" />
                        Import CSV
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Transactions</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expenses</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Transactions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredTransactions.length === 0 ? (
                        <div className="text-center py-12">
                            <FileSpreadsheet className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-white mb-2">No transactions yet</h3>
                            <p className="text-gray-500 mb-4">Upload a CSV file from your bank to get started</p>
                            <Button onClick={() => fileInputRef.current?.click()} className="bg-secondary hover:bg-secondary/90">
                                <Upload className="w-4 h-4 mr-2" />
                                Import CSV
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-white/10">
                                    <tr className="text-left text-sm text-gray-400">
                                        <th className="pb-3 font-medium">Date</th>
                                        <th className="pb-3 font-medium">Description</th>
                                        <th className="pb-3 font-medium">Category</th>
                                        <th className="pb-3 font-medium">Amount</th>
                                        <th className="pb-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredTransactions.map((tx, i) => (
                                        <tr key={tx.id || i} className="hover:bg-white/5 transition-colors">
                                            <td className="py-3 text-sm text-gray-400">
                                                {new Date(tx.date).toLocaleDateString()}
                                            </td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-secondary/20 text-secondary' : 'bg-white/5 text-gray-400'}`}>
                                                        {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                                    </div>
                                                    <span className="text-white font-medium">{tx.description}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-sm text-gray-400">{tx.category}</td>
                                            <td className="py-3">
                                                <span className={`font-mono font-medium ${tx.type === 'income' ? 'text-secondary' : 'text-white'}`}>
                                                    {tx.type === 'income' ? '+' : ''}{Number(tx.amount).toFixed(2)} MAD
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <Badge variant={tx.status === 'reconciled' ? 'success' : 'warning'}>
                                                    {tx.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
