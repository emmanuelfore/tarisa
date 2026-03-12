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
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-[#1a1a1b] font-sans selection:bg-primary/20">
      {/* Professional Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-[#0a1b3d]">
              TARISA
            </span>
          </div>
          
          <div className="hidden lg:flex gap-10 items-center">
            <nav className="flex gap-8 text-sm font-semibold text-gray-500">
              <a href="#solutions" className="hover:text-primary transition-colors">Solutions</a>
              <a href="#accountability" className="hover:text-primary transition-colors">Accountability</a>
              <a href="#community" className="hover:text-primary transition-colors">Community</a>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="font-bold text-gray-600 hover:bg-gray-50 uppercase tracking-wider text-xs">
                  Portal Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-[#0a1b3d] hover:bg-[#142d5c] text-white px-6 font-bold uppercase tracking-wider text-xs h-11">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Trust Hero Section */}
        <section className="relative py-24 lg:py-32 overflow-hidden bg-white">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-8 relative z-10"
              >
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-primary text-xs font-black uppercase tracking-widest border border-blue-100">
                  <CheckCircle2 className="w-4 h-4" />
                  Government-Grade Solutions
                </motion.div>
                
                <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-black text-[#0a1b3d] leading-[1.1] tracking-tight">
                  Modern Citizen <br />
                  <span className="text-primary italic">Accountability.</span>
                </motion.h1>
                
                <motion.p variants={itemVariants} className="text-xl text-gray-500 max-w-lg leading-relaxed font-medium">
                  The unified platform for reporting, resolving, and reconciling civic infrastructure. Built for transparency, speed, and trusted communities.
                </motion.p>
                
                <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-4">
                  <Link href="/signup">
                    <Button size="lg" className="h-14 px-10 text-base bg-primary hover:bg-blue-700 shadow-xl shadow-blue-200 font-bold">
                      Launch Resident Portal
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="h-14 px-10 text-base border-gray-200 text-gray-700 font-bold hover:bg-gray-50">
                    Request Agency Demo
                  </Button>
                </motion.div>

                <motion.div variants={itemVariants} className="flex gap-12 pt-10 border-t border-gray-100">
                  <div>
                    <div className="text-2xl font-black text-[#0a1b3d]">L1-L4</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Escalation Logic</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-[#0a1b3d]">100%</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Audit Trails</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-[#0a1b3d]">24/7</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Geo-Synching</div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative"
              >
                <div className="absolute -inset-10 bg-blue-50/50 rounded-full blur-3xl -z-10" />
                <div className="rounded-[40px] overflow-hidden shadow-elevated border-8 border-white">
                  <img 
                    src="/assets/hero.png" 
                    alt="Citizen Engagement" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                {/* Float Card */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-8 -left-8 p-6 bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-[260px]"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-black text-gray-400 mb-0.5">Response Time</div>
                      <div className="text-lg font-black text-[#0a1b3d]">Under 12h</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[94%]" />
                    </div>
                    <div className="text-[10px] font-bold text-green-600 uppercase flex justify-between">
                      <span>Service Level Met</span>
                      <span>94.8%</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Accountability Solutions */}
        <section id="solutions" className="py-24 bg-gray-50/50">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
              <h2 className="text-4xl lg:text-5xl font-black text-[#0a1b3d]">A Seamless Ecosystem for Better Cities.</h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed">
                From water leaks to legislative engagement, Tarisa provides the digital infrastructure required to manage modern government at scale.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <SolutionCard 
                icon={<MapPin className="w-8 h-8 text-white" />}
                bg="bg-primary"
                title="Infrastructure Tracking"
                description="Precise geo-tagged reporting for potholes, sewage, and water leaks. Real-time visual heatmaps for decision makers."
              />
              <SolutionCard 
                icon={<BarChart2 className="w-8 h-8 text-white" />}
                bg="bg-[#0a1b3d]"
                title="SLA Management"
                description="Advanced L1-L4 automated escalation ensures no report is left unanswered. Total audit traceability for every action."
              />
              <SolutionCard 
                icon={<Globe className="w-8 h-8 text-white" />}
                bg="bg-cyan-600"
                title="Civic Engagement"
                description="Tokenized incentive economy. Residents earn CivicCredits for reporting and verifying issues, building a massive culture of ownership."
              />
            </div>
          </div>
        </section>

        {/* Strategic Features */}
        <section id="accountability" className="py-24 overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-12">
                <div className="space-y-4">
                  <h2 className="text-4xl lg:text-5xl font-black text-[#0a1b3d] leading-tight">Closing the gap between <br /> Policy and Life.</h2>
                  <p className="text-gray-500 text-lg leading-relaxed">
                    Tarisa is more than a reporting tool—it's a feedback loop that ensures government promises are met with physical results.
                  </p>
                </div>

                <div className="space-y-8">
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

              <div className="grid grid-cols-2 gap-6 relative">
                 <div className="space-y-6">
                   <div className="h-64 rounded-[32px] bg-blue-50 border border-blue-100 p-8 flex flex-col justify-end shadow-soft">
                      <div className="text-4xl font-black text-primary">12k+</div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Active Reporters</div>
                   </div>
                   <div className="h-48 bg-[#0a1b3d] rounded-[32px] p-8 flex flex-col justify-between text-white shadow-elevated">
                      <BarChart2 className="w-10 h-10 opacity-40" />
                      <div className="font-bold">Transparency Score <br /> <span className="text-2xl font-black leading-none">9.8/10</span></div>
                   </div>
                 </div>
                 <div className="space-y-6 pt-12">
                   <div className="h-48 bg-white border border-gray-100 rounded-[32px] p-8 shadow-soft flex flex-col justify-between">
                      <Shield className="w-10 h-10 text-primary opacity-20" />
                      <div className="font-bold text-[#0a1b3d]">AES-256 <br /> <span className="text-xs uppercase text-gray-400">Security Layer</span></div>
                   </div>
                   <div className="h-64 rounded-[32px] bg-cyan-50 border border-cyan-100 p-8 flex flex-col justify-end shadow-soft">
                      <div className="text-4xl font-black text-cyan-600">Zimbabwe</div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Core Deployment</div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Container */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="relative rounded-[3rem] bg-[#0a1b3d] overflow-hidden px-12 py-20 text-center text-white shadow-elevated">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,white_0%,transparent_50%)]" />
              </div>
              <div className="relative z-10 max-w-3xl mx-auto space-y-10">
                <h2 className="text-4xl lg:text-6xl font-black leading-tight">Ready to transform your jurisdictional accountability?</h2>
                <p className="text-xl text-blue-100/60 font-medium">Join over 100+ departments leveraging Tarisa to deliver world-class service to their residents.</p>
                <div className="flex flex-wrap justify-center gap-6 pt-4">
                  <Link href="/signup">
                    <Button size="lg" className="h-16 px-12 text-base font-black bg-white text-[#0a1b3d] hover:bg-white/90 shadow-2xl uppercase tracking-wider">
                      Register as Citizen
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="h-16 px-12 text-base font-black border-white/20 text-white hover:bg-white/10 uppercase tracking-wider">
                      Official Admin Access
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-gray-100 bg-white text-[#0a1b3d]">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-primary" />
                <span className="text-2xl font-black tracking-tight italic">TARISA</span>
              </div>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">
                Empowering government. <br />
                Connecting citizens. <br />
                Building trust through results.
              </p>
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
          <div className="pt-12 border-t border-gray-100 flex flex-col md:row justify-between items-center gap-6">
            <div className="text-xs font-black text-gray-300 uppercase tracking-widest">© 2026 Tarisa Civic Infrastructure. Unified Accountability System.</div>
            <div className="flex gap-8 text-xs font-black text-gray-400 uppercase tracking-[0.2em] italic">
               Design by Antigravity // Built for Resilience
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SolutionCard({ icon, bg, title, description }: { icon: React.ReactNode, bg: string, title: string, description: string }) {
  return (
    <Card className="border-none bg-white rounded-[32px] overflow-hidden shadow-soft hover:shadow-elevated transition-all p-8 group">
      <CardContent className="p-0 space-y-8">
        <div className={`p-4 rounded-3xl ${bg} w-fit shadow-lg group-hover:scale-110 transition-transform duration-500`}>
          {icon}
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-black text-[#0a1b3d]">{title}</h3>
          <p className="text-gray-400 font-medium leading-relaxed italic">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureRow({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="mt-1 p-3 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors h-fit shadow-soft">
        {icon}
      </div>
      <div>
        <h4 className="text-xl font-bold text-[#0a1b3d] mb-1 group-hover:text-primary transition-colors">{title}</h4>
        <p className="text-gray-400 text-sm font-medium">{description}</p>
      </div>
    </div>
  );
}

function FooterCol({ title, links }: { title: string, links: string[] }) {
  return (
    <div className="space-y-6">
      <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{title}</h5>
      <ul className="space-y-3">
        {links.map(link => (
          <li key={link}>
            <a href="#" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">{link}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
