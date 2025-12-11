import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Camera,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const CATEGORIES = [
  { id: 'roads', label: 'Roads', icon: '🚧' },
  { id: 'water', label: 'Water', icon: '💧' },
  { id: 'sewer', label: 'Sewer', icon: '🕳️' },
  { id: 'waste', label: 'Waste', icon: '🗑️' },
  { id: 'lights', label: 'Lights', icon: '💡' },
  { id: 'other', label: 'Other', icon: '📝' },
];

export default function ReportIssue() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Report Submitted!",
        description: "Your tracking ID is TAR-2025-0042. You earned +5 points!",
        duration: 5000,
      });
      setLocation('/citizen/home');
    }, 1500);
  };

  return (
    <MobileLayout showNav={false}>
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-30">
        <Button variant="ghost" size="icon" onClick={() => step === 1 ? setLocation('/citizen/home') : prevStep()}>
          <ChevronLeft />
        </Button>
        <span className="font-heading font-semibold text-lg">Report Issue</span>
        <div className="w-10 text-center text-sm font-medium text-gray-500">
          {step}/4
        </div>
      </div>

      <div className="p-6">
        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-1.5 rounded-full mb-8 overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-300 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Step 1: Photo */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-heading font-bold text-gray-900">Snap a Photo</h2>
              <p className="text-gray-500">Take a clear picture of the issue to help us locate and fix it.</p>
            </div>

            <div className="aspect-[4/3] bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Camera size={32} className="text-primary" />
              </div>
              <span className="text-sm font-medium text-gray-500">Tap to take photo</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-12">
                <Upload className="mr-2 h-4 w-4" /> Gallery
              </Button>
              <Button className="h-12" onClick={nextStep}>
                Skip Photo
              </Button>
            </div>
            
            <Button className="w-full h-12 text-lg" onClick={nextStep}>
              Next Step <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
             <div className="text-center space-y-2">
              <h2 className="text-2xl font-heading font-bold text-gray-900">Confirm Location</h2>
              <p className="text-gray-500">We detected your location automatically. Is this correct?</p>
            </div>

            <div className="aspect-video bg-gray-200 rounded-2xl relative overflow-hidden">
               {/* Mock Map View */}
               <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                 <MapPin size={48} className="text-primary animate-bounce" />
               </div>
               <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3 text-sm font-medium shadow-sm">
                 123 Samora Machel Avenue, Harare
               </div>
            </div>

            <Button variant="outline" className="w-full h-12">
              <MapPin className="mr-2 h-4 w-4" /> Adjust Pin Manually
            </Button>

            <Button className="w-full h-12 text-lg" onClick={nextStep}>
              Confirm Location <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
             <div className="text-center space-y-2">
              <h2 className="text-2xl font-heading font-bold text-gray-900">Issue Details</h2>
              <p className="text-gray-500">Categorize the problem so we send the right team.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.id}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/5 focus:ring-2 focus:ring-primary focus:outline-none transition-all active:scale-95"
                >
                  <span className="text-3xl mb-2">{cat.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <Label>Severity Level</Label>
              <div className="pt-2 px-2">
                <Slider defaultValue={[33]} max={100} step={33} />
                <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                  <span className="text-destructive">Critical</span>
                </div>
              </div>
            </div>

            <Button className="w-full h-12 text-lg mt-4" onClick={nextStep}>
              Next Step <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
             <div className="text-center space-y-2">
              <h2 className="text-2xl font-heading font-bold text-gray-900">Review Report</h2>
              <p className="text-gray-500">Check if everything looks correct before submitting.</p>
            </div>

            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                    {/* Placeholder for captured image */}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Pothole Repair</h3>
                    <p className="text-sm text-gray-500">Roads • High Severity</p>
                    <p className="text-xs text-gray-400 mt-1">123 Samora Machel Ave</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <Label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Description</Label>
                  <Textarea placeholder="Add more details (optional)..." className="bg-white" />
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex gap-3 text-sm">
              <AlertTriangle className="shrink-0 h-5 w-5" />
              <p>We checked for duplicates and found no similar reports in this area. You're good to go!</p>
            </div>

            <Button className="w-full h-14 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                "Submitting..."
              ) : (
                <>
                  Submit Report <CheckCircle2 className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
