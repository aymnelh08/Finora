'use server';

import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

export async function analyzeInvoiceAction(filePath: string) {
    const supabase = await createClient();

    // 1. Get Signed URL (valid for 1 hour)
    const { data, error } = await supabase.storage
        .from('invoices')
        .createSignedUrl(filePath, 3600);

    if (error || !data) {
        console.error("Storage Error:", error);
        return { error: "Could not access file from storage." };
    }

    const signedUrl = data.signedUrl;

    // 2. Call OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.warn("Missing OPENAI_API_KEY");
        return { error: "OpenAI API Key is not configured." };
    }

    const openai = new OpenAI({ apiKey });

    try {
        // Check if file is PDF or image
        const isPDF = filePath.toLowerCase().endsWith('.pdf');

        if (isPDF) {
            // For PDFs, we'll download and upload to OpenAI Files API
            const fileResponse = await fetch(signedUrl);
            const fileBlob = await fileResponse.blob();
            const file = new File([fileBlob], 'invoice.pdf', { type: 'application/pdf' });

            // Upload file to OpenAI
            const uploadedFile = await openai.files.create({
                file: file,
                purpose: 'assistants'
            });

            // Create an assistant with file search
            const assistant = await openai.beta.assistants.create({
                name: "Invoice Analyzer",
                instructions: `You are an expert invoice data extraction assistant. Extract the following fields from the invoice PDF:
                - supplier_name (string)
                - invoice_number (string)
                - date (YYYY-MM-DD)
                - due_date (YYYY-MM-DD, optional)
                - total_amount (number)
                - vat_amount (number)
                - currency (usually MAD, EUR, or USD)
                - line_items (array of { description, quantity, unit_price, total })
                
                Return ONLY valid JSON. No markdown or explanations.`,
                model: "gpt-4o",
                tools: [{ type: "file_search" }]
            });

            // Create a thread with the file
            const thread = await openai.beta.threads.create({
                messages: [
                    {
                        role: "user",
                        content: "Extract all invoice data from the attached PDF file.",
                        attachments: [
                            { file_id: uploadedFile.id, tools: [{ type: "file_search" }] }
                        ]
                    }
                ]
            });

            // Run the assistant
            const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
                assistant_id: assistant.id
            });

            // Get the response
            if (run.status === 'completed') {
                const messages = await openai.beta.threads.messages.list(thread.id);
                const lastMessage = messages.data[0];
                const content = lastMessage.content[0];

                if (content.type === 'text') {
                    const text = content.text.value;
                    // Try to parse JSON from the response
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const result = JSON.parse(jsonMatch[0]);

                        // Cleanup
                        await openai.files.delete(uploadedFile.id);
                        await openai.beta.assistants.delete(assistant.id);

                        return { success: true, data: result };
                    }
                }
            }

            // Cleanup on failure
            await openai.files.delete(uploadedFile.id);
            await openai.beta.assistants.delete(assistant.id);

            return { error: "Failed to extract data from PDF" };

        } else {
            // For images, use GPT-4o with vision (this works!)
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: `You are an expert OCR assistant for Finora. 
                      Extract the following fields from the invoice image:
                      - supplier_name (string)
                      - invoice_number (string)
                      - date (YYYY-MM-DD)
                      - due_date (YYYY-MM-DD, optional)
                      - total_amount (number)
                      - vat_amount (number)
                      - currency (usually MAD, EUR, or USD)
                      - line_items (array of { description, quantity, unit_price, total })
                      
                      Return ONLY valid JSON. No markdown.`
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Analyze this invoice image and extract all data." },
                            {
                                type: "image_url",
                                image_url: {
                                    url: signedUrl,
                                }
                            }
                        ]
                    }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            if (!content) return { error: "No content from AI" };

            const result = JSON.parse(content);
            return { success: true, data: result };
        }

    } catch (e: any) {
        console.error("OpenAI Error:", e);
        return { error: "AI Analysis failed: " + e.message };
    }
}

export async function saveInvoiceAction(invoiceData: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    try {
        // Insert invoice
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert({
                user_id: user.id,
                type: invoiceData.type || 'in',
                invoice_number: invoiceData.invoice_number,
                counterparty_id: invoiceData.counterparty_id || null,
                client_name: invoiceData.client_name || invoiceData.supplier_name,
                client_address: invoiceData.client_address || null,
                issue_date: invoiceData.date || invoiceData.issue_date,
                due_date: invoiceData.due_date,
                subtotal: invoiceData.subtotal || invoiceData.total_amount,
                vat_amount: invoiceData.vat_amount || 0,
                total_amount: parseFloat(invoiceData.total_amount) || 0,
                currency: invoiceData.currency || 'MAD',
                status: invoiceData.status || 'pending',
                notes: invoiceData.notes,
                file_path: invoiceData.file_path
            })
            .select()
            .single();

        if (invoiceError) {
            console.error("Invoice Insert Error:", invoiceError);
            return { error: invoiceError.message };
        }

        // Insert line items if provided
        if (invoiceData.line_items && invoiceData.line_items.length > 0) {
            console.log('Saving line items:', invoiceData.line_items);

            const items = invoiceData.line_items.map((item: any) => ({
                invoice_id: invoice.id,
                description: item.description,
                quantity: item.quantity || 1,
                unit_price: item.unit_price || 0
                // 'total' is a generated column - don't include it
            }));

            console.log('Mapped items for DB:', items);

            const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(items);

            if (itemsError) {
                console.error("Items Insert Error:", itemsError);
                // Continue anyway, invoice is saved
            } else {
                console.log('Line items saved successfully!');
            }
        } else {
            console.log('No line items to save');
        }

        return { success: true, invoiceId: invoice.id };

    } catch (e: any) {
        console.error("Save Invoice Error:", e);
        return { error: e.message };
    }
}
