import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, ArrowUpRight, ArrowDownLeft, Gift, History } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function CitizenCredits() {
  return (
    <MobileLayout>
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">CivicCredits Wallet</h1>

        {/* Main Balance Card */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 border-none shadow-xl mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Award size={140} />
          </div>
          <CardContent className="p-8 text-white relative z-10">
             <p className="text-primary-foreground/80 font-medium mb-2">Available Balance</p>
             <h3 className="text-5xl font-bold font-heading mb-6 tracking-tight">450 <span className="text-2xl opacity-80">CC</span></h3>
             
             <div className="flex gap-3">
               <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg">
                 <p className="text-xs opacity-70 mb-1">Equivalent Value</p>
                 <p className="font-semibold text-lg">≈ $2,250 ZWL</p>
               </div>
             </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Button className="h-14 bg-white hover:bg-gray-50 text-primary border border-gray-100 shadow-sm flex flex-col gap-1 items-center justify-center">
            <Gift size={20} />
            <span className="text-xs font-medium">Redeem</span>
          </Button>
          <Button className="h-14 bg-white hover:bg-gray-50 text-primary border border-gray-100 shadow-sm flex flex-col gap-1 items-center justify-center">
            <History size={20} />
            <span className="text-xs font-medium">History</span>
          </Button>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-6">
          <h3 className="font-heading font-semibold text-gray-900">Recent Transactions</h3>
          
          <div className="space-y-4">
            {/* Transaction 1 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <ArrowDownLeft size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Report Verified</p>
                  <p className="text-xs text-gray-500">Pothole on Samora Machel</p>
                </div>
              </div>
              <span className="font-bold text-green-600">+15 CC</span>
            </div>
            
            <Separator />

            {/* Transaction 2 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <ArrowDownLeft size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Report Upvoted</p>
                  <p className="text-xs text-gray-500">Street Light Issue</p>
                </div>
              </div>
              <span className="font-bold text-green-600">+1 CC</span>
            </div>

            <Separator />

             {/* Transaction 3 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                  <ArrowUpRight size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Airtime Redemption</p>
                  <p className="text-xs text-gray-500">Econet $1 USD Bundle</p>
                </div>
              </div>
              <span className="font-bold text-gray-900">-100 CC</span>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
