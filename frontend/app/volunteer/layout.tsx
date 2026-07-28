"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";

const NAV = [
  { href: "/volunteer/dashboard", label: "Dashboard" },
  { href: "/volunteer/invitations", label: "Invitations" },
  { href: "/volunteer/profile", label: "Profile" },
];

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const principal = useAuth((s) => s.principal);

  useEffect(() => {
    if (principal === null) return;
    if (principal.role !== "ROLE_VOLUNTEER") router.replace("/login");
  }, [principal, router]);

  if (principal === null) return <div className="p-10 text-sm">Loading...</div>;
  return <DashboardShell title="" nav={NAV}>{children}</DashboardShell>;
}