"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { InvitationResponse } from "@/lib/types";

export default function VolunteerInvitations() {
  const [list, setList] = useState<InvitationResponse[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function load() {
    const r = await api<InvitationResponse[]>("/api/v1/volunteer/invitations");
    setList(r);
  }
  useEffect(() => { load().catch(() => {}); }, []);

  async function respond(id: number, status: "ACCEPTED" | "DECLINED") {
    setBusyId(id);
    try {
      await api(`/api/v1/invitations/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      await load();
    } finally { setBusyId(null); }
  }

  return (
    <div className="card overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Event</th>
            <th>NGO</th>
            <th>Status</th>
            <th>Invited</th>
            <th>Responded</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {list.map((i) => (
            <tr key={i.id}>
              <td>{i.eventTitle}</td>
              <td>{i.ngoName}</td>
              <td>{i.status}</td>
              <td className="text-xs">{i.invitedAt ? new Date(i.invitedAt).toLocaleString() : "—"}</td>
              <td className="text-xs">{i.respondedAt ? new Date(i.respondedAt).toLocaleString() : "—"}</td>
              <td>
                {i.status === "INVITED" && (
                  <div className="flex gap-2">
                    <button disabled={busyId === i.id} onClick={() => respond(i.id, "ACCEPTED")} className="btn-primary text-xs px-2 py-1">Accept</button>
                    <button disabled={busyId === i.id} onClick={() => respond(i.id, "DECLINED")} className="btn-danger text-xs px-2 py-1">Decline</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {list.length === 0 && <tr><td colSpan={6} className="text-center text-sm py-6 text-slate-500">No invitations yet</td></tr>}
        </tbody>
      </table>
    </div>
  );
}