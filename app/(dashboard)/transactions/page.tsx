import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, FileSpreadsheet } from "lucide-react";
import { TransactionsClient } from "@/components/transactions/transactions-client";

export default async function TransactionsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div className="p-8 text-red-500">Please log in to view transactions.</div>;
    }

    // Fetch user's transactions
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

    if (error) {
        console.error("Error fetching transactions:", error);
        return <div className="p-8 text-red-500">Failed to load transactions.</div>;
    }

    return <TransactionsClient initialTransactions={transactions || []} />;
}
