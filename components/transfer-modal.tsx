"use client";

import React, { useState } from "react";
import { useWeb3 } from "@/lib/web3-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Send,
  ThumbsUp,
  DollarSign,
} from "lucide-react";

interface TransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TransferStep = "select" | "details" | "approval" | "payment" | "completed";

export function TransferModal({ open, onOpenChange }: TransferModalProps) {
  const { account, isConnected } = useWeb3();
  const [step, setStep] = useState<TransferStep>("select");
  const [propertyId, setPropertyId] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [price, setPrice] = useState("");
  const [transferId, setTransferId] = useState<number | null>(null);

  const handleInitiateTransfer = () => {
    if (!propertyId || !buyerAddress || !price) return;
    setTransferId(Math.floor(Math.random() * 10000));
    setStep("details");
  };

  const handleApproveTransfer = () => {
    setStep("payment");
  };

  const handleCompleteTransfer = () => {
    setStep("completed");
  };

  const resetTransfer = () => {
    setStep("select");
    setPropertyId("");
    setBuyerAddress("");
    setPrice("");
    setTransferId(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Property Transfer Workflow</DialogTitle>
          <DialogDescription>
            Complete the steps to transfer property ownership
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-6">
          {(["select", "details", "approval", "payment", "completed"] as const).map(
            (s, idx) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s
                      ? "bg-primary text-primary-foreground"
                      : step > s
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s ? "✓" : idx + 1}
                </div>
                {idx < 4 && <div className="h-0.5 w-6 bg-muted" />}
              </div>
            )
          )}
        </div>

        {/* Step: Select Property */}
        {step === "select" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Initiate Transfer</CardTitle>
                <CardDescription>Select the property to transfer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="property-id">Property ID</Label>
                  <Input
                    id="property-id"
                    placeholder="e.g., PROP001"
                    value={propertyId}
                    onChange={(e) => setPropertyId(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="buyer-address">Buyer Wallet Address</Label>
                  <Input
                    id="buyer-address"
                    placeholder="0x..."
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (ETH)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <Button onClick={handleInitiateTransfer} className="w-full gap-2">
                  <Send className="w-4 h-4" />
                  Initiate Transfer
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step: Transfer Details */}
        {step === "details" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Transfer Details</CardTitle>
                <CardDescription>Waiting for registrar approval</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TransferDetailRow label="Property ID" value={propertyId} />
                <TransferDetailRow label="Buyer Address" value={buyerAddress.slice(0, 6) + "..." + buyerAddress.slice(-4)} />
                <TransferDetailRow label="Price" value={`${price} ETH`} />
                <TransferDetailRow label="Transfer ID" value={`#${transferId}`} />
                <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                  <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Awaiting Registrar Approval</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      The registrar will review and approve this transfer
                    </p>
                  </div>
                </div>
                <Button onClick={() => setStep("approval")} className="w-full gap-2">
                  <ThumbsUp className="w-4 h-4" />
                  Next: Approval (Simulated)
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step: Approval */}
        {step === "approval" && (
          <div className="space-y-4">
            <Card className="border-green-500/50 bg-green-500/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Transfer Approved
                </CardTitle>
                <CardDescription>Registrar has approved the transfer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TransferDetailRow label="Status" value="Approved" />
                <TransferDetailRow label="Approved By" value="0x1234...5678" />
                <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Ready for Payment</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Buyer needs to complete payment to finalize the transfer
                    </p>
                  </div>
                </div>
                <Button onClick={handleApproveTransfer} className="w-full gap-2">
                  <DollarSign className="w-4 h-4" />
                  Next: Complete Payment
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step: Payment */}
        {step === "payment" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Confirmation</CardTitle>
                <CardDescription>Confirm payment to complete transfer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Property Value</span>
                    <span className="font-medium">{price} ETH</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-muted-foreground">Transfer Fee (2%)</span>
                    <span className="font-medium">{(parseFloat(price) * 0.02).toFixed(4)} ETH</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2 font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary">{(parseFloat(price) * 1.02).toFixed(4)} ETH</span>
                  </div>
                </div>
                <Button onClick={handleCompleteTransfer} className="w-full gap-2">
                  <DollarSign className="w-4 h-4" />
                  Complete Payment
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step: Completed */}
        {step === "completed" && (
          <div className="space-y-4">
            <Card className="border-green-500/50 bg-green-500/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Transfer Completed!
                </CardTitle>
                <CardDescription>Property ownership has been successfully transferred</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <TransferDetailRow label="Property" value={propertyId} />
                  <TransferDetailRow label="New Owner" value={buyerAddress.slice(0, 6) + "..." + buyerAddress.slice(-4)} />
                  <TransferDetailRow label="Transaction ID" value={`0x${Math.random().toString(16).slice(2)}`} />
                  <TransferDetailRow label="Amount" value={`${price} ETH`} />
                </div>
                <Button onClick={resetTransfer} className="w-full">
                  Start New Transfer
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TransferDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-medium">{value}</span>
    </div>
  );
}
