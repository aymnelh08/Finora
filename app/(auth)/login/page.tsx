'use client';

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signInAction } from "@/app/auth/actions";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, ArrowRight } from "lucide-react";

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
                    Sign In <ArrowRight className="w-4 h-4" />
                </span>
            )}
        </Button>
    )
}

export default function LoginPage() {
    const [state, action] = useActionState(signInAction, null);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="space-y-3">
                <h1 className="text-4xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    Welcome back
                </h1>
                <p className="text-gray-400 text-lg">
                    Enter your credentials to access your financial dashboard
                </p>
            </div>

            <form action={action} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300 ml-1">Work Email</Label>
                        <Input
                            id="email"
                            name="email"
                            placeholder="name@company.ma"
                            type="email"
                            required
                            className="bg-white/5 border-white/10 text-white h-12 px-4 focus:ring-aero/50 focus:border-aero transition-all duration-300"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <Label htmlFor="password" className="text-gray-300">Password</Label>
                            <Link href="#" className="text-sm text-secondary hover:text-secondary/80 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="bg-white/5 border-white/10 text-white h-12 px-4 focus:ring-aero/50 focus:border-aero transition-all duration-300"
                        />
                    </div>
                </div>

                {state?.error && (
                    <div className="p-4 text-sm text-red-500 bg-red-500/10 rounded-xl border border-red-500/20 animate-in shake duration-500">
                        {state.error}
                    </div>
                )}

                <ButtonPending />
            </form>

            <div className="pt-4 text-center text-gray-400">
                New to Finora?{" "}
                <Link href="/signup" className="text-secondary font-semibold hover:text-secondary/80 transition-colors border-b border-secondary/20 hover:border-secondary">
                    Create an account
                </Link>
            </div>
        </div>
    );
}
