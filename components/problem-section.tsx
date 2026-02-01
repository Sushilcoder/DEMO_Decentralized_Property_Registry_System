"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileWarning, Clock, FileX, AlertTriangle, Type as type, LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  FileWarning,
  FileX,
  Clock,
  AlertTriangle,
};

interface Problem {
  id: number;
  icon: string;
  title: string;
  description: string;
}

interface ProblemSectionProps {
  problems: Problem[];
}

export function ProblemSection({ problems }: ProblemSectionProps) {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            What Problem Are We Solving?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Today&apos;s property record system is plagued with issues that lead to
            fraud, disputes, and inefficiency.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem) => {
            const Icon = iconMap[problem.icon] || FileWarning;
            return (
              <Card
                key={problem.id}
                className="bg-card border-border hover:border-primary/50 transition-colors"
              >
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-destructive" />
                  </div>
                  <h3 className="font-semibold mb-2 text-card-foreground">
                    {problem.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {problem.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
