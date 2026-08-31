"use client";
import { useEffect, useState } from "react";
import { Inbox, CheckCircle2, XCircle, Send, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { InvitationStatusBadge } from "@/components/ui/badge";
import { PageHeader, EmptyState, SectionTitle } from "@/components/ui/page";
import { toast } from "@/components/ui/toast";
import type { InvitationResponse } from "@/lib/types";

/* The invitation system is the spine of the product.
 * This page intentionally surfaces three things in three columns:
 *   1) invitations waiting on the volunteer (the action surface)
 *   2) accepted invitations (commitments)
 *   3) past invitations (history)
 * Each card shows everything the volunteer needs to make a decision: what,
 * where, who, when — and exactly two actions: Accept or Decline.
 */

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
      await api(`/api/v1/invitations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
      toast(
        status === "ACCEPTED" ? "success" : "info",
        status === "ACCEPTED" ? "Invitation accepted" : "Invitation declined",
        status === "ACCEPTED" ? "The NGO has been notified." : "Thanks for letting them know."
      );
    } catch (ex: any) {
      toast("error", "Could not respond", ex.message);
    } finally {
      setBusyId(null);
    }
  }

  const invited    = list.filter((i) => i.status === "INVITED");
  const accepted   = list.filter((i) => i.status === "ACCEPTED");
  const past       = list.filter((i) => i.status === "DECLINED" || i.status === "DEPLOYED");

  return (
    <div>
      <PageHeader
        eyebrow="Invitations"
        title="Your invitations."
        description="An invitation is a request from an NGO to deploy you to a disaster event. Accept if you can help. Decline if you can't — they need to know either way."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-ink-300 border border-ink-300">
        {/* Column 1: needs your response */}
        <section className="bg-paper p-6 min-h-[400px]">
          <SectionTitle eyebrow="Action needed" title={`${invited.length} waiting`} />
          {invited.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-8 w-8 mx-auto" />}
              title="Nothing waiting on you."
              description="When an NGO invites you, the response goes here."
            />
          ) : (
            <ul className="space-y-4">
              {invited.map((i) => (
                <InvitationCard key={i.id} inv={i} onRespond={respond} busy={busyId === i.id} />
              ))}
            </ul>
          )}
        </section>

        {/* Column 2: accepted */}
        <section className="bg-paper p-6 min-h-[400px]">
          <SectionTitle eyebrow="Committed" title={`${accepted.length} accepted`} />
          {accepted.length === 0 ? (
            <EmptyState title="No commitments yet." />
          ) : (
            <ul className="space-y-3">
              {accepted.map((i) => (
                <li key={i.id} className="border border-ink-300 bg-surface rounded p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-display text-base text-ink leading-tight">{i.eventTitle}</div>
                      <div className="text-xs text-mist mt-1">{i.ngoName}</div>
                    </div>
                    <InvitationStatusBadge status={i.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Column 3: past */}
        <section className="bg-paper p-6 min-h-[400px]">
          <SectionTitle eyebrow="History" title={`${past.length} closed`} />
          {past.length === 0 ? (
            <EmptyState title="No past invitations." />
          ) : (
            <ul className="space-y-3">
              {past.map((i) => (
                <li key={i.id} className="border border-ink-300 bg-surface rounded p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-display text-base text-ink leading-tight">{i.eventTitle}</div>
                      <div className="text-xs text-mist mt-1">{i.ngoName}</div>
                      {i.respondedAt && (
                        <div className="text-xs text-mist mt-2 font-mono">
                          {new Date(i.respondedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <InvitationStatusBadge status={i.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function InvitationCard({
  inv,
  onRespond,
  busy,
}: {
  inv: InvitationResponse;
  onRespond: (id: number, s: "ACCEPTED" | "DECLINED") => void;
  busy: boolean;
}) {
  return (
    <li className="border border-ink-300 bg-surface rounded p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="eyebrow mb-1 flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> Awaiting response
          </div>
          <div className="font-display text-lg text-ink leading-tight">{inv.eventTitle}</div>
          <div className="text-xs text-mist mt-1">From {inv.ngoName}</div>
          {inv.invitedAt && (
            <div className="text-xs text-mist mt-2 font-mono">
              Invited {new Date(inv.invitedAt).toLocaleString()}
            </div>
          )}
        </div>
        <InvitationStatusBadge status={inv.status} />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button onClick={() => onRespond(inv.id, "ACCEPTED")} disabled={busy} size="md">
          <CheckCircle2 className="h-4 w-4" /> Accept
        </Button>
        <Button onClick={() => onRespond(inv.id, "DECLINED")} disabled={busy} variant="secondary" size="md">
          <XCircle className="h-4 w-4" /> Decline
        </Button>
      </div>
    </li>
  );
}