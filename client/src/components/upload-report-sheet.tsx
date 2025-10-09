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
import { useFormState, useFormStatus } from "react-dom";
import { handleReportUpload } from "@/lib/actions";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const initialState = {
  message: "",
  errors: {},
  success: false,
};

function SubmitButton() {
  const { pending, action } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Upload and Generate ID
    </Button>
  );
}

export function UploadReportSheet() {
  const [state, formAction] = useFormState<any, FormData>(
    handleReportUpload,
    initialState
  );
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Upload Successful",
        description: `Report card uploaded with Verification ID: ${state.verificationId}`,
      });
      setIsOpen(false);
    } else if (state.message && !state.errors) {
      toast({
        title: "Upload Failed",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);

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
              <Label htmlFor="term" className="text-right">
                Term/Semester
              </Label>
              <Input
                id="term"
                name="term"
                placeholder="e.g., Fall"
                className="col-span-3"
              />
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
            <SubmitButton />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
