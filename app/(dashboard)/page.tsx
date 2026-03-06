import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Plus, Upload, Wallet, FileText } from "lucide-react";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Fetch data in parallel for better performance
  const [
    { data: profile },
    { data: invoices },
    { data: allTransactions },
    { data: transactions }
  ] = await Promise.all([
    supabase.from('profiles').select('business_name, full_name').eq('id', user.id).single(),
    supabase.from('invoices').select('*').eq('user_id', user.id),
    supabase.from('transactions').select('*').eq('user_id', user.id),
    supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(4)
  ]);

  // Calculate KPIs
  const clientInvoices = invoices?.filter(inv => inv.type === 'out') || [];
  const outstandingInvoices = clientInvoices.filter(inv => inv.status !== 'paid');
  const outstandingAmount = outstandingInvoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
  const overdueCount = outstandingInvoices.filter(inv => inv.status === 'overdue').length;

  const monthlyExpenses = allTransactions?.filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + Math.abs(Number(tx.amount || 0)), 0) || 0;

  const totalBalance = (invoices?.filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0) || 0) - monthlyExpenses;

  // Calculate cashflow data for chart (last 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const cashflowData = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    // Calculate income from paid invoices in this month
    const monthIncome = invoices?.filter(inv => {
      if (!inv.created_at || inv.status !== 'paid') return false;
      const invDate = new Date(inv.created_at);
      return invDate.getFullYear() === date.getFullYear() && invDate.getMonth() === date.getMonth();
    }).reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0) || 0;

    // Calculate expenses from transactions in this month
    const monthExpense = allTransactions?.filter(tx => {
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
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Overview</h2>
          <p className="text-gray-400 mt-1">Here's what's happening with <span className="text-aero font-semibold">{profile?.business_name || 'your business'}</span> today.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/invoices/upload">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-colors text-sm font-medium">
              <Upload className="w-4 h-4" />
              Upload Doc
            </button>
          </Link>
          <Link href="/invoices/create">
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-all shadow-lg shadow-secondary/20 text-sm font-medium">
              <Plus className="w-4 h-4" />
              New Invoice
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-navy to-[#00153a] border-navy/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-24 h-24 text-aero" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-300 font-medium text-sm">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white tracking-tight">
              {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-lg text-gray-400 font-normal"> MAD</span>
            </div>
            <div className="flex items-center gap-2 mt-4 text-emerald-400 text-sm bg-emerald-500/10 w-fit px-2 py-1 rounded-full">
              <ArrowUpRight className="w-4 h-4" />
              <span>Current balance</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-gray-400 font-medium text-sm">Outstanding Invoices</CardTitle>
            <FileText className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white tracking-tight">
              {outstandingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-lg text-gray-400 font-normal"> MAD</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {overdueCount > 0 ? `${overdueCount} invoice${overdueCount > 1 ? 's' : ''} overdue` : 'All invoices current'}
            </p>
            <div className="h-1 w-full bg-white/5 mt-4 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500" style={{ width: `${outstandingInvoices.length > 0 ? 60 : 0}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-gray-400 font-medium text-sm">Monthly Expenses</CardTitle>
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white tracking-tight">
              {monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-lg text-gray-400 font-normal"> MAD</span>
            </div>
            <div className="flex items-center gap-2 mt-4 text-gray-400 text-sm">
              <span>This month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart + Recent Txn Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Cashflow Analysis</CardTitle>
            <CardDescription>Income vs Expenses (Last 6 months)</CardDescription>
          </CardHeader>
          <CardContent>
            <CashflowChart data={cashflowData} />
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Link href="/transactions" className="text-xs text-secondary hover:text-white transition-colors">
              View All
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {transactions && transactions.length > 0 ? (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-secondary/20 text-secondary' : 'bg-white/5 text-gray-400'}`}>
                      {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-secondary transition-colors">{tx.description}</div>
                      <div className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()} • {tx.category || 'Uncategorized'}</div>
                    </div>
                  </div>
                  <div className={`font-mono text-sm ${tx.type === 'income' ? 'text-secondary' : 'text-white'}`}>
                    {tx.type === 'income' ? '+' : ''}{Number(tx.amount).toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No transactions yet</p>
                <Link href="/transactions" className="text-xs text-secondary hover:underline mt-2 inline-block">
                  Upload bank statement
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
