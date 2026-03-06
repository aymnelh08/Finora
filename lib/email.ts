import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvoiceEmail(to: string, invoiceId: string, downloadLink: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("Resend API Key missing. Skipping email.");
        return { success: false, error: "Missing API Key" };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Finora <invoices@yourdomain.com>',
            to: [to],
            subject: `New Invoice #${invoiceId} from Finora User`,
            html: `
            <div style="font-family: sans-serif; padding: 20px;">
                <h2>New Invoice Received</h2>
                <p>You have received a new invoice.</p>
                <a href="${downloadLink}" style="background: #00A36C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Invoice PDF</a>
                <br/><br/>
                <p>Or pay online here: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pay/${invoiceId}">Pay Online</a></p>
            </div>
            `
        });

        if (error) {
            console.error(error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (e: unknown) {
        return { success: false, error: (e as Error).message };
    }
}
