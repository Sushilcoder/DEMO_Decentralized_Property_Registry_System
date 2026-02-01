import { NextResponse } from "next/server";

export async function GET() {
  const data = {
    stats: [
      { value: "100%", label: "Tamper-Proof" },
      { value: "Instant", label: "Verification" },
      { value: "24/7", label: "Access" },
      { value: "Zero", label: "Fraud" },
    ],
    problems: [
      {
        id: 1,
        icon: "FileWarning",
        title: "Document Forgery",
        description:
          "Property papers like 7/12, Kharedikhat can be easily changed or forged",
      },
      {
        id: 2,
        icon: "FileX",
        title: "Double Selling",
        description:
          "Same property can be sold multiple times to different buyers",
      },
      {
        id: 3,
        icon: "Clock",
        title: "Slow Verification",
        description: "Property verification takes days with too much paperwork",
      },
      {
        id: 4,
        icon: "AlertTriangle",
        title: "Trust Issues",
        description: "System relies on trust in people rather than technology",
      },
    ],
    steps: [
      {
        number: 1,
        title: "Property Exists",
        description:
          "Land already has 7/12, Property card. Government already recognizes it. We do NOT create new land records.",
        icon: "Building2",
      },
      {
        number: 2,
        title: "Government Verifies",
        description:
          "Officer checks original 7/12, owner details and confirms it is genuine. Government stays in control.",
        icon: "UserCheck",
      },
      {
        number: 3,
        title: "Lock Document Digitally",
        description:
          "7/12 is scanned, uploaded to secure storage (IPFS). A digital fingerprint (hash) is created — like Aadhaar fingerprint.",
        icon: "Upload",
      },
      {
        number: 4,
        title: "Save on Blockchain",
        description:
          "Blockchain stores Property ID, Owner, Document fingerprint, Date & time. Nobody can change this later.",
        icon: "Database",
      },
      {
        number: 5,
        title: "Anyone Can Verify",
        description:
          "Buyer enters Property ID, sees current owner & history, uploads document. System matches fingerprint. Fake document = mismatch!",
        icon: "Search",
      },
      {
        number: 6,
        title: "Property Sale (Optional)",
        description:
          "Buyer pays via smart contract, Government approves, Ownership updates automatically, Payment released. No cheating, No double sale.",
        icon: "Handshake",
      },
    ],
    comparisons: [
      { aspect: "Record Storage", old: "Paper-based", new: "Digitally locked" },
      { aspect: "Alterability", old: "Easy to change", new: "Impossible to change" },
      { aspect: "Verification Speed", old: "Slow (days)", new: "Instant check" },
      { aspect: "Trust Model", old: "Trust people", new: "Trust technology" },
      { aspect: "Fraud Prevention", old: "Manual checks", new: "Automatic detection" },
      { aspect: "History Tracking", old: "Limited/Missing", new: "Complete audit trail" },
    ],
    features: [
      {
        id: 1,
        icon: "Shield",
        title: "Immutable & Transparent Ledger",
        description:
          "Once ownership or transaction info is on the blockchain, it cannot be altered or forged — increasing trust and fairness.",
      },
      {
        id: 2,
        icon: "Eye",
        title: "Easy Public Verification",
        description:
          "Buyers, sellers, and authorities can verify land ownership instantly without relying on multiple offices or physical papers.",
      },
      {
        id: 3,
        icon: "Zap",
        title: "Smart Contract Automation",
        description:
          "Processes like land transfer can be automated with self-executing contracts, reducing human error and speeding up approvals.",
      },
      {
        id: 4,
        icon: "History",
        title: "Tamper-Proof History",
        description:
          "Every transaction is time-stamped and recorded, so the chain of ownership is always traceable and auditable.",
      },
      {
        id: 5,
        icon: "Network",
        title: "Decentralized Structure",
        description:
          "Instead of a single database prone to corruption, multiple participants hold copies of records, making the system more resilient.",
      },
      {
        id: 6,
        icon: "CheckCircle",
        title: "Government Authority Preserved",
        description:
          "The system enhances existing records without replacing legal authority. Government remains in full control of approvals.",
      },
    ],
    benefits: [
      {
        id: 1,
        icon: "ShieldCheck",
        title: "Prevents Fraud",
        description: "Tamper-proof records eliminate document forgery and double selling",
      },
      {
        id: 2,
        icon: "Clock",
        title: "Saves Time",
        description: "Instant verification replaces days of manual paperwork",
      },
      {
        id: 3,
        icon: "Heart",
        title: "Builds Trust",
        description: "Technology-backed verification creates confidence for all parties",
      },
      {
        id: 4,
        icon: "Building",
        title: "Helps Governance",
        description: "Streamlined processes improve government efficiency and transparency",
      },
    ],
    sampleProperties: [
      {
        id: "PROP001",
        owner: "Rajesh Kumar",
        location: "Survey No. 45, Pune",
        documentHash: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
        registeredDate: "2024-03-15",
        status: "verified",
      },
      {
        id: "PROP002",
        owner: "Priya Sharma",
        location: "Plot 23, Mumbai",
        documentHash: "0x6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
        registeredDate: "2024-06-22",
        status: "verified",
      },
      {
        id: "PROP003",
        owner: "Amit Patel",
        location: "Khasra No. 112, Nashik",
        documentHash: "0xd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
        registeredDate: "2025-01-10",
        status: "verified",
      },
    ],
  };

  return NextResponse.json(data);
}
