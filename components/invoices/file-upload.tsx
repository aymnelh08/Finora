'use client';

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

interface FileUploadProps {
    onUploadComplete: (path: string) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = async (selectedFile: File) => {
        // Validate type
        if (!selectedFile.type.includes('pdf') && !selectedFile.type.includes('image')) {
            alert('Please upload a PDF or Image (JPEG/PNG)');
            return;
        }
        setFile(selectedFile);
        await uploadFile(selectedFile);
    };

    const uploadFile = async (fileToUpload: File) => {
        setUploading(true);
        const supabase = createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            alert('Please log in to upload files.');
            setUploading(false);
            setFile(null);
            return;
        }

        const fileExt = fileToUpload.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        // Upload to user-specific folder: {user_id}/{filename}
        const filePath = `${user.id}/${fileName}`;

        // Upload to 'invoices' bucket
        const { error: uploadError } = await supabase.storage
            .from('invoices')
            .upload(filePath, fileToUpload);

        if (uploadError) {
            console.error('Upload error:', uploadError);
            alert(`Failed to upload file: ${uploadError.message}`);
            setUploading(false);
            setFile(null);
            return;
        }

        // Get public URL (or just path to pass to server action to sign)
        // For OCR, we need the server to access it. 
        // We'll pass the filePath to the parent.
        onUploadComplete(filePath);
        setUploading(false);
    };

    if (file && !uploading) {
        return (
            <div className="w-full p-8 border border-white/10 rounded-xl bg-white/5 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in">
                <div className="w-16 h-16 bg-jade/10 text-jade rounded-full flex items-center justify-center mb-2">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-white font-medium">{file.name}</h3>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button variant="ghost" onClick={() => setFile(null)} className="text-gray-400 hover:text-white">
                    Remove & Upload Another
                </Button>
            </div>
        )
    }

    return (
        <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "w-full h-80 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group relative overflow-hidden",
                isDragging ? "border-secondary bg-secondary/5" : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
            )}
        >
            <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                accept="image/*,application/pdf"
            />

            {uploading ? (
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-secondary animate-spin" />
                    <p className="text-gray-400 animate-pulse">Uploading securely...</p>
                </div>
            ) : (
                <>
                    <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                        <Upload className={cn("w-8 h-8 transition-colors", isDragging ? "text-secondary" : "text-gray-400 group-hover:text-white")} />
                    </div>

                    <h3 className="text-lg font-medium text-white mb-2">
                        {isDragging ? "Drop file here" : "Click to upload or drag and drop"}
                    </h3>
                    <p className="text-sm text-gray-500 max-w-xs text-center">
                        PDF, PNG, JPG or WEBP (max. 10MB)
                    </p>
                </>
            )}
        </div>
    );
}
