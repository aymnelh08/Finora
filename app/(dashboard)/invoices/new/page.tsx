import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Upload, ArrowRight } from "lucide-react";

export default function NewInvoicePage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Add New Invoice</h1>
                <p className="text-gray-400">Choose the type of invoice you want to add.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">

                {/* Client Invoice - Create */}
                <Link href="/invoices/create" className="group">
                    <Card className="h-full bg-gradient-to-br from-navy/30 to-navy/10 border-white/5 hover:border-secondary/50 transition-all cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-colors" />
                        <CardHeader>
                            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-4 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6" />
                            </div>
                            <CardTitle className="text-xl">Create Client Invoice</CardTitle>
                            <CardDescription>
                                Create a professional invoice to send to your clients.
                                <br />
                                Track payments, VAT, and generate PDFs.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-sm font-medium text-secondary mt-4 group-hover:translate-x-1 transition-transform">
                                Start Creation <ArrowRight className="w-4 h-4 ml-2" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Supplier Invoice - Upload */}
                <Link href="/invoices/upload" className="group">
                    <Card className="h-full bg-gradient-to-br from-onyx to-[#151515] border-white/5 hover:border-aero/50 transition-all cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-aero/5 rounded-full blur-3xl group-hover:bg-aero/10 transition-colors" />
                        <CardHeader>
                            <div className="w-12 h-12 bg-aero/10 rounded-xl flex items-center justify-center text-aero mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6" />
                            </div>
                            <CardTitle className="text-xl">Upload Supplier Invoice</CardTitle>
                            <CardDescription>
                                Upload a bill or receipt from a supplier.
                                <br />
                                AI will extract details and organize it for you.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-sm font-medium text-aero mt-4 group-hover:translate-x-1 transition-transform">
                                Upload File <ArrowRight className="w-4 h-4 ml-2" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

            </div>
        </div>
    )
}
