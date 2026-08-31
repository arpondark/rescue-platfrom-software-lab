"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Inbox, CheckCircle2, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import { StatCard, PageHeader, EmptyState } from "@/components/ui/page";
import type { InvitationResponse, VolunteerResponse } from "@/lib/types";

export default function VolunteerDashboard() {
  const [me, setMe] = useState<VolunteerResponse | null>(null);
  const [invitations, setInvitations] = useState<InvitationResponse[]>([]);

  useEffect(() => {
    api<VolunteerResponse>("/api/v1/volunteer/dashboard").then(setMe).catch(() => {});
    api<InvitationResponse[]>("/api/v1/volunteer/invitations").then(setInvitations).catch(() => {});
  }, []);

  const pending  = invitations.filter((i) => i.status === "INVITED").length;
  const accepted = invitations.filter((i) => i.status === "ACCEPTED").length;
  const deployed = invitations.filter((i) => i.status === "DEPLOYED").length;
  const declined = invitations.filter((i) => i.status === "DECLINED").length;
  const area = [me?.thana?.name, me?.district?.name, me?.division?.name].filter(Boolean).join(", ");

  return (
    <div>
      <PageHeader
        eyebrow="Volunteer dashboard"
        title={me ? `Hello, ${me.name.split(" ")[0]}.` : "Welcome back."}
        description={me ? `Based in ${area || "Bangladesh"} — open invitations from NGOs in your area will appear here.` : undefined}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Pending invitations" value={pending} hint="Awaiting your response" />
        <StatCard label="Accepted" value={accepted} />
        <StatCard label="Deployed" value={deployed} />
        <StatCard label="Declined" value={declined} />
      </div>

      {me && (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="nx-card-flat">
            <div className="eyebrow mb-2">Your location</div>
            <div className="flex items-center gap-2 font-display text-lg text-ink">
              <MapPin className="h-4 w-4 text-signal" />
              {area || "Not set"}
            </div>
            <p className="mt-1 text-xs text-mist">NGOs filter volunteers by area. Update your profile to keep this current.</p>
          </div>
          <div className="nx-card-flat">
            <div className="eyebrow mb-2">Your skills</div>
            {me.skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {me.skills.map((s) => (
                  <span key={s} className="nx-badge nx-badge-ink">{s}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-mist">No skills listed. Add some so NGOs can match you to events.</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-display-md text-ink">Latest invitations</h2>
          <Link href="/volunteer/invitations" className="text-sm text-signal hover:underline">View all</Link>
        </div>
        {invitations.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-10 w-10" />}
            title="No invitations yet."
            description="When an NGO opens an event in your area, you'll see it here."
          />
        ) : (
          <ul className="divide-y divide-ink-300 border border-ink-300 rounded bg-surface">
            {invitations.slice(0, 5).map((i) => (
              <li key={i.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-ink">{i.eventTitle}</div>
                  <div className="text-xs text-mist">From {i.ngoName}</div>
                </div>
                <Link href="/volunteer/invitations" className="text-sm text-signal hover:underline">Respond</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}