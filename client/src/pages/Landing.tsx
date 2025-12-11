import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, LayoutDashboard, ShieldCheck } from "lucide-react";
import appIcon from "@assets/generated_images/app_icon_for_tarisa.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent -z-10" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="max-w-4xl w-full flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
        <div className="mb-8 relative">
          <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center p-4 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <img src={appIcon} alt="Tarisa Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-heading font-bold text-gray-900 mb-4 tracking-tight">
          TARISA
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl font-light">
          "See It. Snap It. Solve It." <br/>
          <span className="text-base text-gray-500 mt-2 block">The next-generation civic reporting platform for Zimbabwe.</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Citizen App Option */}
          <Link href="/citizen/home">
            <div className="group relative bg-white border border-gray-200 hover:border-primary/50 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer text-left overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Smartphone size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Citizen App</h3>
                <p className="text-gray-500 text-sm mb-4">Report issues, track progress, and earn CivicCredits.</p>
                <div className="flex gap-3">
                  <div className="flex items-center text-primary font-medium text-sm group-hover:translate-x-2 transition-transform">
                    Launch App <ArrowRight size={16} className="ml-2" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Admin Dashboard Option */}
          <Link href="/admin/dashboard">
            <div className="group relative bg-white border border-gray-200 hover:border-secondary/50 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer text-left overflow-hidden">
               <div className="absolute inset-0 bg-secondary/5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
               <div className="relative z-10">
                <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:text-white transition-colors">
                  <LayoutDashboard size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Admin Dashboard</h3>
                <p className="text-gray-500 text-sm mb-4">Manage reports, assign teams, and analyze city data.</p>
                <div className="flex items-center text-secondary font-medium text-sm group-hover:translate-x-2 transition-transform">
                  Access Portal <ArrowRight size={16} className="ml-2" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Signup Link (Quick Action) */}
        <Link href="/signup">
           <div className="md:col-span-2 text-center mt-8">
             <Button variant="link" className="text-gray-500 hover:text-primary">
               New user? Create an account
             </Button>
           </div>
        </Link>
        
        <div className="mt-16 flex items-center gap-2 text-sm text-gray-400">
          <ShieldCheck size={16} />
          <span>Secure • Verified • Official Partner of City of Harare</span>
        </div>
      </div>
    </div>
  );
}
