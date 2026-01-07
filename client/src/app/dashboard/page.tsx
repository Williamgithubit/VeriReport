"use client";

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
import { MoreHorizontal, Eye, Edit, Trash2, Download } from 'lucide-react';
import { UploadReportSheet } from '@/components/upload-report-sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDeleteReportMutation, useGetReportsQuery, useUpdateReportMutation } from '@/store/reportsApi';

interface Report {
  id: string;
  studentName: string;
  class: string;
  year: number | null;
  status: 'Passed' | 'Failed' | 'Passed Under Condition' | 'Summer School' | 'Pending' | 'Valid' | 'Invalid';
  verificationStatus?: 'Valid' | 'Pending' | 'Invalid';
  verificationId: string;
  fileUrl?: string;
  createdAt: string | null;
  updatedAt: string | null;
}

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Valid: 'default',
  Pending: 'secondary',
  Invalid: 'destructive'
};

function DashboardContent() {
  const { toast } = useToast();

  const {
    data,
    isLoading,
    isFetching,
    error: reportsError,
  } = useGetReportsQuery();

  const [updateReport, { isLoading: isSaving }] = useUpdateReportMutation();
  const [deleteReport, { isLoading: isDeleting }] = useDeleteReportMutation();

  const reports = (data?.reports ?? []) as Report[];
  const stats = {
    total: data?.total ?? 0,
    pending: data?.pending ?? 0,
  };
  const loading = isLoading || isFetching;

  const [actionsOpen, setActionsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionsMode, setActionsMode] = useState<'view' | 'edit'>('view');
  const [editValues, setEditValues] = useState({
    studentName: '',
    class: '',
    year: '',
    status: '' as Report['status'] | '',
    verificationStatus: '' as NonNullable<Report['verificationStatus']> | '',
  });

  useEffect(() => {
    if (!reportsError) return;
    toast({
      title: 'Error',
      description: 'Failed to load reports',
      variant: 'destructive'
    });
  }, [reportsError, toast]);

  const openActions = (report: Report) => {
    setSelectedReport(report);
    setActionsMode('view');
    setEditValues({
      studentName: report.studentName ?? '',
      class: report.class ?? '',
      year: report.year == null ? '' : String(report.year),
      status: report.status ?? '',
      verificationStatus: report.verificationStatus ?? '',
    });
    setActionsOpen(true);
  };

  const handleView = (report: Report) => {
    if (!report.fileUrl) {
      toast({
        title: 'Unavailable',
        description: 'No file is available for this report.',
        variant: 'destructive'
      });
      return;
    }
    window.open(report.fileUrl, '_blank');
  };

  const handleEdit = (report: Report) => {
    toast({
      title: 'Edit Report',
      description: `Editing report for ${report.studentName}`
    });
  };

  const handleSaveEdit = async () => {
    if (!selectedReport) return;
    const yearNum = editValues.year.trim() === '' ? null : Number(editValues.year);
    if (editValues.year.trim() !== '' && Number.isNaN(yearNum)) {
      toast({
        title: 'Invalid year',
        description: 'Year must be a number',
        variant: 'destructive'
      });
      return;
    }

    try {
      await updateReport({
        id: selectedReport.id,
        studentName: editValues.studentName,
        class: editValues.class,
        year: yearNum,
        status: editValues.status as Report['status'],
        verificationStatus: editValues.verificationStatus || undefined,
      }).unwrap();

      toast({
        title: 'Success',
        description: 'Report updated successfully',
      });

      setActionsOpen(false);
      setSelectedReport(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update report',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (report: Report) => {
    try {
      await deleteReport({ id: report.id }).unwrap();
      
      toast({
        title: 'Success',
        description: 'Report deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete report',
        variant: 'destructive'
      });
    }
  };

  const handleDownload = (report: Report) => {
    if (!report.fileUrl) {
      toast({
        title: 'Unavailable',
        description: 'No file is available for this report.',
        variant: 'destructive'
      });
      return;
    }
    const link = document.createElement('a');
    link.href = report.fileUrl;
    link.download = `${report.studentName}_report_${report.year ?? 'unknown'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total reports uploaded</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Pending Verifications</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">{stats.pending}</p>
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
                <TableHead className="hidden lg:table-cell">Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading reports...
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No reports found. Upload your first report to get started.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => {
                  const legacyVerificationStatus =
                    report.status === 'Pending' || report.status === 'Valid' || report.status === 'Invalid'
                      ? (report.status as unknown as 'Valid' | 'Pending' | 'Invalid')
                      : undefined;

                  const verificationStatus = report.verificationStatus ?? legacyVerificationStatus ?? 'Pending';

                  return (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.studentName}</TableCell>
                    <TableCell className="hidden md:table-cell">{report.class}</TableCell>
                    <TableCell className="hidden lg:table-cell">{report.year}</TableCell>
                    <TableCell>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline">{report.status}</Badge>
                        <Badge variant={statusVariant[verificationStatus] || 'secondary'}>{verificationStatus}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openActions(report)}
                        aria-label="Open report actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={actionsOpen} onOpenChange={(open) => {
        setActionsOpen(open);
        if (!open) {
          setSelectedReport(null);
          setActionsMode('view');
          setDeleteOpen(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Actions</DialogTitle>
            <DialogDescription>
              {selectedReport ? `${selectedReport.studentName} (${selectedReport.verificationId})` : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedReport ? (
            <div className="grid gap-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={actionsMode === 'view' ? 'default' : 'outline'}
                  onClick={() => setActionsMode('view')}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
                <Button
                  variant={actionsMode === 'edit' ? 'default' : 'outline'}
                  onClick={() => setActionsMode('edit')}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" onClick={() => handleDownload(selectedReport)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" onClick={() => handleView(selectedReport)}>
                  Open File
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>

              {actionsMode === 'view' ? (
                <div className="grid gap-2 text-sm">
                  <div><span className="font-medium">Student:</span> {selectedReport.studentName}</div>
                  <div><span className="font-medium">Class:</span> {selectedReport.class}</div>
                  <div><span className="font-medium">Year:</span> {selectedReport.year ?? '—'}</div>
                  <div><span className="font-medium">Status:</span> {selectedReport.status}</div>
                  <div><span className="font-medium">Verification Status:</span> {selectedReport.verificationStatus ?? 'Pending'}</div>
                  <div><span className="font-medium">Verification ID:</span> {selectedReport.verificationId}</div>
                </div>
              ) : (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-studentName">Student Name</Label>
                    <Input
                      id="edit-studentName"
                      value={editValues.studentName}
                      onChange={(e) => setEditValues((v) => ({ ...v, studentName: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-class">Class</Label>
                    <Input
                      id="edit-class"
                      value={editValues.class}
                      onChange={(e) => setEditValues((v) => ({ ...v, class: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-year">Year</Label>
                    <Input
                      id="edit-year"
                      type="number"
                      value={editValues.year}
                      onChange={(e) => setEditValues((v) => ({ ...v, year: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select
                      value={editValues.status}
                      onValueChange={(value) => setEditValues((v) => ({ ...v, status: value as Report['status'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Passed">Passed</SelectItem>
                        <SelectItem value="Failed">Failed</SelectItem>
                        <SelectItem value="Passed Under Condition">Passed Under Condition</SelectItem>
                        <SelectItem value="Summer School">Summer School</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Valid">Valid</SelectItem>
                        <SelectItem value="Invalid">Invalid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Verification Status</Label>
                    <Select
                      value={editValues.verificationStatus}
                      onValueChange={(value) => setEditValues((v) => ({ ...v, verificationStatus: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select verification status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Valid">Valid</SelectItem>
                        <SelectItem value="Invalid">Invalid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter>
            {actionsMode === 'edit' ? (
              <Button onClick={handleSaveEdit} disabled={isSaving || !selectedReport || !editValues.studentName || !editValues.class || !editValues.status}>
                Save Changes
              </Button>
            ) : null}
          </DialogFooter>

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete report?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the report and its uploaded file.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    if (!selectedReport) return;
                    setDeleteOpen(false);
                    setActionsOpen(false);
                    if (isDeleting) return;
                    await handleDelete(selectedReport);
                    setSelectedReport(null);
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogContent>
      </Dialog>
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
