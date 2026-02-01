"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, FileText, Building2, CheckCircle } from "lucide-react";

interface GetStartedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerifyClick: () => void;
}

const steps = [
  {
    icon: FileText,
    title: "Prepare Your Documents",
    description: "Have your property documents (7/12, Kharedikhat) ready for verification.",
  },
  {
    icon: Building2,
    title: "Visit Local Authority",
    description: "Government officer will verify your original documents.",
  },
  {
    icon: CheckCircle,
    title: "Get Blockchain Protected",
    description: "Your document hash is stored on blockchain for permanent protection.",
  },
];

export function GetStartedModal({ open, onOpenChange, onVerifyClick }: GetStartedModalProps) {
  const handleVerifyClick = () => {
    onOpenChange(false);
    setTimeout(() => {
      onVerifyClick();
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Get Started with PropertyChain
          </DialogTitle>
          <DialogDescription>
            Follow these simple steps to protect your property documents with blockchain technology.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {steps.map((step, index) => (
            <div key={step.title} className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <step.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Step {index + 1}</span>
                </div>
                <h4 className="font-medium text-foreground">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Already have a registered property? Verify it now to check its blockchain status.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button className="flex-1 gap-2" onClick={handleVerifyClick}>
              Verify Property
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
