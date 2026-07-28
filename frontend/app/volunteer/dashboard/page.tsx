"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { InvitationResponse, VolunteerResponse } from "@/lib/types";

export default function VolunteerDashboard() {
  const [me, setMe] = useState<VolunteerResponse | null>(null);
  const [invitations, setInvitations] = useState<InvitationResponse[]>([]);

  useEffect(() => {
    api<VolunteerResponse>("/api/v1/volunteer/dashboard").then(setMe).catch(() => {});
    api<InvitationResponse[]>("/api/v1/volunteer/invitations").then(setInvitations).catch(() => {});
  }, []);

  const pending = invitations.filter(i => i.status === "INVITED").length;
  const accepted = invitations.filter(i => i.status === "ACCEPTED").length;

  return (
    <div className="space-y-6">
      {me && (
        <div className="card">
          <h2 className="text-lg font-semibold">Welcome, {me.name}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">{me.email} · {me.phone}</p>
          <p className="text-xs mt-1">Area: {[me.thana?.name, me.district?.name, me.division?.name].filter(Boolean).join(", ")}</p>
          <p className="text-xs">Skills: {me.skills.join(", ") || "—"}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 max-w-md">
        <div className="card"><p className="text-sm">Pending invitations</p><p className="text-3xl font-bold">{pending}</p></div>
        <div className="card"><p className="text-sm">Accepted</p><p className="text-3xl font-bold text-green-600">{accepted}</p></div>
      </div>
    </div>
  );
}