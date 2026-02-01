"use client";

import React from "react";

import { useState } from "react";
import { useWeb3 } from "@/lib/web3-context";
import { PropertyRegistryContract, getStatusLabel, PropertyStatus } from "@/lib/contract";
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
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Shield,
  MapPin,
  Clock,
  User,
  Home,
  Ruler,
  AlertTriangle,
} from "lucide-react";

interface VerifyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PropertyResult {
  propertyId: string;
  owner: string;
  ipfsHash: string;
  location: string;
  area: string;
  propertyType: string;
  timestamp: number;
  status: PropertyStatus;
  exists: boolean;
}

export function VerifyModal({ open, onOpenChange }: VerifyModalProps) {
  const { signer, provider } = useWeb3();
  const [propertyId, setPropertyId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PropertyResult | null>(null);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId.trim()) return;

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const contract = new PropertyRegistryContract(signer || provider || null);
      
      // Pass the alphanumeric ID directly
      const property = await contract.getPropertyDetails(propertyId.trim());
      
      if (property) {
        // Format property ID as alphanumeric
        const numId = Number(property.propertyId);
        const formattedId = `PROP${String(numId).padStart(3, "0")}`;
        
        setResult({
          propertyId: formattedId,
          owner: property.owner,
          ipfsHash: property.ipfsHash,
          location: property.location,
          area: property.area.toString(),
          propertyType: property.propertyType,
          timestamp: Number(property.registrationDate) * 1000,
          status: property.status,
          exists: true,
        });
      } else {
        setResult({
          propertyId: propertyId.toUpperCase(),
          owner: "",
          ipfsHash: "",
          location: "",
          area: "",
          propertyType: "",
          timestamp: 0,
          status: PropertyStatus.Active,
          exists: false,
        });
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Failed to verify property. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const resetSearch = () => {
    setPropertyId("");
    setResult(null);
    setError("");
  };

  const handleClose = () => {
    resetSearch();
    onOpenChange(false);
  };

  const getIpfsUrl = (hash: string) => {
    const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY;
    if (gateway && gateway.includes(".")) {
      return `https://${gateway}/ipfs/${hash}`;
    }
    return `https://gateway.pinata.cloud/ipfs/${hash}?pinataGatewayToken=${gateway}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Verify Property on Blockchain
          </DialogTitle>
          <DialogDescription>
            Enter a Property ID to check its registration status and ownership
            details on the blockchain.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="propertyId">Property ID</Label>
            <div className="flex gap-2">
              <Input
                id="propertyId"
                placeholder="e.g., PROP001, PROP002"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !propertyId.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </form>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {result.exists ? (
              <>
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-primary">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Property Verified on Blockchain</span>
                </div>

                {result.status === PropertyStatus.Blocked && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">This property is blocked due to dispute</span>
                  </div>
                )}

                <div className="space-y-3 rounded-lg border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Property ID</p>
                      <p className="font-mono text-sm">#{result.propertyId}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Owner Address</p>
                      <p className="font-mono text-sm">{formatAddress(result.owner)}</p>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() =>
                          window.open(
                            `https://sepolia.etherscan.io/address/${result.owner}`,
                            "_blank"
                          )
                        }
                      >
                        View on Etherscan
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm">{result.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Ruler className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Area</p>
                      <p className="text-sm">{result.area} sq.m</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Home className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Property Type</p>
                      <p className="text-sm">{result.propertyType}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Registered On</p>
                      <p className="text-sm">{formatDate(result.timestamp)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className={`text-sm font-medium ${result.status === PropertyStatus.Blocked ? "text-destructive" : "text-primary"}`}>
                        {getStatusLabel(result.status)}
                      </p>
                    </div>
                  </div>

                  {result.ipfsHash && (
                    <div className="flex items-start gap-3">
                      <ExternalLink className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">IPFS Document Hash</p>
                        <p className="break-all font-mono text-xs">{result.ipfsHash}</p>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={() => window.open(getIpfsUrl(result.ipfsHash), "_blank")}
                        >
                          View on IPFS
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-lg bg-muted p-3 text-center text-sm">
                  <p className="text-muted-foreground">
                    This property record is stored on the{" "}
                    <span className="font-medium text-foreground">Ethereum Sepolia</span>{" "}
                    testnet and{" "}
                    <span className="font-medium text-foreground">IPFS</span>.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-6">
                <XCircle className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium">Property Not Found</p>
                  <p className="text-sm text-muted-foreground">
                    No property with ID &quot;{propertyId}&quot; is registered on the
                    blockchain.
                  </p>
                </div>
              </div>
            )}

            <Button variant="outline" onClick={resetSearch} className="w-full bg-transparent">
              Search Another Property
            </Button>
          </div>
        )}

        {!result && !error && (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-center text-sm text-muted-foreground">
              <strong>Demo Mode:</strong> Try PROP001, PROP002, or PROP003 for samples, or enter the ID of a property you registered.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
