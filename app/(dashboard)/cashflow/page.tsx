import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { CashflowSimulator } from "@/components/cashflow/cashflow-simulator";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export default async function CashflowPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div className="p-8 text-red-500">Please log in to view cashflow.</div>;
    }

    // Fetch invoices for balance calculation
    const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id);

    // Fetch transactions for expense calculation
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

    // Calculate current balance
    const paidInvoices = invoices?.filter(inv => inv.status === 'paid') || [];
    const totalIncome = paidInvoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);

    const expenses = transactions?.filter(tx => tx.type === 'expense') || [];
    const totalExpenses = expenses.reduce((sum, tx) => sum + Math.abs(Number(tx.amount || 0)), 0);

    const currentBalance = totalIncome - totalExpenses;

    // Calculate cashflow data for chart (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const cashflowData = [];

    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

        // Calculate income from paid invoices in this month
        const monthIncome = invoices?.filter(inv => {
            if (!inv.created_at || inv.status !== 'paid') return false;
            const invDate = new Date(inv.created_at);
            return invDate.getFullYear() === date.getFullYear() && invDate.getMonth() === date.getMonth();
        }).reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0) || 0;

        // Calculate expenses from transactions in this month
        const monthExpense = transactions?.filter(tx => {
            if (!tx.date || tx.type !== 'expense') return false;
            const txDate = new Date(tx.date);
            return txDate.getFullYear() === date.getFullYear() && txDate.getMonth() === date.getMonth();
        }).reduce((sum, tx) => sum + Math.abs(Number(tx.amount || 0)), 0) || 0;

        cashflowData.push({
            name: monthNames[date.getMonth()],
            income: monthIncome,
            expense: monthExpense
        });
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Cashflow & Prediction</h1>
                <p className="text-gray-400 mt-1">AI-powered forecasts and "What-If" scenarios.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <Card className="col-span-1 lg:col-span-2 bg-gradient-to-br from-[#0c0c0e] to-[#000000] border-white/10">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>6-Month Forecast</span>
                            <Badge variant="secondary" className="bg-secondary/20 text-secondary hover:bg-secondary/30">
                                AI Prediction
                            </Badge>
                        </CardTitle>
                        <CardDescription>Based on your historical data and trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CashflowChart data={cashflowData} />
                    </CardContent>
                </Card>

                {/* Simulator */}
                <CashflowSimulator currentBalance={currentBalance} />
            </div>
        </div>
    );
}
