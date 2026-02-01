"use client";

import React, { useState } from "react";
import { useWeb3 } from "@/lib/web3-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, BarChart3, Lock, FileCheck, Users, AlertCircle } from "lucide-react";
import { ManageDisputesModal } from "@/components/manage-disputes-modal";
import { AuditTrailModal } from "@/components/audit-trail-modal";

interface DashboardProps {
  onRegisterClick: () => void;
  onVerifyClick: () => void;
  onTransferClick: () => void;
}

export function Dashboard({ onRegisterClick, onVerifyClick, onTransferClick }: DashboardProps) {
  const { account, isConnected } = useWeb3();
  const [userRole, setUserRole] = useState<"owner" | "registrar" | "buyer">("owner");
  const [disputesModalOpen, setDisputesModalOpen] = useState(false);
  const [auditTrailModalOpen, setAuditTrailModalOpen] = useState(false);

  const stats = {
    owner: { properties: 3, transfers: 1, disputes: 0 },
    registrar: { registered: 45, pending: 8, blocked: 2 },
    buyer: { wishlisted: 5, offers: 1, completed: 2 },
  };

  const roleStats = stats[userRole];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">PropertyChain Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "User"}
          </p>
        </div>

        {/* Role Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Your Role</CardTitle>
            <CardDescription>Choose your role to access relevant features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {(["owner", "registrar", "buyer"] as const).map((role) => (
                <Button
                  key={role}
                  variant={userRole === role ? "default" : "outline"}
                  onClick={() => setUserRole(role)}
                  className="capitalize"
                >
                  {role}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {userRole === "owner" && (
            <>
              <StatsCard
                title="My Properties"
                value={roleStats.properties}
                icon={Building2}
                description="Properties you own"
              />
              <StatsCard
                title="Active Transfers"
                value={roleStats.transfers}
                icon={FileCheck}
                description="Pending transfer requests"
              />
              <StatsCard
                title="Disputes"
                value={roleStats.disputes}
                icon={AlertCircle}
                description="Properties with disputes"
              />
            </>
          )}
          {userRole === "registrar" && (
            <>
              <StatsCard
                title="Registered"
                value={roleStats.registered}
                icon={Building2}
                description="Properties registered"
              />
              <StatsCard
                title="Pending Approvals"
                value={roleStats.pending}
                icon={Lock}
                description="Awaiting your approval"
              />
              <StatsCard
                title="Blocked Properties"
                value={roleStats.blocked}
                icon={AlertCircle}
                description="Under dispute"
              />
            </>
          )}
          {userRole === "buyer" && (
            <>
              <StatsCard
                title="Wishlisted"
                value={roleStats.wishlisted}
                icon={Building2}
                description="Properties of interest"
              />
              <StatsCard
                title="Active Offers"
                value={roleStats.offers}
                icon={FileCheck}
                description="Pending your approval"
              />
              <StatsCard
                title="Completed"
                value={roleStats.completed}
                icon={BarChart3}
                description="Successfully acquired"
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userRole === "owner" && (
                <>
                  <Button onClick={onRegisterClick} className="w-full">
                    Register New Property
                  </Button>
                  <Button onClick={onTransferClick} variant="outline" className="w-full bg-transparent">
                    Initiate Transfer
                  </Button>
                  <Button onClick={onVerifyClick} variant="outline" className="w-full bg-transparent">
                    View Property Details
                  </Button>
                </>
              )}
              {userRole === "registrar" && (
                <>
                  <Button onClick={onVerifyClick} className="w-full">
                    Review Properties
                  </Button>
                  <Button 
                    onClick={() => setDisputesModalOpen(true)}
                    variant="outline" 
                    className="w-full bg-transparent"
                  >
                    Manage Disputes
                  </Button>
                  <Button 
                    onClick={() => setAuditTrailModalOpen(true)}
                    variant="outline" 
                    className="w-full bg-transparent"
                  >
                    View Audit Trail
                  </Button>
                </>
              )}
              {userRole === "buyer" && (
                <>
                  <Button onClick={onVerifyClick} className="w-full">
                    Search Properties
                  </Button>
                  <Button onClick={onTransferClick} variant="outline" className="w-full bg-transparent">
                    Make Offer
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    View Transactions
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest transactions and interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ActivityItem
                type="registration"
                title="Property PROP001 registered"
                time="2 hours ago"
                status="completed"
              />
              <ActivityItem
                type="transfer"
                title="Transfer request for PROP002 approved"
                time="5 hours ago"
                status="completed"
              />
              <ActivityItem
                type="verification"
                title="Property PROP003 verified"
                time="1 day ago"
                status="completed"
              />
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <ManageDisputesModal 
          open={disputesModalOpen}
          onOpenChange={setDisputesModalOpen}
        />
        <AuditTrailModal 
          open={auditTrailModalOpen}
          onOpenChange={setAuditTrailModalOpen}
        />
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-primary">{value}</p>
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          </div>
          <Icon className="w-8 h-8 text-muted-foreground opacity-50" />
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({
  type,
  title,
  time,
  status,
}: {
  type: string;
  title: string;
  time: string;
  status: "completed" | "pending" | "failed";
}) {
  const statusColors = {
    completed: "bg-green-500/20 text-green-700",
    pending: "bg-yellow-500/20 text-yellow-700",
    failed: "bg-red-500/20 text-red-700",
  };

  return (
    <div className="flex items-start justify-between py-2 border-b last:border-0">
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
      <Badge className={statusColors[status]}>{status}</Badge>
    </div>
  );
}
