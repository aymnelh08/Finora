import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left: Branding & Visuals */}
            <div className="hidden lg:flex flex-col justify-between bg-navy/5 p-12 relative overflow-hidden">
                {/* Background Gradients/Effects */}
                <div className="absolute top-0 left-0 w-full h-full bg-navy/95 z-0" />
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl z-0 pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-aero/10 rounded-full blur-3xl z-0 pointer-events-none" />

                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-aero rounded-xl flex items-center justify-center shadow-lg shadow-aero/20">
                        <div className="w-5 h-5 bg-navy rounded-sm" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Finora</h1>
                </div>

                <div className="relative z-10 space-y-6">
                    <blockquote className="space-y-2">
                        <p className="text-2xl font-medium text-white leading-relaxed">
                            "Finora has completely transformed how we manage our cashflow. It feels like having a CFO in our pocket."
                        </p>
                        <footer className="text-aero text-lg">— Sarah Benjelloun, CEO of Atlas Design</footer>
                    </blockquote>
                </div>

                <div className="relative z-10 flex justify-between text-sm text-gray-400">
                    <p>© 2026 Finora Inc.</p>
                    <div className="space-x-4">
                        <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                    </div>
                </div>
            </div>

            {/* Right: Form */}
            <div className="flex flex-col items-center justify-center p-8 bg-background relative">
                <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
                    <div className="w-8 h-8 bg-aero rounded-lg flex items-center justify-center">
                        <div className="w-4 h-4 bg-navy rounded-sm" />
                    </div>
                    <span className="font-bold text-lg text-white">Finora</span>
                </div>

                <div className="w-full max-w-md space-y-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
