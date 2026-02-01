"use client";

import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
} from "lucide-react";
import { useWeb3 } from "@/lib/web3-context";
import { PropertyRegistryContract } from "@/lib/contract";

interface DisputedProperty {
  id: string;
  property_id: string;
  location: string;
  owner_name: string;
  status: number;
  dispute_reason?: string;
  created_at: string;
}

interface ManageDisputesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageDisputesModal({ open, onOpenChange }: ManageDisputesModalProps) {
  const { signer, account } = useWeb3();
  const [disputes, setDisputes] = useState<DisputedProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [action, setAction] = useState<"block" | "resolve">("block");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) {
      fetchDisputedProperties();
    }
  }, [open]);

  const fetchDisputedProperties = async () => {
    try {
      const response = await fetch("/api/properties?status=blocked");
      if (!response.ok) return;
      const data = await response.json();
      setDisputes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching disputed properties:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty || !reason.trim()) return;

    setIsLoading(true);
    setMessage("");

    try {
      const contract = new PropertyRegistryContract(signer);
      
      if (action === "block") {
        // Block the property due to dispute
        await contract.blockDisputedProperty(selectedProperty, reason);
        setMessage("Property blocked due to dispute successfully");
      } else {
        // Resolve dispute by unblocking
        const response = await fetch(`/api/properties?propertyId=${selectedProperty}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: 0 }), // 0 = active
        });
        
        if (response.ok) {
          setMessage("Dispute resolved successfully");
        }
      }

      // Refresh disputes list
      await fetchDisputedProperties();
      setSelectedProperty("");
      setReason("");
      setAction("block");

      setTimeout(() => {
        setMessage("");
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error("Error managing dispute:", error);
      setMessage("Failed to manage dispute. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Manage Disputes
          </DialogTitle>
          <DialogDescription>
            Review and manage disputed properties
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Disputed Properties List */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Disputed Properties</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3 bg-muted/30">
              {disputes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No disputed properties</p>
              ) : (
                disputes.map((property) => (
                  <div
                    key={property.property_id}
                    className="flex items-center justify-between p-2 rounded border border-destructive/30 bg-destructive/10"
                  >
                    <div>
                      <p className="font-medium text-sm">{property.property_id}</p>
                      <p className="text-xs text-muted-foreground">{property.location}</p>
                    </div>
                    <Badge className="bg-destructive text-white">Blocked</Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="property">Select Property</Label>
              <Input
                id="property"
                placeholder="Enter Property ID (e.g., PROP001)"
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value.toUpperCase())}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="action">Action</Label>
              <Select value={action} onValueChange={(value) => setAction(value as "block" | "resolve")}>
                <SelectTrigger id="action" disabled={isLoading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="block">Block Property (Dispute)</SelectItem>
                  <SelectItem value="resolve">Resolve Dispute (Unblock)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reason">Reason / Notes</Label>
              <textarea
                id="reason"
                className="w-full p-2 border rounded-md bg-background text-foreground min-h-[80px]"
                placeholder={
                  action === "block"
                    ? "Describe the dispute reason..."
                    : "Explain why dispute is resolved..."
                }
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {message && (
              <div className={`p-3 rounded-md text-sm ${
                message.includes("successfully")
                  ? "bg-green-500/20 text-green-700"
                  : "bg-red-500/20 text-red-700"
              }`}>
                {message}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading || !selectedProperty || !reason.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : action === "block" ? (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Block Property
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Resolve Dispute
                </>
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Badge } from "@/components/ui/badge";
