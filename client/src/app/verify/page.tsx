'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { verifyReportId } from '@/lib/actions';
import { CheckCircle2, HelpCircle, Hourglass, Loader2, ScanLine, XCircle } from 'lucide-react';
import { useState } from 'react';

type VerificationStatus = 'idle' | 'loading' | 'valid' | 'invalid' | 'pending';

interface VerificationResult {
  studentName?: string;
  class?: string;
  status?: string;
  year?: number;
}

export default function VerifyPage() {
  const [verificationId, setVerificationId] = useState('');
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationId) return;

    setStatus('loading');
    const response = await verifyReportId(verificationId);
    setStatus(response.status);
    setResult(response.data);
  };

  const ResultDisplay = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="font-medium">Verifying...</p>
          </div>
        );
      case 'valid':
        return (
          <div className="flex flex-col items-center gap-4 text-green-600 dark:text-green-500">
            <CheckCircle2 className="h-12 w-12" />
            <h3 className="font-headline text-2xl font-semibold">Report Card is Valid</h3>
            {result && (
              <div className="text-center text-foreground bg-secondary/50 p-4 rounded-lg w-full">
                <p><strong>Student:</strong> {result.studentName}</p>
                <p><strong>Class:</strong> {result.class}</p>
                <p><strong>Status:</strong> {result.status}</p>
                <p><strong>Year:</strong> {result.year}</p>
              </div>
            )}
          </div>
        );
      case 'invalid':
        return (
          <div className="flex flex-col items-center gap-4 text-destructive">
            <XCircle className="h-12 w-12" />
            <h3 className="font-headline text-2xl font-semibold">Report Card is Invalid</h3>
            <p className="text-sm text-muted-foreground">This verification ID does not match any record in our system.</p>
          </div>
        );
      case 'pending':
          return (
            <div className="flex flex-col items-center gap-4 text-amber-600 dark:text-amber-500">
              <Hourglass className="h-12 w-12" />
              <h3 className="font-headline text-2xl font-semibold">Verification Pending</h3>
              <p className="text-sm text-muted-foreground">This report card has been uploaded but is awaiting final approval.</p>
            </div>
          );
      case 'idle':
      default:
        return (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <HelpCircle className="h-12 w-12" />
              <p className="font-medium">Enter a verification ID to begin.</p>
            </div>
          );
    }
  };


  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <Card className="w-full shadow-lg">
          <form onSubmit={handleVerify}>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Verify a Report Card</CardTitle>
              <CardDescription>
                Enter the unique ID found on the report card or scan the QR code.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-id">Verification ID</Label>
                <Input
                  id="verification-id"
                  placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                  required
                  value={verificationId}
                  onChange={(e) => setVerificationId(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={status === 'loading'}>
                {status === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Verify
              </Button>
              <Button variant="outline" className="w-full" type="button">
                <ScanLine className="mr-2 h-4 w-4" />
                Scan QR Code
              </Button>
            </CardContent>
          </form>
        </Card>
        
        <div className="mt-8 md:mt-0 p-8 border-2 border-dashed rounded-lg min-h-[300px] flex items-center justify-center bg-card">
          <ResultDisplay />
        </div>
      </div>
    </div>
  );
}
