"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ShieldCheck, Users, Megaphone, Map } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AppShell } from "@/components/ui/sidebar";
import { ToastHost } from "@/components/ui/toast";

const NAV = [
  { href: "/admin/dashboard",  label: "Dashboard",     icon: LayoutDashboard, exact: true },
  { href: "/admin/ngos",       label: "NGO approvals", icon: ShieldCheck },
  { href: "/admin/volunteers", label: "Volunteers",    icon: Users },
  { href: "/admin/events",     label: "All events",    icon: Megaphone },
  { href: "/admin/locations",  label: "Locations",     icon: Map },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const principal = useAuth((s) => s.principal);

  useEffect(() => {
    if (principal === null) return;
    if (principal.role !== "ROLE_SUPER_ADMIN") router.replace("/login");
  }, [principal, router]);

  if (principal === null) {
    return <div className="p-10 text-sm text-mist">Loading…</div>;
  }
  return (
    <AppShell role="ROLE_SUPER_ADMIN" nav={NAV}>
      {children}
      <ToastHost />
    </AppShell>
  );
}