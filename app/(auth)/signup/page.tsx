'use client';

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signUpAction } from "@/app/auth/actions";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";

function ButtonPending() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold h-12 text-lg transition-all active:scale-95 shadow-lg shadow-secondary/20"
            disabled={pending}
        >
            {pending ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
                <span className="flex items-center gap-2">
                    Start Your Journey <ArrowRight className="w-4 h-4" />
                </span>
            )}
        </Button>
    )
}

export default function SignupPage() {
    const [state, action] = useActionState(signUpAction, null);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI-powered financial management
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    Join Finora
                </h1>
                <p className="text-gray-400 text-lg">
                    Manage your business like a pro with next-gen tools.
                </p>
            </div>

            <form action={action} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-gray-300 ml-1">Full Name</Label>
                        <Input id="fullName" name="fullName" placeholder="Anis Berrada" required className="bg-white/5 border-white/10 text-white h-12 focus:ring-aero/50 focus:border-aero transition-all duration-300" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="businessName" className="text-gray-300 ml-1">Business Name</Label>
                        <Input id="businessName" name="businessName" placeholder="TechNova S.A.R.L" required className="bg-white/5 border-white/10 text-white h-12 focus:ring-aero/50 focus:border-aero transition-all duration-300" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300 ml-1">Work Email</Label>
                    <Input id="email" name="email" placeholder="anis@technova.ma" type="email" required className="bg-white/5 border-white/10 text-white h-12 focus:ring-aero/50 focus:border-aero transition-all duration-300" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300 ml-1">Password</Label>
                    <Input id="password" name="password" type="password" required className="bg-white/5 border-white/10 text-white h-12 focus:ring-aero/50 focus:border-aero transition-all duration-300" />
                    <p className="text-xs text-gray-500 ml-1">Secure and at least 8 characters.</p>
                </div>

                {state?.error && (
                    <div className="p-4 text-sm text-red-500 bg-red-500/10 rounded-xl border border-red-500/20 animate-in shake duration-500">
                        {state.error}
                    </div>
                )}
                {state?.success && (
                    <div className="p-4 text-sm text-green-500 bg-green-500/10 rounded-xl border border-green-500/20 animate-in fade-in duration-500">
                        {state.message}
                    </div>
                )}

                <ButtonPending />
            </form>

            <div className="pt-4 text-center text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-secondary font-semibold hover:text-secondary/80 transition-colors border-b border-secondary/20 hover:border-secondary">
                    Sign in here
                </Link>
            </div>
        </div>
    );
}
