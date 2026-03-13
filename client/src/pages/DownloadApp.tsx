import { motion } from "framer-motion";
import { Shield, Download, ArrowLeft, Smartphone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

export default function DownloadApp() {
  const [downloadUrl, setDownloadUrl] = useState("");

  useEffect(() => {
    // Construct the full URL for the APK download
    const origin = window.location.origin;
    setDownloadUrl(`${origin}/api/download/apk`);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-[#1a1a1b] font-sans selection:bg-primary/20">
      {/* Simple Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-[#0a1b3d]">
                TARISA
              </span>
            </div>
          </Link>
          
          <Link href="/">
            <Button variant="ghost" className="gap-2 font-bold text-gray-600 hover:bg-gray-50 uppercase tracking-wider text-xs">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center mb-16 space-y-6"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-primary text-xs font-black uppercase tracking-widest border border-blue-100">
              <Smartphone className="w-4 h-4" />
              Official Mobile Application
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-4xl lg:text-6xl font-black text-[#0a1b3d] leading-tight">
              Take Tarisa <span className="text-primary">Everywhere.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
              Report issues, track resolutions, and engage with your community directly from your pocket.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* QR Code Section */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <Card className="border-none bg-white rounded-[40px] shadow-elevated overflow-hidden p-10 text-center">
                <CardContent className="p-0 space-y-8">
                  <div className="bg-gray-50 p-6 rounded-[32px] inline-block shadow-inner">
                    {downloadUrl ? (
                      <QRCodeSVG 
                        value={downloadUrl} 
                        size={240}
                        level="H"
                        includeMargin={true}
                        className="mx-auto"
                      />
                    ) : (
                      <div className="w-[240px] h-[240px] bg-gray-100 rounded-2xl animate-pulse" />
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-[#0a1b3d]">Scan to Download</h3>
                    <p className="text-gray-400 font-medium italic">
                      Point your phone camera at this QR code to download the Android APK directly.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Manual Download & Instructions */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-3xl font-black text-[#0a1b3d]">Direct Download</h2>
                <p className="text-gray-500 font-medium">
                  If scanning doesn't work, you can download the application manually using the button below.
                </p>
                <a href="/api/download/apk" download="tarisa-app.apk" className="block">
                  <Button size="lg" className="w-full h-16 text-base bg-primary hover:bg-blue-700 shadow-xl shadow-blue-200 font-black uppercase tracking-wider gap-3">
                    <Download className="w-6 h-6" />
                    Download APK File
                  </Button>
                </a>
              </div>

              <div className="pt-8 border-t border-gray-100 space-y-6">
                <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Installation Guide</h4>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <div className="mt-1 w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                      Open the downloaded <span className="text-[#0a1b3d] font-bold">.apk</span> file on your Android device.
                    </p>
                  </li>
                  <li className="flex gap-4">
                    <div className="mt-1 w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                      If prompted, enable <span className="text-[#0a1b3d] font-bold">"Install from unknown sources"</span> in your device settings.
                    </p>
                  </li>
                  <li className="flex gap-4">
                    <div className="mt-1 w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                      Follow the on-screen instructions to complete the installation.
                    </p>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-gray-100 bg-white text-center">
        <div className="container mx-auto px-6">
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest">
            © 2026 Tarisa Civic Infrastructure. Secure Android Package.
          </p>
        </div>
      </footer>
    </div>
  );
}
