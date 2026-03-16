import { motion } from "framer-motion";
import {
  Shield,
  CheckCircle2,
  BarChart2,
  MapPin,
  ArrowRight,
  Users,
  Cpu,
  Globe,
  MessageCircle,
  Clock,
  Download,
  Smartphone,
  ExternalLink,
  Zap,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const [downloadUrl, setDownloadUrl] = useState("");

  useEffect(() => {
    setDownloadUrl(`${window.location.origin}/api/download/apk`);
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-[#1a1a1b] font-sans selection:bg-orange-600/10">
      {/* Premium Glass Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100/50 h-20 flex items-center transition-all duration-300">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 group">
            <div className="relative overflow-hidden rounded-xl">
               <img src="/assets/logo_new.png" className="h-10 w-auto object-contain" alt="Tarisa Logo" />
            </div>
            <span className="text-xl font-black tracking-tighter text-[#0a1b3d] group-hover:text-orange-600 transition-colors uppercase">TARISA</span>
          </div>

          <div className="hidden lg:flex gap-10 items-center">
            <nav className="flex gap-10 text-sm font-bold text-gray-400">
              <a href="#solutions" className="hover:text-orange-600 transition-colors uppercase tracking-widest text-[11px]">Solutions</a>
              <a href="#accountability" className="hover:text-orange-600 transition-colors uppercase tracking-widest text-[11px]">Accountability</a>
              <a href="#community" className="hover:text-orange-600 transition-colors uppercase tracking-widest text-[11px]">Community</a>
            </nav>
            <div className="flex items-center gap-6 pl-6 border-l border-gray-100">
              <Link href="/login">
                <Button variant="ghost" className="font-black text-gray-500 hover:text-orange-600 hover:bg-orange-50/50 uppercase tracking-widest text-[10px]">
                  Portal Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-[#0a1b3d] hover:bg-orange-600 text-white px-8 font-black uppercase tracking-widest text-[10px] h-11 rounded-full shadow-lg shadow-orange-200/20 transition-all active:scale-95">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Dynamic Hero Section */}
        <section className="relative py-24 lg:py-40 overflow-hidden bg-white">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-50/30 to-transparent -z-10" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
          
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-10 relative z-10"
              >
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100/50">
                  <Zap className="w-3 h-3 text-orange-600 fill-orange-600" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-700">Next-Gen Civic Platform</span>
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-6xl lg:text-[84px] font-black text-[#0a1b3d] leading-[0.95] tracking-tight">
                  Modern Citizen <br />
                  <span className="text-orange-600">Accountability.</span>
                </motion.h1>

                <motion.p variants={itemVariants} className="text-xl text-gray-400 max-w-lg leading-relaxed font-medium">
                  The unified platform for reporting, resolving, and reconciling civic infrastructure. Built for transparency, speed, and trusted communities.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-wrap gap-5 pt-4">
                  <Link href="/signup">
                    <Button size="lg" className="h-16 px-12 text-base bg-orange-600 hover:bg-orange-700 shadow-2xl shadow-orange-200/50 font-black rounded-2xl transition-all hover:-translate-y-1">
                      Launch Resident Portal
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="h-16 px-12 text-base border-gray-200 text-gray-700 font-bold hover:bg-gray-50 rounded-2xl border-2">
                    Request Agency Demo
                  </Button>
                </motion.div>

                <motion.div variants={itemVariants} className="flex gap-16 pt-12 border-t border-gray-100">
                  <StatItem value="L1-L4" label="Escalation Logic" />
                  <StatItem value="100%" label="Audit Trails" />
                  <StatItem value="24/7" label="Geo-Synching" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-20 bg-orange-100/40 rounded-full blur-[120px] -z-10 animate-pulse" />
                <div className="relative rounded-[48px] overflow-hidden shadow-2xl border-[12px] border-white/80 backdrop-blur-sm group">
                  <img
                    src="/assets/hero.png"
                    alt="Citizen Engagement"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1b3d]/20 to-transparent" />
                </div>

                {/* Glass Float Card */}
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-10 -left-10 p-8 bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-[0_32px_64px_-16px_rgba(234,88,12,0.15)] border border-white max-w-[280px]"
                >
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Response Time</div>
                      <div className="text-2xl font-black text-[#0a1b3d]">Under 12h</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "94.8%" }}
                        transition={{ duration: 2, delay: 1 }}
                        className="h-full bg-orange-600" 
                      />
                    </div>
                    <div className="text-[11px] font-black text-orange-600 uppercase flex justify-between tracking-tight">
                      <span>Service Level Met</span>
                      <span>94.8%</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Accountability Solutions (Bento Grid Style) */}
        <section id="solutions" className="py-32 bg-gray-50/50 relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-orange-600 font-black uppercase tracking-[0.3em] text-xs"
              >
                Core Capabilities
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-5xl lg:text-6xl font-black text-[#0a1b3d]"
              >
                A Seamless Ecosystem <br /> for Better Cities.
              </motion.h2>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              <SolutionCard
                icon={<MapPin className="w-8 h-8 text-white" />}
                gradient="from-orange-500 to-orange-700"
                title="Infrastructure Tracking"
                description="Precise geo-tagged reporting for potholes, sewage, and water leaks. Real-time visual heatmaps for decision makers."
              />
              <SolutionCard
                icon={<BarChart2 className="w-8 h-8 text-white" />}
                gradient="from-[#0a1b3d] to-[#142d5c]"
                title="SLA Management"
                description="Advanced L1-L4 automated escalation ensures no report is left unanswered. Total audit traceability for every action."
              />
              <SolutionCard
                icon={<Globe className="w-8 h-8 text-white" />}
                gradient="from-amber-400 to-orange-500"
                title="Civic Engagement"
                description="Tokenized incentive economy. Residents earn CivicCredits for reporting and verifying issues, building ownership."
              />
            </div>
          </div>
        </section>

        {/* Modern Strategic Features */}
        <section id="accountability" className="py-40 overflow-hidden bg-white">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-32 items-center">
              <div className="space-y-16">
                <div className="space-y-6">
                  <h2 className="text-5xl lg:text-6xl font-black text-[#0a1b3d] leading-[1.05]">Closing the gap between <br /> <span className="text-orange-600 italic">Policy and Life.</span></h2>
                  <p className="text-gray-400 text-xl leading-relaxed font-medium">
                    Tarisa is more than a reporting tool—it's a feedback loop that ensures government promises are met with physical results.
                  </p>
                </div>

                <div className="space-y-12">
                  <FeatureRow
                    icon={<Users className="w-6 h-6" />}
                    title="Resident Verified Resolutions"
                    description="Issues can only be marked as 'Resolved' once verified by residents or field officers with visual 4K photo proof."
                  />
                  <FeatureRow
                    icon={<Cpu className="w-6 h-6" />}
                    title="Automated Routing Logic"
                    description="Reports are instantly assigned to the correct jurisdictional department based on AI categorization and geo-data."
                  />
                  <FeatureRow
                    icon={<MessageCircle className="w-6 h-6" />}
                    title="Direct Notification Layer"
                    description="Keep citizens informed with real-time push alerts about maintenance schedules, emergencies, and city broadcasts."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 relative">
                <div className="space-y-8">
                  <div className="h-80 rounded-[40px] bg-orange-50 border border-orange-100 p-10 flex flex-col justify-end shadow-soft relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 transform group-hover:rotate-12 transition-transform">
                      <Users className="w-16 h-16 text-orange-200" />
                    </div>
                    <div className="text-5xl font-black text-orange-600">12k+</div>
                    <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-3">Active Reporters</div>
                  </div>
                  <div className="h-56 bg-[#0a1b3d] rounded-[40px] p-10 flex flex-col justify-between text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mb-16 -mr-16" />
                    <BarChart2 className="w-12 h-12 text-orange-500 opacity-80" />
                    <div className="font-bold">Transparency Score <br /> <span className="text-3xl font-black leading-none text-orange-500">9.8/10</span></div>
                  </div>
                </div>
                <div className="space-y-8 pt-16">
                  <div className="h-56 bg-white border border-gray-100 rounded-[40px] p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col justify-between group hover:border-orange-200 transition-colors">
                    <Shield className="w-12 h-12 text-orange-600 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-[#0a1b3d]">AES-256 <br /> <span className="text-[10px] uppercase text-gray-400 font-black tracking-widest">Enterprise Security</span></div>
                  </div>
                  <div className="h-80 rounded-[40px] bg-orange-600 p-10 flex flex-col justify-end shadow-2xl relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-110 transition-transform" />
                    <div className="text-5xl font-black text-white">ZIM</div>
                    <div className="text-[11px] font-black text-orange-100/60 uppercase tracking-widest mt-3">Core Deployment</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Modern CTA */}
        <section className="py-32 bg-white">
          <div className="container mx-auto px-6">
            <div className="relative rounded-[4rem] bg-[#0a1b3d] overflow-hidden px-16 py-32 text-center text-white shadow-[0_48px_80px_-20px_rgba(10,27,61,0.3)]">
              <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(234,88,12,0.4)_0%,transparent_60%)]" />
              </div>
              <div className="relative z-10 max-w-4xl mx-auto space-y-12">
                <h2 className="text-5xl lg:text-7xl font-black leading-[0.9] tracking-tighter">Ready to transform your jurisdictional accountability?</h2>
                <p className="text-2xl text-orange-100/50 font-medium max-w-2xl mx-auto">Join over 100+ departments leveraging Tarisa to deliver world-class service to their residents.</p>
                <div className="flex flex-wrap justify-center gap-8 pt-6">
                  <Link href="/signup">
                    <Button size="lg" className="h-20 px-16 text-lg font-black bg-orange-600 text-white hover:bg-orange-700 shadow-2xl shadow-orange-900/40 uppercase tracking-widest rounded-2xl transition-all active:scale-95">
                      Register as Citizen
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="h-20 px-16 text-lg font-black border-white/10 text-white hover:bg-white/5 uppercase tracking-widest rounded-2xl transition-all">
                      Official Access
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Download Section (Redefined) */}
        <section id="download" className="py-40 bg-gray-50/30">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-32 items-center">
              <div className="space-y-10">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-[0.2em] border border-orange-100 shadow-sm">
                  <Smartphone className="w-4 h-4" />
                  Mobile Accessibility
                </div>
                <h2 className="text-5xl lg:text-7xl font-black text-[#0a1b3d] leading-[0.95] tracking-tight">
                  The Power of <br />
                  <span className="text-orange-600 italic">Pocket Tarisa.</span>
                </h2>
                <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-lg">
                  Report infrastructure issues instantly from the field. Our mobile application allows for real-time reporting with high-resolution photo proof and geo-tagging.
                </p>
                <div className="flex flex-wrap gap-6 pt-6">
                   <a href="/api/download/apk" download="tarisa-app.apk">
                    <Button size="lg" className="h-16 px-10 text-sm bg-orange-600 shadow-orange-200/50 hover:bg-orange-700 text-white shadow-2xl font-black uppercase tracking-[0.15em] rounded-2xl gap-3">
                      <Download className="w-6 h-6" />
                      Download APK
                    </Button>
                  </a>
                  <Link href="/download">
                    <Button size="lg" variant="outline" className="h-16 px-10 text-sm border-2 border-gray-200 text-[#0a1b3d] font-black hover:bg-white rounded-2xl uppercase tracking-[0.15em] gap-3">
                      <QRCodeSVG value={downloadUrl} size={20} />
                      Scan QR Code
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-10 bg-orange-600/5 rounded-[64px] blur-3xl" />
                <Card className="relative border-none bg-white rounded-[48px] shadow-2xl overflow-hidden p-12 flex flex-col md:row items-center gap-12 group hover:shadow-orange-200/20 transition-all duration-500">
                  <div className="bg-gray-50 p-6 rounded-[32px] shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                    {downloadUrl ? (
                      <QRCodeSVG value={downloadUrl} size={180} level="H" includeMargin={true} fgColor="#0a1b3d" />
                    ) : (
                      <div className="w-[180px] h-[180px] bg-gray-100 animate-pulse rounded-2xl" />
                    )}
                  </div>
                  <div className="space-y-4 text-center md:text-left">
                    <div className="inline-block px-3 py-1 rounded-md bg-orange-50 text-orange-600 text-[10px] font-black uppercase">Instant Setup</div>
                    <div className="text-3xl font-black text-[#0a1b3d]">Direct Sync</div>
                    <p className="text-gray-400 font-medium leading-relaxed">Scan the high-density code to securely download the current Tarisa build for your Android device.</p>
                    <div className="flex items-center gap-2 text-orange-600 font-black text-xs uppercase tracking-widest pt-2">
                       <ExternalLink size={14} />
                       Official Release v1.02
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-32 border-t border-gray-100 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-20 mb-32">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                 <img src="/assets/logo_new.png" className="h-8 w-auto" alt="Tarisa Logo" />
                <span className="text-2xl font-black tracking-tighter text-[#0a1b3d]">TARISA</span>
              </div>
              <p className="text-gray-400 font-medium leading-relaxed">
                Empowering government. <br />
                Connecting citizens. <br />
                Building trust through results.
              </p>
              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-orange-600 transition-colors cursor-pointer">
                    <Globe size={18} />
                 </div>
                 <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-orange-600 transition-colors cursor-pointer">
                    <MessageCircle size={18} />
                 </div>
              </div>
            </div>
            <FooterCol
              title="Solutions"
              links={['Infrastructure Reporting', 'Departmental Escalation', 'Civic Credit Economy', 'Urban Heatmaps']}
            />
            <FooterCol
              title="Agency"
              links={['Integration Guide', 'Developer API', 'Security Compliance', 'Case Studies']}
            />
            <FooterCol
              title="Official"
              links={['Privacy Policy', 'Terms of Service', 'Government Partnership', 'Press Identity']}
            />
          </div>
          <div className="pt-16 border-t border-gray-100 flex flex-col md:row justify-between items-center gap-8">
            <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">© 2026 Tarisa Civic Infrastructure. Unified Accountability System.</div>
            <div className="flex gap-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
               <a href="#" className="hover:text-orange-600 transition-colors">Sitemap</a>
               <a href="#" className="hover:text-orange-600 transition-colors">Status</a>
               <a href="#" className="hover:text-orange-600 transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <div>
      <div className="text-3xl font-black text-[#0a1b3d] tracking-tighter mb-1">{value}</div>
      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{label}</div>
    </div>
  );
}

function SolutionCard({ icon, gradient, title, description }: { icon: React.ReactNode, gradient: string, title: string, description: string }) {
  return (
    <Card className="border-none bg-white rounded-[40px] overflow-hidden shadow-soft hover:shadow-2xl hover:shadow-orange-100/50 transition-all duration-500 p-10 group relative border border-gray-50 hover:border-orange-100">
      <CardContent className="p-0 space-y-10 relative z-10">
        <div className={`p-5 rounded-3xl bg-gradient-to-br ${gradient} w-fit shadow-xl group-hover:scale-110 transition-transform duration-500`}>
          {icon}
        </div>
        <div className="space-y-4">
          <h3 className="text-3xl font-black text-[#0a1b3d] leading-tight group-hover:text-orange-600 transition-colors">{title}</h3>
          <p className="text-gray-400 font-medium leading-relaxed italic line-clamp-3">{description}</p>
        </div>
        <div className="pt-4">
           <div className="flex items-center gap-2 text-xs font-black text-orange-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all group-hover:translate-y-0 translate-y-2">
              Learn More <ArrowRight size={14} />
           </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureRow({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex gap-8 group">
      <div className="mt-1 p-4 rounded-2xl bg-gray-50 text-gray-300 group-hover:bg-orange-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-200 transition-all h-fit">
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className="text-2xl font-black text-[#0a1b3d] group-hover:text-orange-600 transition-colors tracking-tight">{title}</h4>
        <p className="text-gray-400 text-base font-medium leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FooterCol({ title, links }: { title: string, links: string[] }) {
  return (
    <div className="space-y-8">
      <h5 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.4em]">{title}</h5>
      <ul className="space-y-4">
        {links.map(link => (
          <li key={link}>
            <a href="#" className="text-sm font-bold text-gray-400 hover:text-orange-600 transition-colors flex items-center justify-between group">
              {link}
              <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
