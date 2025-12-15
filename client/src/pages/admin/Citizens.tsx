import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  MoreHorizontal, 
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const INITIAL_CITIZENS = [
  { id: "C1", name: "Tatenda Phiri", nid: "63-2239121 P 42", ward: "Ward 7", phone: "+263 772 123 456", joined: "2024-11-15", status: "Verified" },
  { id: "C2", name: "Sarah Mutasa", nid: "08-1123445 F 23", ward: "Ward 12", phone: "+263 773 987 654", joined: "2024-12-01", status: "Verified" },
  { id: "C3", name: "John Doe", nid: "45-9988776 Q 12", ward: "Ward 3", phone: "+263 712 555 555", joined: "2024-12-10", status: "Pending" },
  { id: "C4", name: "Grace Kals", nid: "22-3344556 R 66", ward: "Ward 1", phone: "+263 774 111 222", joined: "2024-10-20", status: "Suspended" },
];

export default function AdminCitizens() {
  const [citizens, setCitizens] = useState(INITIAL_CITIZENS);
  const { toast } = useToast();

  const handleStatusChange = (id: string, newStatus: string) => {
    setCitizens(citizens.map(c => c.id === id ? { ...c, status: newStatus } : c));
    toast({
      title: "Status Updated",
      description: `User status changed to ${newStatus}.`,
    });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-gray-900">Citizen Registry</h2>
          <p className="text-gray-500">Verified citizens registered on the platform.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registered Citizens</CardTitle>
            <CardDescription>View and manage citizen accounts linked to National IDs.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input placeholder="Search by Name or National ID..." className="pl-9" />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Citizen</TableHead>
                  <TableHead>National ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {citizens.map((citizen) => (
                  <TableRow key={citizen.id}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                          {citizen.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{citizen.name}</span>
                        <span className="text-xs text-gray-500">{citizen.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{citizen.nid}</TableCell>
                    <TableCell>{citizen.ward}</TableCell>
                    <TableCell className="text-sm text-gray-500">{citizen.joined}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {citizen.status === 'Verified' ? (
                          <CheckCircle2 size={14} className="text-green-500" />
                        ) : citizen.status === 'Suspended' ? (
                          <XCircle size={14} className="text-red-500" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-orange-400" />
                        )}
                        <span className="text-sm">{citizen.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/admin/citizen/${citizen.id}`}>
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem>Verification History</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {citizen.status !== 'Suspended' ? (
                            <DropdownMenuItem className="text-red-600" onClick={() => handleStatusChange(citizen.id, 'Suspended')}>
                              Suspend User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-green-600" onClick={() => handleStatusChange(citizen.id, 'Verified')}>
                              Unsuspend User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
