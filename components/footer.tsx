import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-bold text-foreground">PropertyChain</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span>Hackathon Project</span>
            <span className="hidden sm:inline">•</span>
            <span>Blockchain Land Registry</span>
            <span className="hidden sm:inline">•</span>
            <span>India 2026</span>
          </div>

          <div className="text-sm text-muted-foreground">
            Built with blockchain technology
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-xs text-muted-foreground">
          <p>
            This project aligns with current government pilots in Andhra
            Pradesh, Kerala, and global blockchain experiments in land records
            (Sweden, Georgia, UAE).
          </p>
        </div>
      </div>
    </footer>
  );
}
