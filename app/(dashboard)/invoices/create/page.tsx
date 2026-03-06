'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Send, CheckCircle2, Download, Link as LinkIcon, Copy } from "lucide-react";
import { saveInvoiceAction } from "@/app/(dashboard)/invoices/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LineItem {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
}

export default function CreateInvoicePage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [invoiceId, setInvoiceId] = useState<string>("");
    const [items, setItems] = useState<LineItem[]>([
        { id: '1', description: 'Consulting Services', quantity: 1, unit_price: 5000 }
    ]);
    const [clientName, setClientName] = useState('');
    const [invoiceNum, setInvoiceNum] = useState(`INV-${new Date().getFullYear()}-001`);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');

    const addItem = () => {
        setItems([...items, { id: Math.random().toString(), description: '', quantity: 1, unit_price: 0 }]);
    };

    const removeItem = (id: string) => {
        if (items.length === 1) return;
        setItems(items.filter(i => i.id !== id));
    };

    const updateItem = (id: string, field: keyof LineItem, value: any) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
    const vat = subtotal * 0.20;
    const total = subtotal + vat;

    const handleSave = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        setSaving(true);

        const invoiceData = {
            type: 'out',
            invoice_number: invoiceNum,
            date: date,
            due_date: dueDate,
            client_name: clientName,
            line_items: items,
            subtotal,
            vat_amount: vat,
            total_amount: total,
            currency: 'MAD'
        };

        const result = await saveInvoiceAction(invoiceData);
        setSaving(false);

        if (result.error) {
            alert("Error: " + result.error);
        } else {
            setInvoiceId(result.invoiceId);
            setShowSuccess(true);
        }
    };

    const paymentLink = typeof window !== 'undefined' ? `${window.location.origin}/pay/${invoiceId}` : '';

    const copyLink = () => {
        navigator.clipboard.writeText(paymentLink);
        alert("Payment link copied!");
    };

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">New Client Invoice</h1>
                        <p className="text-gray-400">Create and send a professional invoice.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button className="bg-secondary hover:bg-secondary/90 text-white gap-2" onClick={handleSave} disabled={saving}>
                            {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Send className="w-4 h-4" />}
                            Save & Send
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Invoice Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>To (Client)</Label>
                                    <Input placeholder="Client Name or Business" value={clientName} onChange={e => setClientName(e.target.value)} className="bg-white/5" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Invoice Number</Label>
                                    <Input value={invoiceNum} onChange={e => setInvoiceNum(e.target.value)} className="bg-white/5 font-mono" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Issue Date</Label>
                                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-white/5" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Due Date</Label>
                                    <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="bg-white/5" />
                                </div>
                            </div>

                            <div className="pt-4">
                                <Label className="mb-4 block">Line Items</Label>
                                <div className="space-y-3">
                                    {items.map((item, index) => (
                                        <div key={item.id} className="flex gap-3 items-start group">
                                            <div className="flex-1">
                                                <Input
                                                    placeholder="Description"
                                                    value={item.description}
                                                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                                                    className="bg-white/5"
                                                />
                                            </div>
                                            <div className="w-20">
                                                <Input
                                                    type="number"
                                                    placeholder="Qty"
                                                    value={item.quantity}
                                                    onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                                                    className="bg-white/5 text-center"
                                                />
                                            </div>
                                            <div className="w-32">
                                                <Input
                                                    type="number"
                                                    placeholder="Price"
                                                    value={item.unit_price}
                                                    onChange={e => updateItem(item.id, 'unit_price', Number(e.target.value))}
                                                    className="bg-white/5 text-right"
                                                />
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-gray-500 hover:text-red-400">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" onClick={addItem} className="mt-2 text-secondary border-secondary/20 hover:bg-secondary/10">
                                        <Plus className="w-4 h-4 mr-2" /> Add Item
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-sm text-gray-400">Payment Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="text-white font-mono">{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">VAT (20%)</span>
                                    <span className="text-white font-mono">{vat.toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-white/10 my-2" />
                                <div className="flex justify-between text-lg font-bold">
                                    <span className="text-white">Total</span>
                                    <span className="text-secondary font-mono">{total.toFixed(2)} <span className="text-xs font-normal text-gray-500">MAD</span></span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-navy to-[#00153a] border-navy/50">
                            <CardContent className="pt-6">
                                <p className="text-sm text-center text-aero/80 mb-4">
                                    This will generate a formal PDF invoice and payment link.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
                <DialogContent className="sm:max-w-md bg-card border-white/10">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-secondary" />
                            </div>
                            <div>
                                <DialogTitle className="text-white">Invoice Created Successfully!</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    Your invoice is ready to send.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-sm text-gray-400">Payment Link</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={paymentLink}
                                    readOnly
                                    className="bg-white/5 border-white/10 text-sm font-mono"
                                />
                                <Button variant="outline" size="icon" onClick={copyLink} title="Copy Link">
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex gap-2 sm:gap-2">
                        <Button asChild variant="outline" className="flex-1">
                            <Link href={`/api/invoices/${invoiceId}/pdf`} target="_blank">
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </Link>
                        </Button>
                        <Button onClick={() => router.push('/invoices')} className="flex-1 bg-secondary hover:bg-secondary/90">
                            View Invoices
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
