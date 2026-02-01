"use client";

import React from "react"

import { useState } from "react";
import { useWeb3 } from "@/lib/web3-context";
import { PropertyRegistryContract } from "@/lib/contract";
import { registerProperty as saveProperty } from "@/lib/property-store";
import { generatePropertyId } from "@/lib/property-utils";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileCheck,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface RegisterPropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "form" | "uploading" | "registering" | "success" | "error";

interface FormData {
  propertyId: string;
  ownerName: string;
  location: string;
  area: string;
  surveyNumber: string;
  documentType: string;
  description: string;
}

export function RegisterPropertyModal({
  open,
  onOpenChange,
}: RegisterPropertyModalProps) {
  const { isConnected, signer, account } = useWeb3();
  const [step, setStep] = useState<Step>("form");
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>({
    propertyId: "",
    ownerName: "",
    location: "",
    area: "",
    surveyNumber: "",
    documentType: "7/12",
    description: "",
  });
  const [ipfsHash, setIpfsHash] = useState("");
  const [txHash, setTxHash] = useState("");
  const [registeredPropertyId, setRegisteredPropertyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !signer) {
      setError("Please connect your wallet first");
      setStep("error");
      return;
    }

    try {
      // Step 1: Upload to IPFS
      setStep("uploading");

      const uploadFormData = new FormData();
      if (file) {
        uploadFormData.append("file", file);
        uploadFormData.append("metadata", `property-${formData.propertyId}`);
      }

      // Upload document file to IPFS
      let documentHash = "";
      if (file) {
        const fileResponse = await fetch("/api/pinata", {
          method: "POST",
          body: uploadFormData,
        });

        if (!fileResponse.ok) {
          throw new Error("Failed to upload document to IPFS");
        }

        const fileData = await fileResponse.json();
        documentHash = fileData.IpfsHash;
      }

      // Upload metadata to IPFS
      const metadataForm = new FormData();
      metadataForm.append(
        "jsonData",
        JSON.stringify({
          ...formData,
          ownerAddress: account,
          documentHash,
          registrationDate: new Date().toISOString(),
        })
      );
      metadataForm.append("metadata", `metadata-${formData.propertyId}`);

      const metadataResponse = await fetch("/api/pinata", {
        method: "POST",
        body: metadataForm,
      });

      if (!metadataResponse.ok) {
        throw new Error("Failed to upload metadata to IPFS");
      }

      const metadataResult = await metadataResponse.json();
      setIpfsHash(metadataResult.IpfsHash);

      // Step 2: Register on blockchain
      setStep("registering");

      const contract = new PropertyRegistryContract(signer);
      const tx = await contract.registerProperty(
        formData.propertyId,
        metadataResult.IpfsHash,
        formData.location
      );

      const receipt = await tx.wait();
      setTxHash(receipt.transactionHash);

      // Generate unique property ID
      const propertyId = await generatePropertyId();

      // Save property to Supabase database
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: propertyId,
          owner_address: account,
          owner_name: formData.ownerName,
          location: formData.location,
          area: parseFloat(formData.area) || 0,
          property_type: formData.documentType,
          survey_number: formData.surveyNumber,
          description: formData.description,
          ipfs_hash: metadataResult.IpfsHash,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save property to database");
      }

      setRegisteredPropertyId(propertyId);
      setStep("success");
    } catch (err: unknown) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Registration failed");
      setStep("error");
    }
  };

  const resetForm = () => {
    setStep("form");
    setFile(null);
    setFormData({
      propertyId: "",
      ownerName: "",
      location: "",
      area: "",
      surveyNumber: "",
      documentType: "7/12",
      description: "",
    });
    setIpfsHash("");
    setTxHash("");
    setRegisteredPropertyId(null);
    setError("");
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register Property on Blockchain</DialogTitle>
          <DialogDescription>
            Upload your property documents to IPFS and register ownership on the
            blockchain.
          </DialogDescription>
        </DialogHeader>

        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isConnected && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mr-2 inline h-4 w-4" />
                Please connect your wallet to register property
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyId">Property ID</Label>
                <Input
                  id="propertyId"
                  placeholder="e.g., PROP004"
                  value={formData.propertyId}
                  onChange={(e) =>
                    setFormData({ ...formData, propertyId: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surveyNumber">Survey Number</Label>
                <Input
                  id="surveyNumber"
                  placeholder="e.g., 123/A"
                  value={formData.surveyNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, surveyNumber: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input
                id="ownerName"
                placeholder="Full legal name"
                value={formData.ownerName}
                onChange={(e) =>
                  setFormData({ ...formData, ownerName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Village, District, State"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                <Input
                  id="area"
                  placeholder="e.g., 2.5 acres"
                  value={formData.area}
                  onChange={(e) =>
                    setFormData({ ...formData, area: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type</Label>
                <Select
                  value={formData.documentType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, documentType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7/12">7/12 Extract</SelectItem>
                    <SelectItem value="8A">8A Extract</SelectItem>
                    <SelectItem value="Sale Deed">Sale Deed</SelectItem>
                    <SelectItem value="Mutation">Mutation Entry</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Additional Details</Label>
              <Textarea
                id="description"
                placeholder="Any additional property details..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">Property Document (PDF/Image)</Label>
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-4">
                <input
                  id="document"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="document"
                  className="flex cursor-pointer flex-col items-center gap-2 text-center"
                >
                  {file ? (
                    <>
                      <FileCheck className="h-8 w-8 text-primary" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        Click to change file
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Click to upload document
                      </span>
                      <span className="text-xs text-muted-foreground">
                        PDF, JPG, PNG up to 10MB
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!isConnected}
            >
              Register on Blockchain
            </Button>
          </form>
        )}

        {step === "uploading" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-semibold">Uploading to IPFS...</p>
              <p className="text-sm text-muted-foreground">
                Your documents are being stored on the decentralized network
              </p>
            </div>
          </div>
        )}

        {step === "registering" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-semibold">Registering on Blockchain...</p>
              <p className="text-sm text-muted-foreground">
                Please confirm the transaction in MetaMask
              </p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">Registration Successful!</p>
              <p className="text-sm text-muted-foreground">
                Your property documents are stored on IPFS
              </p>
            </div>

            <div className="rounded-lg border border-primary/50 bg-primary/10 p-3 text-sm text-primary">
              <CheckCircle className="mr-2 inline h-4 w-4" />
              Property ID: <strong>{registeredPropertyId}</strong> - You can now verify this property using this ID
            </div>

            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
              <AlertCircle className="mr-2 inline h-4 w-4" />
              Demo Mode: Transaction is simulated. Deploy a smart contract for real blockchain registration.
            </div>

            <div className="w-full space-y-3 rounded-lg bg-muted p-4">
              <div>
                <p className="text-xs text-muted-foreground">Property ID</p>
                <p className="font-mono text-sm font-bold text-primary">{registeredPropertyId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">IPFS Hash (Real - Stored on Pinata)</p>
                <p className="break-all font-mono text-sm">{ipfsHash}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Simulated Transaction Hash</p>
                <p className="break-all font-mono text-sm">{txHash}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY;
                  let url: string;
                  if (gateway && gateway.includes(".")) {
                    url = `https://${gateway}/ipfs/${ipfsHash}`;
                  } else {
                    url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}?pinataGatewayToken=${gateway}`;
                  }
                  window.open(url, "_blank");
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View on IPFS
              </Button>
            </div>

            <Button onClick={resetForm} className="w-full">
              Register Another Property
            </Button>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">Registration Failed</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button onClick={resetForm} variant="outline">
              Try Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
