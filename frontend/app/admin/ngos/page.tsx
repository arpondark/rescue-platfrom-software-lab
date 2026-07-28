"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { NgoResponse, NgoStatus, PageResp } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function AdminNgosPage() {
  const [status, setStatus] = useState<NgoStatus | "">("PENDING");
  const [data, setData] = useState<PageResp<NgoResponse> | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function load() {
    const qs = status ? `?status=${status}` : "";
    const d = await api<PageResp<NgoResponse>>(`/api/v1/admin/ngos${qs}&page=0&size=50`);
    setData(d);
  }
  useEffect(() => { load().catch(() => {}); }, [status]);

  async function approve(id: number) {
    setBusyId(id);
    try {
      await api(`/api/v1/admin/ngos/${id}/approve`, { method: "POST", body: JSON.stringify({ approve: true }) });
      await load();
    } finally { setBusyId(null); }
  }
  async function reject(id: number) {
    const reason = prompt("Reason for rejection (min 10 chars):");
    if (!reason) return;
    setBusyId(id);
    try {
      await api(`/api/v1/admin/ngos/${id}/approve`, { method: "POST", body: JSON.stringify({ approve: false, reason }) });
      await load();
    } finally { setBusyId(null); }
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["", "PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <button key={s || "all"} onClick={() => setStatus(s as NgoStatus | "")}
                  className={`px-3 py-1.5 text-sm rounded ${status === s ? "bg-brand-500 text-white" : "bg-slate-100 dark:bg-slate-800"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>NGO</th><th>Email</th><th>Phone</th><th>Area</th><th>Status</th><th>Registered</th><th></th>
            </tr>
          </thead>
          <tbody>
            {data?.content.map((n) => (
              <tr key={n.id}>
                <td>{n.name}</td>
                <td>{n.email}</td>
                <td>{n.phone}</td>
                <td>{[n.thana?.name, n.district?.name, n.division?.name].filter(Boolean).join(", ")}</td>
                <td>
                  <span className={n.status === "APPROVED" ? "badge-approved" : n.status === "REJECTED" ? "badge-rejected" : "badge-pending"}>
                    {n.status}
                  </span>
                </td>
                <td className="text-xs text-slate-500">{formatDateTime(n.createdAt)}</td>
                <td className="space-x-2">
                  {n.status === "PENDING" && (
                    <>
                      <button disabled={busyId === n.id} onClick={() => approve(n.id)} className="btn-primary text-xs px-2 py-1">Approve</button>
                      <button disabled={busyId === n.id} onClick={() => reject(n.id)} className="btn-danger text-xs px-2 py-1">Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {data?.content.length === 0 && (
              <tr><td colSpan={7} className="text-center text-sm text-slate-500 py-6">No NGOs</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}