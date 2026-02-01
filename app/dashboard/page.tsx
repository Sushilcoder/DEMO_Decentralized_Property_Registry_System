"use client";

import React, { useState } from "react";
import { useWeb3 } from "@/lib/web3-context";
import { Dashboard } from "@/components/dashboard";
import { VerifyModal } from "@/components/verify-modal";
import { RegisterPropertyModal } from "@/components/register-property-modal";
import { TransferModal } from "@/components/transfer-modal";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { isConnected, account, connect, isConnecting } = useWeb3();
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">PropertyChain Dashboard</h1>
            <p className="text-muted-foreground">Connect your wallet to access the dashboard</p>
          </div>
          <Button onClick={connect} disabled={isConnecting} size="lg">
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <div className="text-sm text-muted-foreground">
            Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
          </div>
        </div>
      </div>

      <Dashboard
        onRegisterClick={() => setRegisterModalOpen(true)}
        onVerifyClick={() => setVerifyModalOpen(true)}
        onTransferClick={() => setTransferModalOpen(true)}
      />

      <VerifyModal open={verifyModalOpen} onOpenChange={setVerifyModalOpen} />
      <RegisterPropertyModal open={registerModalOpen} onOpenChange={setRegisterModalOpen} />
      <TransferModal open={transferModalOpen} onOpenChange={setTransferModalOpen} />
    </div>
  );
}
