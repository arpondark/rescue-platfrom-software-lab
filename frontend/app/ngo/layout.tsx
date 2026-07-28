"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";

const NAV = [
  { href: "/ngo/dashboard", label: "Dashboard" },
  { href: "/ngo/volunteers", label: "Volunteers" },
  { href: "/ngo/volunteers/new", label: "Add Volunteer" },
  { href: "/ngo/volunteers/bulk", label: "Bulk Upload" },
  { href: "/ngo/events", label: "Events" },
  { href: "/ngo/events/new", label: "Create Event" },
  { href: "/ngo/profile", label: "Profile" },
];

export default function NgoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const principal = useAuth((s) => s.principal);

  useEffect(() => {
    if (principal === null) return;
    if (principal.role !== "ROLE_NGO_ADMIN") router.replace("/login");
  }, [principal, router]);

  if (principal === null) return <div className="p-10 text-sm">Loading...</div>;
  return <DashboardShell title="" nav={NAV}>{children}</DashboardShell>;
}