"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAndGoHome, useAuth } from "@/lib/auth";

interface Props {
  title: string;
  nav: { href: string; label: string }[];
  children: React.ReactNode;
}

export default function DashboardShell({ title, nav, children }: Props) {
  const path = usePathname();
  const principal = useAuth((s) => s.principal);

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="px-5 py-4">
          <Link href="/" className="text-lg font-bold">Nexora</Link>
          <p className="mt-1 text-xs text-slate-500">{principal?.name} ({principal?.role})</p>
        </div>
        <nav className="px-2 space-y-1">
          {nav.map((n) => {
            const active = path === n.href || path?.startsWith(n.href + "/");
            return (
              <Link key={n.href} href={n.href}
                    className={`block rounded-md px-3 py-2 text-sm ${active ? "bg-brand-500 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                {n.label}
              </Link>
            );
          })}
          <button onClick={logoutAndGoHome} className="mt-4 w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            Logout
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}