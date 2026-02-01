"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

// Sepolia Testnet Configuration
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";
export const SEPOLIA_CONFIG = {
  chainId: SEPOLIA_CHAIN_ID_HEX,
  chainName: "Sepolia Testnet",
  nativeCurrency: {
    name: "SepoliaETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.sepolia.org"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};

// Polygon Amoy Configuration
const AMOY_CHAIN_ID = 137;
const AMOY_CHAIN_ID_HEX = "0x89";
const AMOY_CONFIG = {
  chainId: AMOY_CHAIN_ID_HEX,
  chainName: "Polygon Amoy",
  nativeCurrency: {
    name: "Amoy",
    symbol: "AMOY",
    decimals: 18,
  },
  rpcUrls: ["https://polygon-rpc.com"],
  blockExplorerUrls: ["https://polygonscan.com"],
};

interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  isConnecting: boolean;
  isConnected: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToSepolia: () => Promise<void>;
  switchToAmoy: () => Promise<void>;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  chainId: null,
  isConnecting: false,
  isConnected: false,
  provider: null,
  signer: null,
  connect: async () => {},
  disconnect: () => {},
  switchToSepolia: async () => {},
  switchToAmoy: async () => {},
  error: null,
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rpcUrl, setRpcUrl] = useState<string | null>(null);

  // Fetch RPC URL from server
  useEffect(() => {
    fetch("/api/blockchain?action=getRpcUrl")
      .then((res) => res.json())
      .then((data) => {
        if (data.rpcUrl) {
          setRpcUrl(data.rpcUrl);
        }
      })
      .catch(console.error);
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("Please install MetaMask to use this feature");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const network = await browserProvider.getNetwork();
      const signerInstance = await browserProvider.getSigner();

      setProvider(browserProvider);
      setSigner(signerInstance);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect wallet";
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setChainId(null);
    setProvider(null);
    setSigner(null);
    setError(null);
  }, []);

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
      });
    } catch (switchError: unknown) {
      // Chain not added, add it
      if (switchError && typeof switchError === 'object' && 'code' in switchError && switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                ...SEPOLIA_CONFIG,
                rpcUrls: rpcUrl ? [rpcUrl, ...SEPOLIA_CONFIG.rpcUrls] : SEPOLIA_CONFIG.rpcUrls,
              },
            ],
          });
        } catch {
          setError("Failed to add Sepolia network");
        }
      }
    }
  }, [rpcUrl]);

  const switchToAmoy = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: AMOY_CHAIN_ID_HEX }],
      });
    } catch (switchError: unknown) {
      // Chain not added, add it
      if (switchError && typeof switchError === 'object' && 'code' in switchError && switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                ...AMOY_CONFIG,
                rpcUrls: rpcUrl ? [rpcUrl, ...AMOY_CONFIG.rpcUrls] : AMOY_CONFIG.rpcUrls,
              },
            ],
          });
        } catch {
          setError("Failed to add Amoy network");
        }
      }
    }
  }, [rpcUrl]);

  // Listen for account and chain changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      setChainId(parseInt(chainIdHex, 16));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, [disconnect]);

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        isConnecting,
        isConnected: !!account,
        provider,
        signer,
        connect,
        disconnect,
        switchToSepolia,
        switchToSepolia,
        error,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3 = () => useContext(Web3Context);

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}
