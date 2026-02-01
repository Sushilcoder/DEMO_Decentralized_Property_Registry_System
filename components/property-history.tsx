"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, AlertCircle, Lock, User } from "lucide-react";

interface HistoryEntry {
  timestamp: number;
  action: "registered" | "transferred" | "blocked" | "unblocked" | "verified";
  actor: string;
  details: string;
  txHash: string;
}

interface PropertyHistoryProps {
  propertyId: string;
  history: HistoryEntry[];
}

export function PropertyHistory({ propertyId, history }: PropertyHistoryProps) {
  const getActionIcon = (action: HistoryEntry["action"]) => {
    switch (action) {
      case "registered":
        return <FileText className="w-4 h-4" />;
      case "transferred":
        return <User className="w-4 h-4" />;
      case "blocked":
        return <AlertCircle className="w-4 h-4" />;
      case "unblocked":
        return <CheckCircle className="w-4 h-4" />;
      case "verified":
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: HistoryEntry["action"]) => {
    switch (action) {
      case "registered":
        return "bg-blue-500/20 text-blue-700";
      case "transferred":
        return "bg-purple-500/20 text-purple-700";
      case "blocked":
        return "bg-red-500/20 text-red-700";
      case "unblocked":
        return "bg-green-500/20 text-green-700";
      case "verified":
        return "bg-green-500/20 text-green-700";
    }
  };

  const getActionLabel = (action: HistoryEntry["action"]) => {
    const labels: Record<HistoryEntry["action"], string> = {
      registered: "Registered",
      transferred: "Transferred",
      blocked: "Blocked",
      unblocked: "Unblocked",
      verified: "Verified",
    };
    return labels[action];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ownership History</CardTitle>
        <CardDescription>Complete audit trail for property {propertyId}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No history available yet
            </p>
          ) : (
            <>
              {/* Timeline */}
              <div className="absolute left-4 top-4 bottom-0 w-0.5 bg-border" />

              {/* History Items */}
              {history.map((entry, idx) => (
                <div key={idx} className="relative pl-12">
                  {/* Timeline dot */}
                  <div className="absolute left-1 top-1.5 w-5 h-5 rounded-full bg-background border-2 border-primary" />

                  {/* Content */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getActionColor(entry.action)}>
                        {getActionIcon(entry.action)}
                        <span className="ml-1">{getActionLabel(entry.action)}</span>
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp * 1000).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{entry.details}</p>
                    <div className="flex gap-2">
                      <span className="text-xs text-muted-foreground">By:</span>
                      <span className="text-xs font-mono text-primary">
                        {entry.actor.slice(0, 6)}...{entry.actor.slice(-4)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs text-muted-foreground">Tx:</span>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${entry.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-primary hover:underline"
                      >
                        {entry.txHash.slice(0, 10)}...
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
