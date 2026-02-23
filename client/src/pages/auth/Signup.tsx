import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import appIcon from "@assets/generated_images/app_icon_for_tarisa.png";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nid: "",
    ward: "",
    phone: "",
    password: "",
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiRequest("POST", "/api/auth/citizen/register", formData);
      const data = await res.json();

      toast({
        title: "Account Created!",
        description: "Welcome to Tarisa. You can now start reporting issues.",
      });

      setLocation('/citizen/home');
    } catch (error: any) {
      const errorData = await error.response?.json();
      toast({
        title: "Registration Failed",
        description: errorData?.error || "Could not create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout showNav={false}>
      <div className="px-6 py-6 pb-12">
        <Link href="/">
          <Button variant="ghost" size="icon" className="-ml-3 mb-4">
            <ArrowLeft size={24} />
          </Button>
        </Link>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <img src={appIcon} alt="Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 text-sm text-center">Join TARISA to improve your community</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullname">Full Name</Label>
            <Input
              id="fullname"
              placeholder="e.g. Tatenda Phiri"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. tatenda@example.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="national_id">National ID Number</Label>
            <Input
              id="national_id"
              placeholder="63-XXXXXXX X XX"
              required
              className="font-mono"
              value={formData.nid}
              onChange={(e) => setFormData({ ...formData, nid: e.target.value })}
            />
            <p className="text-xs text-gray-400">Format: 63-1234567 F 42</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ward">Residential Ward</Label>
            <Select
              value={formData.ward}
              onValueChange={(v) => setFormData({ ...formData, ward: v })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your ward" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ward 7 - Avondale">Ward 7 - Avondale</SelectItem>
                <SelectItem value="Ward 6 - Avenues">Ward 6 - Avenues</SelectItem>
                <SelectItem value="Ward 1 - Harare Central">Ward 1 - Harare Central</SelectItem>
                <SelectItem value="Ward 41 - Marlborough">Ward 41 - Marlborough</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex gap-2">
              <div className="flex items-center justify-center px-3 border border-gray-200 rounded-md bg-gray-50 text-sm font-medium text-gray-500">
                +263
              </div>
              <Input
                id="phone"
                placeholder="77 123 4567"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="flex items-start gap-2 pt-2">
            <Checkbox id="terms" required className="mt-1" />
            <Label htmlFor="terms" className="text-xs text-gray-500 font-normal leading-tight">
              I agree to the <span className="text-primary font-medium">Terms of Service</span> and verify that I am a resident of the selected ward.
            </Label>
          </div>

          <Button type="submit" className="w-full h-12 text-base mt-6 text-white" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <span
            className="text-primary font-medium hover:underline cursor-pointer"
            onClick={() => setLocation('/login')}
          >
            Log in
          </span>
        </div>
      </div>
    </MobileLayout>
  );
}
