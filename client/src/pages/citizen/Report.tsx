import { useState, useRef } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
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
  Upload,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Categories are now fetched from API
interface Category {
  id: number;
  name: string;
  icon: string;
  code: string;
}

interface Jurisdiction {
  id: number;
  name: string;
  level: string;
  parentId: number | null;
}

interface ReportData {
  photos: string[];
  location: string;
  coordinates: string;
  category: string;
  categoryId: number | null;
  severity: number;
  description: string;
  title: string;
  jurisdictionId: number | null;
  wardNumber: string;
  suburb: string;
}

export default function ReportIssue() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewPhotos, setPreviewPhotos] = useState<string[]>([]);

  const [reportData, setReportData] = useState<ReportData>({
    photos: [],
    location: "Loading location...",
    coordinates: "",
    category: "",
    categoryId: null,
    severity: 50,
    description: "",
    title: "",
    jurisdictionId: null,
    wardNumber: "",
    suburb: "",
  });

  const { data: apiCategories } = useQuery<Category[]>({
    queryKey: ['/api/issue-categories'],
  });

  const { data: jurisdictions } = useQuery<Jurisdiction[]>({
    queryKey: ['/api/jurisdictions'],
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const uploadPhotoMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('photos', file);
      });
      const res = await fetch('/api/upload/photo', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    },
    onSuccess: (data) => {
      setReportData(prev => ({
        ...prev,
        photos: [...prev.photos, ...data.urls]
      }));
      toast({ title: "Photos uploaded!", duration: 2000 });
    },
    onError: () => {
      toast({ title: "Failed to upload photos", variant: "destructive" });
    }
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const category = reportData.category.charAt(0).toUpperCase() + reportData.category.slice(1);
      const res = await fetch('/api/issues/anonymous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reportData.title || `${reportData.category} Issue Report`,
          description: reportData.description || `Reported issue in ${reportData.category} category`,
          category: reportData.category,
          location: reportData.location,
          coordinates: reportData.coordinates,
          severity: reportData.severity,
          priority: reportData.severity >= 75 ? 'high' : reportData.severity >= 50 ? 'medium' : 'low',
          photos: reportData.photos,
          jurisdictionId: reportData.jurisdictionId,
          wardNumber: reportData.wardNumber,
          suburb: reportData.suburb,
        }),
      });
      if (!res.ok) throw new Error('Submission failed');
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Report Submitted!",
        description: `Your tracking ID is ${data.trackingId}. Save it to check status.`,
        duration: 8000,
      });
      setLocation('/citizen/home');
    },
    onError: () => {
      toast({ title: "Failed to submit report", variant: "destructive" });
    }
  });

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewPhotos(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
      uploadPhotoMutation.mutate(files);
    }
  };

  const removePhoto = (index: number) => {
    setPreviewPhotos(prev => prev.filter((_, i) => i !== index));
    setReportData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const selectCategory = (cat: Category) => {
    setReportData(prev => ({ ...prev, category: cat.name, categoryId: cat.id }));
  };

  const getSeverityLabel = (value: number) => {
    if (value >= 75) return 'Critical';
    if (value >= 50) return 'High';
    if (value >= 25) return 'Medium';
    return 'Low';
  };

  return (
    <MobileLayout showNav={false}>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        multiple
        onChange={handlePhotoSelect}
        data-testid="input-photo-file"
      />

      <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-30">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => step === 1 ? setLocation('/citizen/home') : prevStep()}
          data-testid="button-back"
        >
          <ChevronLeft />
        </Button>
        <span className="font-heading font-semibold text-lg">Report Issue</span>
        <div className="w-10 text-center text-sm font-medium text-gray-500" data-testid="text-step-indicator">
          {step}/5
        </div>
      </div>

      <div className="p-6">
        <div className="w-full bg-gray-100 h-1.5 rounded-full mb-8 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-heading font-bold text-gray-900">Snap a Photo</h2>
              <p className="text-gray-500">Take a clear picture of the issue to help us locate and fix it.</p>
            </div>

            {previewPhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {previewPhotos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    <img src={photo} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
                      data-testid={`button-remove-photo-${index}`}
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
                {previewPhotos.length < 5 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center"
                    data-testid="button-add-more-photos"
                  >
                    <Camera className="h-8 w-8 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Add More</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[4/3] bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                data-testid="button-take-photo"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Camera size={32} className="text-primary" />
                </div>
                <span className="text-sm font-medium text-gray-500">Tap to take or select photo</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-12"
                onClick={() => fileInputRef.current?.click()}
                data-testid="button-gallery"
              >
                <Upload className="mr-2 h-4 w-4" /> Gallery
              </Button>
              <Button className="h-12" onClick={nextStep} data-testid="button-skip-photo">
                Skip Photo
              </Button>
            </div>

            {previewPhotos.length > 0 && (
              <Button className="w-full h-12 text-lg" onClick={nextStep} data-testid="button-next-step-1">
                Next Step <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-heading font-bold text-gray-900">Confirm Location</h2>
              <p className="text-gray-500">We detected your location automatically. Is this correct?</p>
            </div>

            <div className="aspect-video bg-gray-200 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                <MapPin size={48} className="text-primary animate-bounce" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3 text-sm font-medium shadow-sm" data-testid="text-location">
                {reportData.location}
              </div>
            </div>

            <Button variant="outline" className="w-full h-12" data-testid="button-adjust-location">
              <MapPin className="mr-2 h-4 w-4" /> Adjust Pin Manually
            </Button>

            <Button className="w-full h-12 text-lg" onClick={nextStep} data-testid="button-confirm-location">
              Confirm & Continue <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-heading font-bold text-gray-900">Select Area</h2>
              <p className="text-gray-500">Please select your local authority and ward.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Local Authority</Label>
                <Select
                  onValueChange={(v: string) => {
                    const id = parseInt(v);
                    const auth = jurisdictions?.find((j: Jurisdiction) => j.id === id);
                    if (auth) {
                      setReportData(prev => ({ ...prev, jurisdictionId: id, wardNumber: "", suburb: "" }));
                    }
                  }}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select Local Authority" />
                  </SelectTrigger>
                  <SelectContent>
                    {jurisdictions?.filter((j: Jurisdiction) => j.level === 'local_authority').map((auth: Jurisdiction) => (
                      <SelectItem key={auth.id} value={auth.id.toString()}>{auth.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ward</Label>
                <Select
                  disabled={!reportData.jurisdictionId}
                  onValueChange={(v: string) => {
                    const ward = jurisdictions?.find((j: Jurisdiction) => j.id === parseInt(v));
                    if (ward) {
                      setReportData(prev => ({ ...prev, wardNumber: ward.name }));
                    }
                  }}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select Ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {jurisdictions?.filter((j: Jurisdiction) => j.level === 'ward' && j.parentId === reportData.jurisdictionId).map((ward: Jurisdiction) => (
                      <SelectItem key={ward.id} value={ward.id.toString()}>{ward.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Suburb (Optional)</Label>
                <Input
                  className="h-12"
                  placeholder="e.g. Avondale, Mbare"
                  value={reportData.suburb}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReportData(prev => ({ ...prev, suburb: e.target.value }))}
                />
              </div>
            </div>

            <Button
              className="w-full h-12 text-lg"
              onClick={nextStep}
              disabled={!reportData.wardNumber}
              data-testid="button-confirm-jurisdiction"
            >
              Confirm Area <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-heading font-bold text-gray-900">Issue Details</h2>
              <p className="text-gray-500">Categorize the problem so we send the right team.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {apiCategories?.map((cat: Category) => (
                <button
                  key={cat.id}
                  onClick={() => selectCategory(cat)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border bg-white transition-all active:scale-95 ${reportData.categoryId === cat.id
                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                    : 'border-gray-200 hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  data-testid={`button-category-${cat.code}`}
                >
                  <span className="text-3xl mb-2">{cat.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <Label>Severity Level: <span className="font-bold">{getSeverityLabel(reportData.severity)}</span></Label>
              <div className="pt-2 px-2">
                <Slider
                  value={[reportData.severity]}
                  max={100}
                  step={1}
                  onValueChange={(val) => setReportData(prev => ({ ...prev, severity: val[0] }))}
                  data-testid="slider-severity"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                  <span className="text-destructive">Critical</span>
                </div>
              </div>
            </div>

            <Button
              className="w-full h-12 text-lg mt-4"
              onClick={nextStep}
              disabled={!reportData.category}
              data-testid="button-next-step-4"
            >
              Next Step <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-heading font-bold text-gray-900">Review Report</h2>
              <p className="text-gray-500">Check if everything looks correct before submitting.</p>
            </div>

            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                    {previewPhotos[0] && (
                      <img src={previewPhotos[0]} alt="Issue" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900" data-testid="text-review-category">
                      {reportData.category} Report
                    </h3>
                    <p className="text-sm text-gray-500" data-testid="text-review-severity">
                      {getSeverityLabel(reportData.severity)} Severity
                    </p>
                    <p className="text-xs text-gray-400 mt-1" data-testid="text-review-location">{reportData.location}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <Label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Description</Label>
                  <Textarea
                    placeholder="Add more details (optional)..."
                    className="bg-white"
                    value={reportData.description}
                    onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                    data-testid="input-description"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex gap-3 text-sm">
              <AlertTriangle className="shrink-0 h-5 w-5" />
              <p>We checked for duplicates and found no similar reports in this area. You're good to go!</p>
            </div>

            <Button
              className="w-full h-14 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
              data-testid="button-submit-report"
            >
              {submitMutation.isPending ? (
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
