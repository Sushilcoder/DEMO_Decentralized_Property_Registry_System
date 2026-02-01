"use client";

import { useWeb3, SEPOLIA_CHAIN_ID } from "@/lib/web3-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, LogOut, Copy, ExternalLink, AlertCircle } from "lucide-react";
import { useState } from "react";

export function WalletButton() {
  const {
    account,
    chainId,
    isConnecting,
    isConnected,
    connect,
    disconnect,
    switchToSepolia,
    error,
  } = useWeb3();
  const [copied, setCopied] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openEtherscan = () => {
    if (account) {
      const baseUrl = chainId === SEPOLIA_CHAIN_ID 
        ? "https://sepolia.etherscan.io" 
        : "https://etherscan.io";
      window.open(`${baseUrl}/address/${account}`, "_blank");
    }
  };

  const switchToAmoy = () => {
    // Placeholder for switchToAmoy functionality
    console.log("Switch to Amoy");
  };

  const openExplorer = () => {
    if (account) {
      window.open(`https://polygonscan.com/address/${account}`, "_blank");
    }
  };

  const isWrongNetwork = isConnected && chainId !== SEPOLIA_CHAIN_ID;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button
          onClick={connect}
          disabled={isConnecting}
          className="gap-2 bg-transparent"
          variant="outline"
        >
          <Wallet className="h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
        {error && (
          <span className="text-xs text-destructive">{error}</span>
        )}
      </div>
    );
  }

  if (isWrongNetwork) {
    return (
      <Button
        onClick={switchToSepolia}
        variant="destructive"
        className="gap-2"
      >
        <AlertCircle className="h-4 w-4" />
        Switch to Sepolia
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <div className="h-2 w-2 rounded-full bg-primary" />
          {formatAddress(account!)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={copyAddress}>
          <Copy className="mr-2 h-4 w-4" />
          {copied ? "Copied!" : "Copy Address"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openEtherscan}>
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Etherscan
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnect} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
