'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, CreditCard, LogOut, Upload, Image as ImageIcon } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import { updateLogoAction, updateProfileAction } from "./actions";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function SettingsPage() {
    const [uploading, setUploading] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [fullName, setFullName] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function loadProfile() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setLogoUrl(profile.logo_url);
                setFullName(profile.full_name || "");
                setBusinessName(profile.business_name || "");
            }
        }
        loadProfile();
    }, []);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('logo', file);

        const result = await updateLogoAction(formData);
        setUploading(false);

        if (result.error) {
            toast.error("Error: " + result.error);
        } else {
            setLogoUrl(result.logoUrl!);
            toast.success("Logo uploaded successfully!");
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        const formData = new FormData();
        formData.append('fullName', fullName);
        formData.append('businessName', businessName);

        const result = await updateProfileAction(formData);
        setSaving(false);

        if (result.error) {
            toast.error("Error: " + result.error);
        } else {
            toast.success("Profile updated!");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
                <p className="text-gray-400 mt-1">Manage your account and subscription.</p>
            </div>

            <div className="space-y-6">
                {/* Logo Upload */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-secondary" />
                            Business Logo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            {logoUrl ? (
                                <div className="w-24 h-24 rounded-lg border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center">
                                    <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                                </div>
                            ) : (
                                <div className="w-24 h-24 rounded-lg border border-dashed border-white/20 bg-white/5 flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-gray-600" />
                                </div>
                            )}
                            <div className="flex-1">
                                <Label htmlFor="logo-upload" className="cursor-pointer">
                                    <Button asChild variant="outline" disabled={uploading}>
                                        <span>
                                            <Upload className="w-4 h-4 mr-2" />
                                            {uploading ? "Uploading..." : "Upload Logo"}
                                        </span>
                                    </Button>
                                </Label>
                                <Input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleLogoUpload}
                                />
                                <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 2MB. Will appear on invoices.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-secondary" />
                            Profile Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="bg-white/5"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Business Name</Label>
                                <Input
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    className="bg-white/5"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="bg-secondary hover:bg-secondary/90 text-white"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Subscription */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-aero" />
                            Subscription Plan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-navy to-[#00153a] rounded-lg border border-white/10">
                            <div>
                                <div className="font-bold text-white text-lg">Pro Plan</div>
                                <div className="text-sm text-gray-400">Next billing on Feb 28, 2026</div>
                            </div>
                            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Manage</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-red-900/20 bg-red-900/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-400">
                            <LogOut className="w-5 h-5" />
                            Account Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={signOutAction}>
                            <Button variant="destructive" className="w-full">Sign Out</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
