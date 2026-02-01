"use client";

import useSWR from "swr";
import { useState } from "react";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { ProblemSection } from "@/components/problem-section";
import { SolutionSection } from "@/components/solution-section";
import { FlowSection } from "@/components/flow-section";
import { ComparisonSection } from "@/components/comparison-section";
import { FeaturesSection } from "@/components/features-section";
import { BenefitsSection } from "@/components/benefits-section";
import { Footer } from "@/components/footer";
import { VerifyModal } from "@/components/verify-modal";
import { GetStartedModal } from "@/components/get-started-modal";
import { RegisterPropertyModal } from "@/components/register-property-modal";
import { Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data, isLoading, error } = useSWR("/api/data", fetcher);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [getStartedModalOpen, setGetStartedModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading PropertyChain...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load data</p>
          <p className="text-muted-foreground text-sm">Please refresh the page</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <Header
        onVerifyClick={() => setVerifyModalOpen(true)}
        onGetStartedClick={() => setGetStartedModalOpen(true)}
        onRegisterClick={() => setRegisterModalOpen(true)}
      />
      <Hero
        stats={data?.stats || []}
        onVerifyClick={() => setVerifyModalOpen(true)}
        onRegisterClick={() => setRegisterModalOpen(true)}
      />
      <section id="problem">
        <ProblemSection problems={data?.problems || []} />
      </section>
      <section id="solution">
        <SolutionSection />
      </section>
      <section id="flow">
        <FlowSection steps={data?.steps || []} />
      </section>
      <ComparisonSection comparisons={data?.comparisons || []} />
      <section id="features">
        <FeaturesSection features={data?.features || []} />
      </section>
      <BenefitsSection benefits={data?.benefits || []} />
      <Footer />

      <VerifyModal
        open={verifyModalOpen}
        onOpenChange={setVerifyModalOpen}
      />
      <GetStartedModal
        open={getStartedModalOpen}
        onOpenChange={setGetStartedModalOpen}
        onVerifyClick={() => setVerifyModalOpen(true)}
      />
      <RegisterPropertyModal
        open={registerModalOpen}
        onOpenChange={setRegisterModalOpen}
      />
    </main>
  );
}
