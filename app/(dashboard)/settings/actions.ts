'use server';

import { createClient } from "@/utils/supabase/server";

export async function updateLogoAction(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const file = formData.get('logo') as File;
    if (!file) return { error: "No file provided" };

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/logo.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { upsert: true });

    if (uploadError) {
        console.error("Upload error:", uploadError);
        return { error: uploadError.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

    // Update profile
    const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            logo_url: publicUrl,
            updated_at: new Date().toISOString()
        });

    if (updateError) {
        console.error("Profile update error:", updateError);
        return { error: updateError.message };
    }

    return { success: true, logoUrl: publicUrl };
}

export async function updateProfileAction(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const fullName = formData.get('fullName') as string;
    const businessName = formData.get('businessName') as string;

    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            full_name: fullName,
            business_name: businessName,
            updated_at: new Date().toISOString()
        });

    if (error) return { error: error.message };

    return { success: true };
}
