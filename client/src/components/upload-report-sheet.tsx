"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { FileUp, Loader2, CheckCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { handleReportUpload } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useDispatch } from "react-redux";
import { invalidateTags } from "@/store/apiSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState = {
  message: "",
  errors: {},
  success: false,
};

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending, action } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Upload and Generate ID
    </Button>
  );
}

interface UploadReportSheetProps {
  onUploadSuccess?: () => void;
}

export function UploadReportSheet({ onUploadSuccess }: UploadReportSheetProps = {}) {
  const [state, formAction] = useActionState<any, FormData>(
    handleReportUpload,
    initialState
  );
  const { toast } = useToast();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<string>("");
  const lastSuccessVerificationIdRef = useRef<string | null>(null);
  const lastErrorMessageRef = useRef<string | null>(null);

  useEffect(() => {
    const verificationId = typeof state?.verificationId === 'string' ? state.verificationId : null;
    if (state.success && verificationId && lastSuccessVerificationIdRef.current !== verificationId) {
      lastSuccessVerificationIdRef.current = verificationId;
      toast({
        title: "Upload Successful",
        description: `Report card uploaded with Verification ID: ${verificationId}`,
      });
      setIsOpen(false);
      dispatch(invalidateTags([{ type: 'Report', id: 'LIST' }]));
      onUploadSuccess?.();
    } else if (!state.success && typeof state?.message === 'string' && state.message) {
      if (lastErrorMessageRef.current === state.message) return;
      lastErrorMessageRef.current = state.message;
      toast({
        title: "Upload Failed",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state?.success, state?.verificationId, state?.message, toast, onUploadSuccess, dispatch]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button>
          <FileUp className="mr-2 h-4 w-4" />
          Upload Report
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg">
        <form action={formAction}>
          <input type="hidden" name="status" value={status} />
          <SheetHeader>
            <SheetTitle className="font-headline">
              Upload New Report Card
            </SheetTitle>
            <SheetDescription>
              Fill in the details below and upload the report card file. A
              unique verification ID will be generated.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="studentId" className="text-right">
                Student ID
              </Label>
              <Input id="studentId" name="studentId" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="studentName" className="text-right">
                Student Name
              </Label>
              <Input
                id="studentName"
                name="studentName"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="class" className="text-right">
                Class
              </Label>
              <Input
                id="class"
                name="class"
                placeholder="e.g., 10th Grade"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Status
              </Label>
              <div className="col-span-3">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Passed">Passed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                    <SelectItem value="Passed Under Condition">Passed Under Condition</SelectItem>
                    <SelectItem value="Summer School">Summer School</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="year" className="text-right">
                Year
              </Label>
              <Input
                id="year"
                name="year"
                type="number"
                placeholder="e.g., 2024"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reportFile" className="text-right">
                File
              </Label>
              <Input
                id="reportFile"
                name="reportFile"
                type="file"
                accept="application/pdf,image/*"
                className="col-span-3"
              />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
            <SubmitButton disabled={!status} />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
