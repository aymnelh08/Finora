import { Sidebar } from "@/components/layout/sidebar";
import { AICopilot } from "@/components/copilot/chat-widget";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <Sidebar />
            <main className="flex-1 ml-64 overflow-y-auto bg-background relative">
                <div className="p-8 max-w-7xl mx-auto space-y-8">
                    {children}
                </div>
                <AICopilot />
            </main>
        </div>
    );
}
