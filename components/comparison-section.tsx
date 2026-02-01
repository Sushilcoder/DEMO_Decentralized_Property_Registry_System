"use client";

import { Check, X } from "lucide-react";

interface Comparison {
  aspect: string;
  old: string;
  new: string;
}

interface ComparisonSectionProps {
  comparisons: Comparison[];
}

export function ComparisonSection({ comparisons }: ComparisonSectionProps) {
  return (
    <section id="comparison" className="py-24 px-6 bg-secondary/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            In Simple Words
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            See how our blockchain solution compares to the traditional system.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="text-left p-4 font-semibold text-card-foreground">
                  Aspect
                </th>
                <th className="text-left p-4 font-semibold text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <X className="w-4 h-4 text-destructive" />
                    Old System
                  </div>
                </th>
                <th className="text-left p-4 font-semibold text-primary">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Our System
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row, index) => (
                <tr
                  key={row.aspect}
                  className={
                    index !== comparisons.length - 1
                      ? "border-b border-border"
                      : ""
                  }
                >
                  <td className="p-4 font-medium text-foreground">
                    {row.aspect}
                  </td>
                  <td className="p-4 text-muted-foreground">{row.old}</td>
                  <td className="p-4 text-primary font-medium">{row.new}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
