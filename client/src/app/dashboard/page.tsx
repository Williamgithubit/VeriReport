import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { UploadReportSheet } from '@/components/upload-report-sheet';

const mockReports = [
  {
    studentName: 'Alice Johnson',
    class: '10th Grade',
    term: 'Fall',
    year: 2023,
    status: 'Valid',
    verificationId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  },
  {
    studentName: 'Bob Williams',
    class: '8th Grade',
    term: 'Spring',
    year: 2024,
    status: 'Pending',
    verificationId: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
  },
  {
    studentName: 'Charlie Brown',
    class: '12th Grade',
    term: 'Fall',
    year: 2023,
    status: 'Valid',
    verificationId: 'c3d4e5f6-a7b8-9012-3456-7890abcdef12',
  },
    {
    studentName: 'Diana Prince',
    class: '11th Grade',
    term: 'Spring',
    year: 2024,
    status: 'Invalid',
    verificationId: 'd4e5f6a7-b8c9-0123-4567-890abcdef123',
  },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    Valid: 'default',
    Pending: 'secondary',
    Invalid: 'destructive'
}

function DashboardContent() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-headline text-3xl font-bold">Dashboard</h1>
        <UploadReportSheet />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="https://picsum.photos/seed/user/100/100" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="font-headline text-xl">Admin User</CardTitle>
              <p className="text-sm text-muted-foreground">admin@verireport.com</p>
              <Badge variant="outline" className="mt-1">Administrator</Badge>
            </div>
          </CardHeader>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Total Reports</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">1,254</p>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Pending Verifications</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">32</p>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Report Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead className="hidden md:table-cell">Class</TableHead>
                <TableHead className="hidden lg:table-cell">Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReports.map((report) => (
                <TableRow key={report.verificationId}>
                  <TableCell className="font-medium">{report.studentName}</TableCell>
                  <TableCell className="hidden md:table-cell">{report.class}</TableCell>
                  <TableCell className="hidden lg:table-cell">{report.term} {report.year}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[report.status] || 'secondary'}>{report.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
