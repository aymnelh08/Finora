'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Filter, Search, MoreHorizontal, FileText, Link2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

export function InvoiceDashboard({ invoices }: { invoices: any[] }) {
    const [filter, setFilter] = useState('');

    const clientInvoices = invoices.filter(inv => inv.type === 'out');
    const supplierInvoices = invoices.filter(inv => inv.type === 'in');

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Invoices</h1>
                    <p className="text-gray-400 mt-1">Manage your payables and receivables.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Link href="/invoices/upload">
                        <Button className="gap-2 bg-secondary hover:bg-secondary/90 text-white">
                            <Plus className="w-4 h-4" />
                            New Invoice
                        </Button>
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="client" className="space-y-6">
                <div className="flex items-center justify-between">
                    <TabsList className="bg-white/5 border border-white/10">
                        <TabsTrigger value="client" className="data-[state=active]:bg-secondary data-[state=active]:text-white">Client (Income)</TabsTrigger>
                        <TabsTrigger value="supplier" className="data-[state=active]:bg-secondary data-[state=active]:text-white">Supplier (Expenses)</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="pl-9 h-9 w-[200px] bg-white/5 border-white/10"
                            />
                        </div>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <TabsContent value="client" className="space-y-4">
                    <InvoiceTable data={clientInvoices} type="client" />
                </TabsContent>

                <TabsContent value="supplier" className="space-y-4">
                    <InvoiceTable data={supplierInvoices} type="supplier" />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function InvoiceTable({ data, type }: { data: any[], type: 'client' | 'supplier' }) {
    if (data.length === 0) {
        return (
            <div className="text-center py-20 bg-white/5 rounded-lg border border-white/10 border-dashed">
                <FileText className="w-10 h-10 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white">No invoices found</h3>
                <p className="text-gray-500">Create a new invoice to get started.</p>
            </div>
        )
    }

    return (
        <div className="rounded-md border border-white/5 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-gray-400">
                    <tr>
                        <th className="p-4 font-medium">Invoice ID</th>
                        <th className="p-4 font-medium">{type === 'client' ? 'Client' : 'Supplier'}</th>
                        <th className="p-4 font-medium">Date</th>
                        <th className="p-4 font-medium">Amount</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {data.map((invoice, i) => (
                        <tr key={invoice.id} className="hover:bg-white/5 transition-colors group">
                            <td className="p-4 font-mono text-white">{invoice.invoice_number || invoice.id.slice(0, 8)}</td>
                            <td className="p-4 text-white font-medium">
                                {invoice.client_name || "Unknown"}
                            </td>
                            <td className="p-4 text-gray-500">
                                {invoice.issue_date ? format(new Date(invoice.issue_date), 'MMM dd, yyyy') : '-'}
                            </td>
                            <td className="p-4 text-white font-medium">
                                {Number(invoice.total_amount).toLocaleString()} {invoice.currency}
                            </td>
                            <td className="p-4">
                                <Badge variant={
                                    invoice.status === 'paid' ? 'success' :
                                        invoice.status === 'overdue' ? 'destructive' : 'warning'
                                }>
                                    {invoice.status}
                                </Badge>
                            </td>
                            <td className="p-4 text-right flex justify-end gap-2">
                                {type === 'client' && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-500 hover:text-secondary"
                                            title="Copy Payment Link"
                                            onClick={() => {
                                                const paymentUrl = `${window.location.origin}/pay/${invoice.id}`;
                                                navigator.clipboard.writeText(paymentUrl);
                                                toast.success("Payment link copied to clipboard");
                                            }}
                                        >
                                            <Link2 className="w-4 h-4" />
                                        </Button>
                                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white" title="Download PDF">
                                            <Link href={`/api/invoices/${invoice.id}/pdf`} target="_blank">
                                                <Download className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                    </>
                                )}
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
