"use client";

import { ShieldCheck, Clock, Heart, Building, type LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  ShieldCheck,
  Clock,
  Heart,
  Building,
};

interface Benefit {
  id: number;
  icon: string;
  title: string;
  description: string;
}

interface BenefitsSectionProps {
  benefits: Benefit[];
}

export function BenefitsSection({ benefits }: BenefitsSectionProps) {
  return (
    <section id="benefits" className="py-24 px-6 bg-primary/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Why This Idea Is Useful
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Real benefits that make a difference for citizens, buyers, sellers,
            and the government.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit) => {
            const Icon = iconMap[benefit.icon] || ShieldCheck;
            return (
              <div key={benefit.id} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 text-foreground">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        {/* Quote/CTA */}
        <div className="mt-16 text-center">
          <blockquote className="text-xl md:text-2xl font-medium text-foreground max-w-3xl mx-auto text-pretty">
            &ldquo;We make existing property documents tamper-proof using blockchain
            without changing legal authority.&rdquo;
          </blockquote>
          <p className="mt-4 text-muted-foreground">- One-line explanation for judges</p>
        </div>
      </div>
    </section>
  );
}
