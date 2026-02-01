"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Building2, UserCheck, Upload, Database, Search, Handshake, Type as type, LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Building2,
  UserCheck,
  Upload,
  Database,
  Search,
  Handshake,
};

interface Step {
  number: number;
  title: string;
  description: string;
  icon: string;
}

interface FlowSectionProps {
  steps: Step[];
}

export function FlowSection({ steps }: FlowSectionProps) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Simple Flow - Step by Step
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Understanding how blockchain protects your property documents in 6
            simple steps.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Steps List */}
          <div className="space-y-2">
            {steps.map((step, index) => (
              <button
                key={step.number}
                onClick={() => setActiveStep(index)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border transition-all",
                  activeStep === index
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-muted-foreground/50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                      activeStep === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {step.number}
                  </div>
                  <span
                    className={cn(
                      "font-medium",
                      activeStep === index
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Active Step Detail */}
          <div className="sticky top-24">
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  {(() => {
                    const Icon = iconMap[steps[activeStep]?.icon] || Building2;
                    return <Icon className="w-8 h-8 text-primary" />;
                  })()}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Step {steps[activeStep]?.number}
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground">
                    {steps[activeStep]?.title}
                  </h3>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {steps[activeStep]?.description}
              </p>

              {/* Visual indicator */}
              <div className="mt-8 flex gap-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      index <= activeStep ? "bg-primary" : "bg-secondary"
                    )}
                    aria-label={`Go to step ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
