import { createClient } from "@/utils/supabase/server";
import { InvoiceDashboard } from "@/components/invoices/invoice-dashboard";

export default async function InvoicesPage() {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return <div className="p-8 text-red-500">Please log in to view invoices.</div>;
    }

    // Explicitly filter by user_id to ensure data isolation
    const { data: invoices, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching invoices:", error);
        return <div className="p-8 text-red-500">Failed to load invoices.</div>;
    }

    return <InvoiceDashboard invoices={invoices || []} />;
}
