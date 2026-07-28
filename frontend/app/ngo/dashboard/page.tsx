"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { DisasterEventResponse, NgoResponse, PageResp } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function NgoDashboard() {
  const [profile, setProfile] = useState<NgoResponse | null>(null);
  const [events, setEvents] = useState<PageResp<DisasterEventResponse> | null>(null);

  useEffect(() => {
    api<NgoResponse>("/api/v1/ngo/profile").then(setProfile).catch(() => {});
    api<PageResp<DisasterEventResponse>>("/api/v1/ngo/events?page=0&size=20").then(setEvents).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {profile && (
        <div className="card">
          <h2 className="text-lg font-semibold">{profile.name}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">{profile.email} · {profile.phone}</p>
          <p className="mt-1 text-xs">Area: {[profile.thana?.name, profile.district?.name, profile.division?.name].filter(Boolean).join(", ")}</p>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Recent Events</h2>
        <table className="table">
          <thead><tr><th>Title</th><th>Type</th><th>Severity</th><th>Status</th><th>Start</th><th>Progress</th></tr></thead>
          <tbody>
            {events?.content.map((e) => (
              <tr key={e.id}>
                <td>{e.title}</td>
                <td>{e.type}</td>
                <td>{e.severity}</td>
                <td>{e.status}</td>
                <td className="text-xs">{formatDateTime(e.startAt)}</td>
                <td className="text-xs">A:{e.acceptedCount} I:{e.invitedCount} D:{e.declinedCount}</td>
              </tr>
            ))}
            {events?.content.length === 0 && <tr><td colSpan={6} className="text-center text-sm py-4 text-slate-500">No events yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}