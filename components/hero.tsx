"use client";

import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, Wallet } from "lucide-react";
import { useWeb3 } from "@/lib/web3-context";
import Link from "next/link";

interface Stat {
  value: string;
  label: string;
}

interface HeroProps {
  stats: Stat[];
  onVerifyClick: () => void;
  onRegisterClick: () => void;
}

export function Hero({ stats, onVerifyClick, onRegisterClick }: HeroProps) {
  const { isConnected, connect, isConnecting } = useWeb3();
  const scrollToFlow = () => {
    const element = document.getElementById("flow");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
    >
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--background))]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-secondary/50 mb-8">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            Blockchain-Powered Security
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance mb-6">
          <span className="text-foreground">Decentralized</span>
          <br />
          <span className="text-primary">Property Registry</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
          We use blockchain to lock property records so no one can secretly
          change them. Make existing property documents tamper-proof without
          changing legal authority.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isConnected ? (
            <>
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" onClick={onVerifyClick}>
                Verify Property
              </Button>
            </>
          ) : (
            <>
              <Button size="lg" className="gap-2" onClick={connect} disabled={isConnecting}>
                <Wallet className="w-4 h-4" />
                {isConnecting ? "Connecting..." : "Connect Wallet to Start"}
              </Button>
              <Button size="lg" variant="outline" onClick={onVerifyClick}>
                Verify Property
              </Button>
            </>
          )}
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl md:text-3xl font-bold text-primary">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
