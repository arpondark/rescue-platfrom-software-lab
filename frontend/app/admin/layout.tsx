"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/ngos", label: "NGO Approvals" },
  { href: "/admin/volunteers", label: "Volunteers" },
  { href: "/admin/events", label: "All Events" },
  { href: "/admin/locations", label: "Locations" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const principal = useAuth((s) => s.principal);

  useEffect(() => {
    if (principal === null) return;
    if (principal.role !== "ROLE_SUPER_ADMIN") router.replace("/login");
  }, [principal, router]);

  if (principal === null) {
    return <div className="p-10 text-sm">Loading...</div>;
  }
  return <DashboardShell title="" nav={NAV}>{children}</DashboardShell>;
}