import { createClient } from "@/utils/supabase/server";
import { OpenAI } from "openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    try {
        const { message } = await request.json();
        const supabase = await createClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch user's financial data for context
        const { data: invoices } = await supabase
            .from('invoices')
            .select('*')
            .eq('user_id', user.id)
            .limit(10);

        const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .limit(20);

        const { data: profile } = await supabase
            .from('profiles')
            .select('business_name')
            .eq('id', user.id)
            .single();

        // Calculate key metrics
        const totalIncome = invoices?.filter(inv => inv.status === 'paid' && inv.type === 'out')
            .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0) || 0;

        const totalExpenses = transactions?.filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + Math.abs(Number(tx.amount || 0)), 0) || 0;

        const outstandingInvoices = invoices?.filter(inv => inv.status !== 'paid' && inv.type === 'out') || [];
        const outstandingAmount = outstandingInvoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);

        // Build context for GPT-4
        const context = `
You are Finora AI, a financial assistant for ${profile?.business_name || 'the user'}'s business.

Current Financial Summary:
- Total Income (Paid): ${totalIncome.toFixed(2)} MAD
- Total Expenses: ${totalExpenses.toFixed(2)} MAD
- Net Balance: ${(totalIncome - totalExpenses).toFixed(2)} MAD
- Outstanding Invoices: ${outstandingInvoices.length} invoices worth ${outstandingAmount.toFixed(2)} MAD

Recent Invoices: ${invoices?.slice(0, 5).map(inv =>
            `${inv.invoice_number}: ${inv.total_amount} MAD (${inv.status})`
        ).join(', ') || 'None'}

Recent Transactions: ${transactions?.slice(0, 5).map(tx =>
            `${tx.description}: ${tx.amount} MAD (${tx.category || 'Uncategorized'})`
        ).join(', ') || 'None'}

Provide helpful, concise financial advice. Be specific and reference their actual data when relevant.
`;

        // Call GPT-4
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: context },
                { role: "user", content: message }
            ],
            temperature: 0.7,
            max_tokens: 300,
        });

        const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";

        return NextResponse.json({ response: aiResponse });

    } catch (error: any) {
        console.error("AI Chat Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to get AI response" },
            { status: 500 }
        );
    }
}
