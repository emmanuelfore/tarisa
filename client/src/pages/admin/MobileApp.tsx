import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Download, QrCode, CheckCircle2, ShieldCheck, Terminal, Info } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";

export default function MobileApp() {
    const [expoUrl, setExpoUrl] = useState("exp://192.168.1.100:8081");
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(expoUrl)}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(expoUrl);
    };

    return (
        <AdminLayout>
            <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-heading font-bold text-gray-900 tracking-tight">Citizen Mobile App</h2>
                        <p className="text-gray-500 mt-1">Configure development access and manage citizen adoption.</p>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                        <Download className="mr-2 h-4 w-4" /> Download Promotional Kit
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: QR Code and Configuration */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-gray-200 shadow-sm overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <QrCode className="h-5 w-5 text-primary" />
                                    Expo Go Access
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 flex flex-col items-center text-center">
                                <div className="bg-white p-4 rounded-3xl shadow-xl border border-gray-100 mb-6 group hover:scale-105 transition-transform duration-300">
                                    <img
                                        src={qrUrl}
                                        alt="Expo QR Code"
                                        className="w-48 h-48"
                                    />
                                </div>

                                <div className="w-full space-y-4 text-left">
                                    <div className="space-y-2">
                                        <Label htmlFor="expo-url">Expo Development URL</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="expo-url"
                                                value={expoUrl}
                                                onChange={(e) => setExpoUrl(e.target.value)}
                                                placeholder="exp://192.168.1.100:8081"
                                                className="font-mono text-xs"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Button variant="outline" className="w-full" onClick={handleCopyLink}>
                                            Copy Link
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200 shadow-sm bg-blue-50 border-blue-100">
                            <CardContent className="p-4 flex gap-3">
                                <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                <div className="text-xs text-blue-700 leading-relaxed">
                                    <p className="font-bold mb-1">How to join:</p>
                                    <ol className="list-decimal list-inside space-y-1">
                                        <li>Install <strong>Expo Go</strong> from the App Store or Play Store.</li>
                                        <li>Ensure your phone is on the <strong>same Wi-Fi</strong>.</li>
                                        <li>Scan the QR code above using your camera or Expo Go app.</li>
                                    </ol>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: App Features & Setup Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-gray-200 shadow-sm">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-1">
                                    <Terminal className="h-4 w-4 text-gray-400" />
                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Development Environment</span>
                                </div>
                                <CardTitle className="text-xl">Mobile App Features</CardTitle>
                                <CardDescription>Key capabilities built into the citizen application</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { title: "Smart Reporting", desc: "Snap photos and detect location automatically." },
                                    { title: "Real-time Tracking", desc: "Get push notifications on resolution progress." },
                                    { title: "CivicCredits", desc: "Earn rewards for contributing to the city." },
                                    { title: "Offline Support", desc: "Queue reports even without active data." },
                                ].map((feature, i) => (
                                    <div key={i} className="flex gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-sm text-gray-900">{feature.title}</h4>
                                            <p className="text-xs text-gray-500">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200 shadow-sm bg-primary/5 border-primary/10">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2 text-primary">
                                    <Smartphone className="h-5 w-5" />
                                    Deployment Pipeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-primary/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                                            iOS
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">Apple TestFlight</h4>
                                            <p className="text-xs text-gray-500">Staging: 1.0.4-rc1</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase">Ready</span>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-primary/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs uppercase">
                                            AND
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">Play Console</h4>
                                            <p className="text-xs text-gray-500">Staging: 1.0.5-rc2</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase">Internal</span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 p-4 rounded-xl border border-dotted border-gray-300">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Development Access Protocol • Secure Local Tunneling • Expo SDK 54.0.31</span>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
