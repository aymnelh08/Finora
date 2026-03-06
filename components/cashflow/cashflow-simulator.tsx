'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, TrendingUp, Users } from "lucide-react";

export function CashflowSimulator({ currentBalance }: { currentBalance: number }) {
    const [hiringCost, setHiringCost] = useState([0]);
    const [clientLoss, setClientLoss] = useState([0]);

    const projectedBalance = currentBalance - hiringCost[0] - clientLoss[0];

    return (
        <Card className="col-span-1 border-aero/20 bg-aero/5">
            <CardHeader>
                <CardTitle className="text-aero flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    What-If Simulator
                </CardTitle>
                <CardDescription>Simulate business decisions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <label className="text-sm font-medium text-white flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            Hire New Employee
                        </label>
                        <span className="text-sm font-mono text-red-400">-{hiringCost[0].toLocaleString()} MAD/mo</span>
                    </div>
                    <Slider
                        defaultValue={[0]}
                        max={20000}
                        step={1000}
                        value={hiringCost}
                        onValueChange={setHiringCost}
                        className="py-2"
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between">
                        <label className="text-sm font-medium text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-gray-400" />
                            Lost Major Client
                        </label>
                        <span className="text-sm font-mono text-red-400">-{clientLoss[0].toLocaleString()} MAD/mo</span>
                    </div>
                    <Slider
                        defaultValue={[0]}
                        max={50000}
                        step={5000}
                        value={clientLoss}
                        onValueChange={setClientLoss}
                        className="py-2"
                    />
                </div>

                <div className="bg-black/40 p-4 rounded-lg border border-white/5 space-y-2">
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Projected Impact</div>
                    <div className="text-2xl font-bold text-white">
                        {projectedBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="text-sm font-normal text-gray-500"> MAD</span>
                    </div>
                    <p className="text-xs text-gray-500">Projected Balance After Changes</p>
                </div>
            </CardContent>
        </Card>
    );
}
