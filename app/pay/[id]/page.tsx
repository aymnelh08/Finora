'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Building2, Calendar, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [paid, setPaid] = useState(false);

    useEffect(() => {
        async function loadInvoice() {
            const { id } = await params;
            const supabase = createClient();

            const { data, error } = await supabase
                .from('invoices')
                .select('*, invoice_items(*)')
                .eq('id', id)
                .eq('type', 'out') // Only client invoices
                .single();

            if (data) {
                setInvoice(data);
                setPaid(data.status === 'paid');
            }
            setLoading(false);
        }

        loadInvoice();
    }, [params]);

    const handlePayment = async () => {
        setPaying(true);
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update invoice status to paid
        const supabase = createClient();
        await supabase
            .from('invoices')
            .update({ status: 'paid' })
            .eq('id', invoice.id);

        setPaid(true);
        setPaying(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6 text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Invoice Not Found</h2>
                        <p className="text-gray-500">This invoice doesn't exist or is not available for payment.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-secondary p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center text-white space-y-2">
                    <h1 className="text-3xl font-bold">Invoice Payment</h1>
                    <p className="text-white/70">Secure payment for invoice #{invoice.invoice_number}</p>
                </div>

                {/* Invoice Details Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-secondary" />
                                Invoice Details
                            </span>
                            <Badge variant={paid ? 'success' : 'warning'}>
                                {paid ? 'Paid' : invoice.status}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Invoice Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Invoice Number</p>
                                <p className="font-mono font-medium">{invoice.invoice_number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Issue Date</p>
                                <p className="font-medium">
                                    {format(new Date(invoice.issue_date), 'MMM dd, yyyy')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Due Date</p>
                                <p className="font-medium">
                                    {invoice.due_date ? format(new Date(invoice.due_date), 'MMM dd, yyyy') : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Client</p>
                                <p className="font-medium">{invoice.client_name}</p>
                            </div>
                        </div>

                        {/* Line Items */}
                        {invoice.invoice_items && invoice.invoice_items.length > 0 && (
                            <div className="space-y-3 pt-4 border-t">
                                <p className="text-sm font-medium text-gray-700">Items</p>
                                {invoice.invoice_items.map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {item.description} × {item.quantity}
                                        </span>
                                        <span className="font-medium">
                                            {(item.quantity * item.unit_price).toFixed(2)} {invoice.currency}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Totals */}
                        <div className="space-y-2 pt-4 border-t">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">{invoice.subtotal?.toFixed(2)} {invoice.currency}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">VAT (20%)</span>
                                <span className="font-medium">{invoice.vat_amount?.toFixed(2)} {invoice.currency}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t">
                                <span className="text-lg font-bold">Total Amount</span>
                                <span className="text-2xl font-bold text-secondary">
                                    {invoice.total_amount?.toFixed(2)} {invoice.currency}
                                </span>
                            </div>
                        </div>

                        {/* Payment Button */}
                        {!paid ? (
                            <Button
                                onClick={handlePayment}
                                disabled={paying}
                                className="w-full bg-secondary hover:bg-secondary/90 text-white h-12 text-lg"
                            >
                                {paying ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Processing Payment...
                                    </>
                                ) : (
                                    <>
                                        Pay {invoice.total_amount?.toFixed(2)} {invoice.currency}
                                    </>
                                )}
                            </Button>
                        ) : (
                            <div className="text-center py-6 bg-green-50 rounded-lg border border-green-200">
                                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                                <p className="text-lg font-bold text-green-900">Payment Received!</p>
                                <p className="text-sm text-green-700">Thank you for your payment.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center text-white/70 text-sm">
                    <p>Powered by Finora • Secure Payment Processing</p>
                </div>
            </div>
        </div>
    );
}
