'use client';

import { useState } from "react";
import { FileUpload } from "@/components/invoices/file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeInvoiceAction, saveInvoiceAction } from "@/app/invoices/actions";
import { Loader2, Save, FileText, ChevronLeft, AlertTriangle, ArrowRight, Building2, Users, Upload, Edit3, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UploadInvoicePage() {
    const router = useRouter();
    const [step, setStep] = useState<0 | 1 | 2 | 3>(0); // 0: type selection, 1: method selection, 2: upload/manual, 3: review
    const [invoiceType, setInvoiceType] = useState<'in' | 'out' | null>(null);
    const [entryMethod, setEntryMethod] = useState<'upload' | 'manual' | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [filePath, setFilePath] = useState<string | null>(null);
    const [data, setData] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectType = (type: 'in' | 'out') => {
        setInvoiceType(type);
        setData({ ...data, type });
        setStep(1);
    };

    const selectMethod = (method: 'upload' | 'manual') => {
        setEntryMethod(method);
        if (method === 'manual') {
            // Skip to review step with empty data
            setData({ ...data, type: invoiceType });
            setStep(3);
        } else {
            setStep(2);
        }
    };

    const handleUploadComplete = async (path: string) => {
        setFilePath(path);
        setAnalyzing(true);
        setError(null);

        // Call AI
        const result = await analyzeInvoiceAction(path);

        setAnalyzing(false);

        if (result.error) {
            setError(result.error);
            return;
        }

        if (result.success) {
            setData({ ...result.data, file_path: path, type: invoiceType });
            setStep(3);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const result = await saveInvoiceAction(data);

        setSaving(false);

        if (result.error) {
            setError(result.error);
        } else {
            router.push('/invoices');
        }
    };

    // Calculate totals from line items
    const calculateTotals = (items: any[]) => {
        const subtotal = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_price || 0)), 0);
        const vatRate = 0.20; // 20% VAT - you can make this configurable
        const vatAmount = subtotal * vatRate;
        const totalAmount = subtotal + vatAmount;

        return { subtotal, vatAmount, totalAmount };
    };

    const handleChange = (field: string, value: any) => {
        setData((prev: any) => {
            const updated = { ...prev, [field]: value };

            // Recalculate totals when line items change
            if (field === 'line_items' && value && value.length > 0) {
                const { subtotal, vatAmount, totalAmount } = calculateTotals(value);
                updated.subtotal = subtotal;
                updated.vat_amount = vatAmount;
                updated.total_amount = totalAmount;
            }

            // Set default status for client invoices (income) to pending
            if (field === 'type' && value === 'out' && !updated.status) {
                updated.status = 'pending';
            }

            return updated;
        });
    }

    const goBack = () => {
        if (step === 3) setStep(entryMethod === 'manual' ? 1 : 2);
        else if (step === 2) setStep(1);
        else if (step === 1) setStep(0);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">

            <div className="flex items-center gap-4">
                {step > 0 && (
                    <Button variant="ghost" size="icon" onClick={goBack}>
                        <ChevronLeft className="w-5 h-5 text-gray-400" />
                    </Button>
                )}
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        {step === 0 ? "New Invoice" :
                            step === 1 ? "How would you like to create it?" :
                                step === 2 ? `Upload ${invoiceType === 'in' ? 'Supplier' : 'Client'} Invoice` :
                                    "Invoice Details"}
                    </h1>
                    <p className="text-gray-400">
                        {step === 0 ? "Choose invoice type to get started." :
                            step === 1 ? "Upload a document or enter details manually." :
                                step === 2 ? "Upload your invoice document for AI extraction." :
                                    "Review and complete the invoice information."}
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                    <p>{error}</p>
                </div>
            )}

            {/* Step 0: Type Selection */}
            {step === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card
                        className="cursor-pointer hover:border-secondary/50 transition-all group border-white/10 bg-gradient-to-br from-white/5 to-transparent"
                        onClick={() => selectType('out')}
                    >
                        <CardContent className="p-8 text-center space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                                <Users className="w-8 h-8 text-secondary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Client Invoice</h3>
                                <p className="text-sm text-gray-400">Invoice you send to clients</p>
                                <Badge className="mt-3 bg-secondary/20 text-secondary border-secondary/30">Income</Badge>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-secondary transition-colors mx-auto" />
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:border-amber-500/50 transition-all group border-white/10 bg-gradient-to-br from-white/5 to-transparent"
                        onClick={() => selectType('in')}
                    >
                        <CardContent className="p-8 text-center space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                                <Building2 className="w-8 h-8 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Supplier Invoice</h3>
                                <p className="text-sm text-gray-400">Bills you receive from suppliers</p>
                                <Badge className="mt-3 bg-amber-500/20 text-amber-500 border-amber-500/30">Expense</Badge>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-amber-500 transition-colors mx-auto" />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Step 1: Method Selection */}
            {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card
                        className="cursor-pointer hover:border-secondary/50 transition-all group border-white/10 bg-gradient-to-br from-white/5 to-transparent"
                        onClick={() => selectMethod('upload')}
                    >
                        <CardContent className="p-8 text-center space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                                <Upload className="w-8 h-8 text-secondary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Upload Document</h3>
                                <p className="text-sm text-gray-400">Upload PDF or image for AI extraction</p>
                                <Badge className="mt-3 bg-secondary/20 text-secondary border-secondary/30">AI Powered</Badge>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-secondary transition-colors mx-auto" />
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:border-aero/50 transition-all group border-white/10 bg-gradient-to-br from-white/5 to-transparent"
                        onClick={() => selectMethod('manual')}
                    >
                        <CardContent className="p-8 text-center space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-aero/10 flex items-center justify-center group-hover:bg-aero/20 transition-colors">
                                <Edit3 className="w-8 h-8 text-aero" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Create Manually</h3>
                                <p className="text-sm text-gray-400">Enter invoice details yourself</p>
                                <Badge className="mt-3 bg-aero/20 text-aero border-aero/30">Manual Entry</Badge>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-aero transition-colors mx-auto" />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Step 2: Upload */}
            {step === 2 && (
                <div className="space-y-6">
                    <FileUpload onUploadComplete={handleUploadComplete} />

                    {analyzing && (
                        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full border-2 border-secondary/30 animate-ping absolute" />
                                <div className="w-12 h-12 rounded-full border-2 border-t-secondary animate-spin" />
                            </div>
                            <p className="text-white font-medium">Analyzing document with AI...</p>
                            <p className="text-sm text-gray-500">Extracting merchant, totals, and dates.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Step 3: Review/Manual Entry */}
            {step === 3 && (
                <form onSubmit={handleSave} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-secondary" />
                                Invoice Details
                                <Badge className={invoiceType === 'out' ? 'bg-secondary/20 text-secondary' : 'bg-amber-500/20 text-amber-500'}>
                                    {invoiceType === 'out' ? 'Client (Income)' : 'Supplier (Expense)'}
                                </Badge>
                                {entryMethod && (
                                    <Badge variant="outline" className="ml-auto">
                                        {entryMethod === 'upload' ? 'AI Extracted' : 'Manual Entry'}
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{invoiceType === 'out' ? 'Client Name' : 'Supplier Name'}</Label>
                                    <Input
                                        value={data.supplier_name || data.client_name || ''}
                                        onChange={(e) => handleChange(invoiceType === 'out' ? 'client_name' : 'supplier_name', e.target.value)}
                                        className="bg-white/5"
                                        placeholder="Enter name..."
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Invoice Number</Label>
                                    <Input
                                        value={data.invoice_number || ''}
                                        onChange={(e) => handleChange('invoice_number', e.target.value)}
                                        className="bg-white/5"
                                        placeholder="INV-001"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Client Address (only for client invoices) */}
                            {invoiceType === 'out' && (
                                <div className="space-y-2">
                                    <Label>Client Address (Optional)</Label>
                                    <Input
                                        value={data.client_address || ''}
                                        onChange={(e) => handleChange('client_address', e.target.value)}
                                        className="bg-white/5"
                                        placeholder="123 Business St, City, Country"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={data.date || ''}
                                        onChange={(e) => handleChange('date', e.target.value)}
                                        className="bg-white/5"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Currency</Label>
                                    <Input
                                        value={data.currency || 'MAD'}
                                        onChange={(e) => handleChange('currency', e.target.value)}
                                        className="bg-white/5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Payment Status</Label>
                                    <Select
                                        value={data.status || 'pending'}
                                        onValueChange={(value) => handleChange('status', value)}
                                    >
                                        <SelectTrigger className="bg-white/5 border-white/10">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending Payment</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="overdue">Overdue</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Line Items Section */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base">Items / Services</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const items = data.line_items || [];
                                            handleChange('line_items', [...items, { description: '', quantity: 1, unit_price: 0, total: 0 }]);
                                        }}
                                        className="gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Item
                                    </Button>
                                </div>

                                {(data.line_items || []).length === 0 ? (
                                    <div className="text-center py-8 bg-white/5 rounded-lg border border-white/10 border-dashed">
                                        <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No items added yet</p>
                                        <p className="text-xs text-gray-600 mt-1">Click "Add Item" to add products or services</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {(data.line_items || []).map((item: any, index: number) => (
                                            <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 space-y-3">
                                                        <Input
                                                            placeholder="Item description (e.g., Web Design Service)"
                                                            value={item.description || ''}
                                                            onChange={(e) => {
                                                                const items = [...(data.line_items || [])];
                                                                items[index].description = e.target.value;
                                                                handleChange('line_items', items);
                                                            }}
                                                            className="bg-white/5 border-white/10"
                                                        />
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div>
                                                                <Label className="text-xs text-gray-500">Quantity</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    step="1"
                                                                    value={item.quantity || 1}
                                                                    onChange={(e) => {
                                                                        const items = [...(data.line_items || [])];
                                                                        items[index].quantity = Number(e.target.value);
                                                                        items[index].total = items[index].quantity * items[index].unit_price;
                                                                        handleChange('line_items', items);
                                                                    }}
                                                                    className="bg-white/5 border-white/10 h-9"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs text-gray-500">Unit Price</Label>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={item.unit_price || 0}
                                                                    onChange={(e) => {
                                                                        const items = [...(data.line_items || [])];
                                                                        items[index].unit_price = Number(e.target.value);
                                                                        items[index].total = items[index].quantity * items[index].unit_price;
                                                                        handleChange('line_items', items);
                                                                    }}
                                                                    className="bg-white/5 border-white/10 h-9"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs text-gray-500">Total</Label>
                                                                <div className="h-9 px-3 flex items-center text-sm bg-black/20 rounded-md border border-white/10 font-mono text-secondary">
                                                                    {((item.quantity || 1) * (item.unit_price || 0)).toFixed(2)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                        onClick={() => {
                                                            const items = [...(data.line_items || [])];
                                                            items.splice(index, 1);
                                                            handleChange('line_items', items);
                                                        }}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Totals Section */}
                            <div className="space-y-3 pt-4 border-t border-white/5">
                                {(data.line_items && data.line_items.length > 0) ? (
                                    <>
                                        <div className="flex justify-between items-center text-sm">
                                            <Label className="text-gray-400">Subtotal</Label>
                                            <div className="font-mono text-white">
                                                {(data.subtotal || 0).toFixed(2)} {data.currency || 'MAD'}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <Label className="text-gray-400">VAT (20%)</Label>
                                            <div className="font-mono text-white">
                                                {(data.vat_amount || 0).toFixed(2)} {data.currency || 'MAD'}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                            <Label className="text-base font-bold">Total Amount</Label>
                                            <div className="font-mono text-secondary text-2xl font-bold">
                                                {(data.total_amount || 0).toFixed(2)} {data.currency || 'MAD'}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>VAT Amount</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={data.vat_amount || 0}
                                                onChange={(e) => handleChange('vat_amount', Number(e.target.value))}
                                                className="bg-white/5"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Total Amount</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={data.total_amount || 0}
                                                onChange={(e) => handleChange('total_amount', Number(e.target.value))}
                                                className="bg-white/5 font-bold text-lg"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={goBack}>Cancel</Button>
                        <Button type="submit" disabled={saving} className="bg-secondary hover:bg-secondary/90 text-white min-w-[140px]">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Confirm & Save
                        </Button>
                    </div>
                </form>
            )
            }
        </div >
    )
}
