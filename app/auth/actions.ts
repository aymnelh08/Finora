'use server';

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signUpAction(prevState: any, formData: FormData) {
    try {
        if (!formData || typeof formData.get !== 'function') {
            return { error: "Invalid form data" };
        }

        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const fullName = formData.get("fullName") as string;
        const businessName = formData.get("businessName") as string;

        const supabase = await createClient();
        const origin = (await headers()).get("origin");

        if (!email || !password) {
            return { error: "Email and password are required" };
        }

        const { error, data } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${origin}/auth/callback`,
                data: {
                    full_name: fullName,
                    business_name: businessName,
                },
            },
        });

        if (error) {
            console.error(error.code + " " + error.message);
            return { error: error.message };
        }

        return { success: true, message: "Check your email to continue." };
    } catch (error: any) {
        console.error("Signup Action Error:", error);
        if (error.code === 'ENOTFOUND' || (error.message && error.message.includes('fetch failed'))) {
            return { error: "Could not connect to Supabase. Please verify your NEXT_PUBLIC_SUPABASE_URL in .env.local" };
        }
        return { error: "Internal server error during signup" };
    }
}

export async function signInAction(prevState: any, formData: FormData) {
    try {
        if (!formData || typeof formData.get !== 'function') {
            return { error: "Invalid form data" };
        }

        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const supabase = await createClient();

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { error: error.message };
        }

        return redirect("/");
    } catch (error: any) {
        console.error("Signin Action Error:", error);
        if (error.code === 'ENOTFOUND' || (error.message && error.message.includes('fetch failed'))) {
            return { error: "Could not connect to Supabase. Check your project URL." };
        }
        // If it's a NEXT_REDIRECT, we should let it through
        if (error.message === 'NEXT_REDIRECT') throw error;

        return { error: "Internal server error during signin" };
    }
}

export async function signOutAction() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/login");
}
