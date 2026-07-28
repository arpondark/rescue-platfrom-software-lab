"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  useEffect(() => { api<Record<string, number>>("/api/v1/admin/stats").then(setStats).catch(() => {}); }, []);

  if (!stats) return <p>Loading...</p>;
  const items: { label: string; value: number; color: string }[] = [
    { label: "NGOs Pending", value: stats.ngosPending ?? 0, color: "bg-amber-100 text-amber-800" },
    { label: "NGOs Approved", value: stats.ngosApproved ?? 0, color: "bg-green-100 text-green-800" },
    { label: "NGOs Rejected", value: stats.ngosRejected ?? 0, color: "bg-red-100 text-red-800" },
    { label: "Total Volunteers", value: stats.volunteersTotal ?? 0, color: "bg-sky-100 text-sky-800" },
    { label: "Active Events", value: stats.eventsActive ?? 0, color: "bg-violet-100 text-violet-800" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
      {items.map((it) => (
        <div key={it.label} className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">{it.label}</p>
          <p className={`mt-2 text-3xl font-bold ${it.color}`}>{it.value}</p>
        </div>
      ))}
    </div>
  );
}