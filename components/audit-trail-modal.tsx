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
  History,
  ExternalLink,
  Loader2,
  Calendar,
  User,
  FileText,
  ArrowRight,
} from "lucide-react";

interface AuditTrailRecord {
  id: string;
  property_id: string;
  from_address: string;
  to_address: string;
  transfer_type: string;
  tx_hash: string;
  created_at: string;
}

interface AuditTrailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditTrailModal({ open, onOpenChange }: AuditTrailModalProps) {
  const [propertyId, setPropertyId] = useState("");
  const [auditRecords, setAuditRecords] = useState<AuditTrailRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId.trim()) return;

    setIsLoading(true);
    setAuditRecords([]);
    setSearched(true);

    try {
      const response = await fetch(
        `/api/properties/${encodeURIComponent(propertyId.toUpperCase())}?transfers=true`
      );
      if (!response.ok) {
        setAuditRecords([]);
        return;
      }
      const data = await response.json();
      setAuditRecords(data.transfers || []);
    } catch (error) {
      console.error("Error fetching audit trail:", error);
      setAuditRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Audit Trail
          </DialogTitle>
          <DialogDescription>
            View immutable transaction history and ownership records
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-3">
            <div>
              <Label htmlFor="propertyId">Property ID</Label>
              <div className="flex gap-2">
                <Input
                  id="propertyId"
                  placeholder="e.g., PROP001"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value.toUpperCase())}
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !propertyId.trim()}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <History className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Results */}
          {searched && (
            <div className="space-y-4">
              {auditRecords.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                  <p className="text-sm text-muted-foreground">No audit records found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Transaction History ({auditRecords.length})
                  </h3>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {auditRecords.map((record, index) => (
                      <div
                        key={record.id}
                        className="p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-sm">
                              {record.transfer_type === "sale"
                                ? "Property Sale"
                                : record.transfer_type === "transfer"
                                  ? "Ownership Transfer"
                                  : "Inheritance"}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(record.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="inline-block px-2 py-1 rounded text-xs font-medium bg-primary/20 text-primary">
                              Transaction {index + 1}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 py-2 px-2 rounded bg-muted/30 mb-3">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs font-mono">{formatAddress(record.from_address)}</span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs font-mono">{formatAddress(record.to_address)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Hash: <span className="font-mono">{record.tx_hash.slice(0, 16)}...</span>
                          </span>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() =>
                              window.open(
                                `https://sepolia.etherscan.io/tx/${record.tx_hash}`,
                                "_blank"
                              )
                            }
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-xs text-primary">
                    <p className="font-semibold mb-1">✓ Immutable Record</p>
                    <p>All transactions are permanently recorded on the blockchain and IPFS</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
