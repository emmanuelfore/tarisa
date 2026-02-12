import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import {
  Megaphone,
  Send,
  Users,
  MapPin,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Broadcast } from "@shared/schema";
import { format } from "date-fns";

export default function AdminBroadcast() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState("all");
  const [severity, setSeverity] = useState("info");
  const { toast } = useToast();

  const { data: broadcasts = [], isLoading } = useQuery<Broadcast[]>({
    queryKey: ["/api/broadcasts"],
  });

  const { data: jurisdictions = [] } = useQuery<any[]>({
    queryKey: ["/api/jurisdictions"],
  });

  const districts = jurisdictions.filter(j => j.level === 'district' || j.level === 'council');
  const wards = jurisdictions.filter(j => j.level === 'ward');

  const sendBroadcastMutation = useMutation({
    mutationFn: async (data: Partial<Broadcast>) => {
      const res = await apiRequest("POST", "/api/broadcasts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broadcasts"] });
      setTitle("");
      setMessage("");
      toast({
        title: "Broadcast Sent",
        description: "Message has been sent to residents successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Broadcast Failed",
        description: "Could not send broadcast message.",
        variant: "destructive",
      });
    }
  });

  const handleSendBroadcast = () => {
    if (!title || !message) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and a message body.",
        variant: "destructive"
      });
      return;
    }

    // Resolve target IDs to names for display/logging if needed, 
    // but typically we'd send IDs. For now keeping text as per original, 
    // or mapping if the backend expects IDs. 
    // Assuming backend expects strings for targetWards based on schema default.
    let targetList: string[] = ["All Wards"];

    if (targetType === 'district') {
      // In a real app we might select a specific district ID. 
      // For this UI, if we are just selecting "District" type, 
      // we might want a dropdown to select WHICH district.
      // The UI below adds a Select for this.
    }

    const payload = {
      title,
      message,
      severity,
      targetWards: targetType === 'all' ? ["All Wards"] : [selectedLocation], // Simplified for demo
      createdBy: "Admin",
    };

    sendBroadcastMutation.mutate(payload);
  };

  const [selectedLocation, setSelectedLocation] = useState("");

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-gray-900">Broadcast Center</h2>
          <p className="text-gray-500">Send mass alerts and notifications to residents.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compose Message */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                Compose Message
              </CardTitle>
              <CardDescription>
                Create a new alert to be sent via SMS and Push Notification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Broadcast Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Urgent Water Supply Interruption"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <RadioGroup
                  defaultValue="all"
                  value={targetType}
                  onValueChange={(val) => {
                    setTargetType(val);
                    setSelectedLocation("");
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer transition-colors ${targetType === 'all' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="flex items-center gap-2 cursor-pointer">
                      <Users size={16} /> All Wards
                    </Label>
                  </div>
                  <div className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer transition-colors ${targetType === 'district' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                    <RadioGroupItem value="district" id="district" />
                    <Label htmlFor="district" className="flex items-center gap-2 cursor-pointer">
                      <MapPin size={16} /> District
                    </Label>
                  </div>
                  <div className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer transition-colors ${targetType === 'ward' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                    <RadioGroupItem value="ward" id="ward" />
                    <Label htmlFor="ward" className="flex items-center gap-2 cursor-pointer">
                      <MapPin size={16} /> Specific Ward
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {(targetType === 'district' || targetType === 'ward') && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label>Select {targetType === 'district' ? 'District' : 'Ward'}</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${targetType === 'district' ? 'District' : 'Ward'}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {targetType === 'district' ? (
                        districts.length > 0 ? (
                          districts.map(d => (
                            <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                          ))
                        ) : <SelectItem value="no_districts" disabled>No districts found</SelectItem>
                      ) : (
                        wards.length > 0 ? (
                          wards.map(w => (
                            <SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>
                          ))
                        ) : <SelectItem value="no_wards" disabled>No wards found</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Severity Level</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={severity === 'info' ? 'default' : 'outline'}
                    className={`flex-1 ${severity === 'info' ? 'bg-blue-600 hover:bg-blue-700' : 'text-blue-600 border-blue-200'}`}
                    onClick={() => setSeverity('info')}
                  >
                    <Info size={16} className="mr-2" /> Info
                  </Button>
                  <Button
                    type="button"
                    variant={severity === 'medium' ? 'default' : 'outline'}
                    className={`flex-1 ${severity === 'medium' ? 'bg-orange-500 hover:bg-orange-600' : 'text-orange-500 border-orange-200'}`}
                    onClick={() => setSeverity('medium')}
                  >
                    <AlertTriangle size={16} className="mr-2" /> Warning
                  </Button>
                  <Button
                    type="button"
                    variant={severity === 'high' ? 'default' : 'outline'}
                    className={`flex-1 ${severity === 'high' ? 'bg-red-600 hover:bg-red-700' : 'text-red-600 border-red-200'}`}
                    onClick={() => setSeverity('high')}
                  >
                    <AlertTriangle size={16} className="mr-2" /> Critical
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message Body</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  className="min-h-[150px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <p className="text-xs text-gray-500 text-right">
                  {message.length} characters
                </p>
              </div>

              <Button className="w-full h-12 text-lg" onClick={handleSendBroadcast} disabled={sendBroadcastMutation.isPending}>
                {sendBroadcastMutation.isPending ? (
                  <Loader2 className="mr-2 animate-spin" />
                ) : (
                  <Send className="mr-2" />
                )}
                Send Broadcast
              </Button>
            </CardContent>
          </Card>

          {/* Tips / Stats */}
          <div className="space-y-6">
            <Card className="bg-primary text-white border-none">
              <CardHeader>
                <CardTitle className="text-lg">Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <p>• Keep messages concise (under 160 chars) for SMS compatibility.</p>
                <p>• Use "Critical" severity only for emergencies to avoid alert fatigue.</p>
                <p>• Targeting specific wards increases engagement rates.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">SMS Gateway</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                    <CheckCircle2 size={12} /> Online
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Push Server</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                    <CheckCircle2 size={12} /> Online
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Daily Quota</span>
                  <span className="text-sm font-medium">45% Used</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Broadcast History</CardTitle>
            <CardDescription>Recent messages sent to the community.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Broadcast ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Sent Date</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {broadcasts.map((broadcast) => (
                    <TableRow key={broadcast.id}>
                      <TableCell className="font-mono text-xs text-gray-500">
                        {broadcast.id}
                      </TableCell>
                      <TableCell className="font-medium">{broadcast.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Users size={14} />
                          {Array.isArray(broadcast.targetWards) ? broadcast.targetWards.join(', ') : 'All'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`
                          ${broadcast.severity === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                            broadcast.severity === 'medium' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'}
                        `}>
                          {broadcast.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {broadcast.createdAt ? format(new Date(broadcast.createdAt), 'MMM d, yyyy HH:mm') : 'N/A'}
                      </TableCell>
                      <TableCell>~</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Sent
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
