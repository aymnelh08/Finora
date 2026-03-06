import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, PieChart } from "lucide-react";

export default async function ReportsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div className="p-8 text-red-500">Please log in to view reports.</div>;
    }

    // Fetch invoices for VAT calculation
    const { data: invoices } = await supabase
        .from('invoices')
        .select('*, invoice_items(*)')
        .eq('user_id', user.id);

    // Fetch transactions for expense breakdown
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'expense');

    // Calculate VAT
    const clientInvoices = invoices?.filter(inv => inv.type === 'out') || [];
    const supplierInvoices = invoices?.filter(inv => inv.type === 'in') || [];

    const vatCollected = clientInvoices.reduce((sum, inv) => sum + Number(inv.vat_amount || 0), 0);
    const vatDeductible = supplierInvoices.reduce((sum, inv) => sum + Number(inv.vat_amount || 0), 0);
    const netVatDue = vatCollected - vatDeductible;

    // Calculate expense breakdown by category
    const expensesByCategory = transactions?.reduce((acc: any, tx) => {
        const category = tx.category || 'Other';
        acc[category] = (acc[category] || 0) + Math.abs(Number(tx.amount || 0));
        return acc;
    }, {}) || {};

    const totalExpenses = Object.values(expensesByCategory).reduce((sum: number, val: any) => sum + val, 0);

    const expenseBreakdown = Object.entries(expensesByCategory)
        .map(([name, amount]: [string, any]) => ({
            name,
            amount,
            percent: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-gray-500'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Financial Reports</h1>
                    <p className="text-gray-400 mt-1">VAT, P&L, and Tax Summaries.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export All
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* VAT Report */}
                <Card className="border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-secondary" />
                            VAT Summary (TVA)
                        </CardTitle>
                        <CardDescription>Collected vs Deductible VAT</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <div className="text-xs text-gray-400 uppercase">VAT Collected</div>
                                <div className="text-xl font-bold text-emerald-400">
                                    {vatCollected.toFixed(2)}
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                <div className="text-xs text-gray-400 uppercase">VAT Deductible</div>
                                <div className="text-xl font-bold text-red-400">
                                    {vatDeductible.toFixed(2)}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <span className="text-lg font-medium text-white">Net VAT Due</span>
                            <span className="text-2xl font-bold text-white">
                                {netVatDue.toFixed(2)} <span className="text-sm font-normal text-gray-400">MAD</span>
                            </span>
                        </div>
                        <Button className="w-full bg-white/5 hover:bg-white/10 border border-white/10">
                            Download VAT Declaration
                        </Button>
                    </CardContent>
                </Card>

                {/* Expense Breakdown */}
                <Card className="border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-aero" />
                            Expense Breakdown
                        </CardTitle>
                        <CardDescription>
                            Total: {totalExpenses.toFixed(2)} MAD
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {expenseBreakdown.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>No expense data available</p>
                                <p className="text-xs mt-2">Upload transactions to see breakdown</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {expenseBreakdown.map((cat, index) => (
                                    <div key={cat.name} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-300">{cat.name}</span>
                                            <span className="text-gray-400">{cat.percent}%</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${colors[index % colors.length]}`}
                                                style={{ width: `${cat.percent}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
