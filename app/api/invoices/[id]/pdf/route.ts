import { createClient } from "@/utils/supabase/server";
import { renderToStream } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoices/invoice-pdf";
import { NextResponse } from "next/server";
import { createElement } from "react";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const invoiceId = (await params).id;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // Fetch invoice with items
    const { data: invoice, error } = await supabase
        .from("invoices")
        .select("*, invoice_items(*)")
        .eq("id", invoiceId)
        .eq("user_id", user.id)
        .single();

    if (error || !invoice) {
        return new NextResponse("Invoice not found", { status: 404 });
    }

    // Fetch user profile for logo and business details
    const { data: profile } = await supabase
        .from('profiles')
        .select('logo_url, business_name, full_name')
        .eq('id', user.id)
        .single();

    // Business details for PDF
    const businessDetails = {
        name: profile?.business_name || "Your Business",
        email: user.email || "contact@finora.ma",
        address: "Your Business Address",
        ice: "ICE123456789"
    };

    // Debug: Log invoice data
    console.log('Invoice data:', JSON.stringify(invoice, null, 2));
    console.log('Invoice items:', invoice.invoice_items);

    // Map invoice_items to line_items format for PDF
    const invoiceWithLineItems = {
        ...invoice,
        line_items: (invoice.invoice_items || []).map((item: any) => ({
            description: item.description || '',
            quantity: item.quantity || 1,
            unit_price: item.unit_price || 0,
            total: item.total || 0
        }))
    };

    console.log('Mapped line items:', invoiceWithLineItems.line_items);

    // Generate PDF using createElement to avoid JSX syntax issues
    const pdfStream = await renderToStream(
        createElement(InvoicePDF, {
            invoice: invoiceWithLineItems,
            businessDetails: businessDetails,
            logoUrl: profile?.logo_url,
            businessName: profile?.business_name
        }) as any
    );

    return new NextResponse(pdfStream as any, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="invoice-${invoice.invoice_number}.pdf"`,
        },
    });
}

