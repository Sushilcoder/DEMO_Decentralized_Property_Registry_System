import { Lock, BookOpen } from "lucide-react";

export function SolutionSection() {
  return (
    <section className="py-24 px-6 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Our Solution
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Think of blockchain as a digital lock + history book that cannot be
            erased.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-foreground">
                  Digital Lock
                </h3>
                <p className="text-muted-foreground">
                  Once recorded, property documents cannot be altered or deleted
                  by anyone, ensuring permanent security.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-foreground">
                  History Book
                </h3>
                <p className="text-muted-foreground">
                  Every transaction is time-stamped and recorded, creating an
                  auditable chain of ownership history.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
              <p className="text-sm text-foreground font-medium mb-1">
                Key Clarification
              </p>
              <p className="text-sm text-muted-foreground">
                Blockchain does NOT replace 7/12 — it protects and verifies
                7/12. Government stays in control.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="bg-card border border-border rounded-2xl p-8">
              <h4 className="font-semibold mb-4 text-center text-card-foreground">
                Real-Life Example
              </h4>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>Imagine:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>You put your property papers in a bank locker</li>
                  <li>Everyone can check locker number</li>
                  <li>But only government can put papers inside</li>
                </ul>
                <p className="font-medium text-primary">
                  {"That's what blockchain does digitally."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
