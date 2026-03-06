'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    CreditCard,
    PieChart,
    TrendingUp,
    Settings,
    LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { label: 'Invoices', icon: FileText, href: '/invoices' },
    { label: 'Transactions', icon: CreditCard, href: '/transactions' },
    { label: 'Cashflow', icon: TrendingUp, href: '/cashflow' },
    { label: 'Reports', icon: PieChart, href: '/reports' },
    { label: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 border-r border-white/5 bg-onyx h-screen flex flex-col p-4 fixed left-0 top-0 z-50">
            <div className="mb-8 px-2 flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="w-8 h-8 bg-aero rounded-lg flex items-center justify-center shadow-lg shadow-aero/20">
                    <div className="w-4 h-4 bg-navy rounded-sm" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white">Finora</h1>
            </div>

            <nav className="space-y-1 flex-1">
                {sidebarItems.map((item, index) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative overflow-hidden",
                                isActive
                                    ? "bg-secondary/10 text-secondary"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary rounded-r-full" />
                            )}
                            <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-secondary" : "text-gray-400 group-hover:text-aero")} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="mt-auto border-t border-white/5 pt-4">
                <button className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-400 hover:text-red-400 w-full rounded-lg hover:bg-white/5 transition-colors">
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
