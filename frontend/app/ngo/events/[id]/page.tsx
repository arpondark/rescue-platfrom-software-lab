"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, Send, CheckCircle2, XCircle, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventStatusBadge, SeverityBadge, EventTypeBadge, InvitationStatusBadge } from "@/components/ui/badge";
import { PageHeader, StatCard, EmptyState, SectionTitle } from "@/components/ui/page";
import { LocationCascade } from "@/components/ui/location-cascade";
import { toast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/utils";
import type {
  DisasterEventResponse, InvitationResponse, VolunteerResponse,
} from "@/lib/types";

export default function EventManagePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);

  const [event, setEvent] = useState<DisasterEventResponse | null>(null);
  const [invitations, setInvitations] = useState<InvitationResponse[]>([]);
  const [candidates, setCandidates] = useState<VolunteerResponse[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [filterLocation, setFilterLocation] = useState<{ divisionId?: number; districtId?: number; thanaId?: number }>({});
  const [filterSkill, setFilterSkill] = useState("");

  async function load() {
    const [ev, invs] = await Promise.all([
      api<DisasterEventResponse>(`/api/v1/events/${id}`),
      api<InvitationResponse[]>(`/api/v1/events/${id}/invitations`),
    ]);
    setEvent(ev); setInvitations(invs);
  }
  async function loadRecommended() {
    const sp = new URLSearchParams();
    if (filterSkill) sp.set("skill", filterSkill);
    const r = await api<VolunteerResponse[]>(`/api/v1/events/${id}/recommended-volunteers?${sp}`);
    setCandidates(r);
  }
  useEffect(() => { load().catch(() => {}); }, [id]);
  useEffect(() => { loadRecommended().catch(() => {}); }, [id, filterSkill]);

  async function invite() {
    setBusy(true);
    try {
      const r = await api<{ invited: number; skipped: number }>(`/api/v1/events/${id}/invitations`, {
        method: "POST", body: JSON.stringify({ volunteerIds: Array.from(selected) }),
      });
      toast("success", "Invitations sent", `${r.invited} invited, ${r.skipped} skipped (already invited).`);
      setSelected(new Set());
      await load();
    } catch (e: any) {
      toast("error", "Could not send", e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!event) return <p className="text-sm text-mist">Loading…</p>;

  const filtered = filterLocation.divisionId || filterLocation.districtId || filterLocation.thanaId
    ? candidates.filter((v) =>
        (!filterLocation.divisionId || v.division?.id === filterLocation.divisionId) &&
        (!filterLocation.districtId || v.district?.id === filterLocation.districtId) &&
        (!filterLocation.thanaId    || v.thana?.id    === filterLocation.thanaId)
      )
    : candidates;

  const progress = Math.min(100, Math.round((event.acceptedCount / Math.max(1, event.requiredVolunteers)) * 100));

  return (
    <div>
      <button onClick={() => router.push("/ngo/events")} className="text-sm text-mist hover:text-ink flex items-center gap-1 mb-4">
        <ArrowLeft className="h-3 w-3" /> All events
      </button>

      <PageHeader
        eyebrow={`Event #${event.id}`}
        title={event.title}
        description={
          <span className="flex items-center gap-2 flex-wrap">
            <EventTypeBadge type={event.type} />
            <SeverityBadge severity={event.severity} />
            <EventStatusBadge status={event.status} />
            <span className="text-xs text-mist font-mono">
              {formatDateTime(event.startAt)} → {formatDateTime(event.endAt)}
            </span>
          </span>
        }
      />

      {event.description && (
        <p className="max-w-3xl text-sm text-ink-400 mb-8">{event.description}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Accepted"     value={event.acceptedCount} />
        <StatCard label="Invited"      value={event.invitedCount} />
        <StatCard label="Declined"     value={event.declinedCount} />
        <StatCard label="Deployed"     value={event.deployedCount} />
      </div>

      {/* Progress bar */}
      <div className="nx-card-flat mb-10">
        <div className="flex items-center justify-between mb-2">
          <span className="eyebrow">Roster progress</span>
          <span className="font-mono text-sm text-ink">
            {event.acceptedCount}/{event.requiredVolunteers} ({progress}%)
          </span>
        </div>
        <div className="h-1 bg-paper-200 rounded overflow-hidden">
          <div className="h-full bg-signal transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Invitations list */}
      <SectionTitle eyebrow="Invitations" title={`${invitations.length} sent`} />
      {invitations.length === 0 ? (
        <EmptyState
          icon={<Send className="h-6 w-6 mx-auto" />}
          title="No invitations yet."
          description="Send invitations to recommended volunteers to start the deployment."
        />
      ) : (
        <div className="border border-ink-300 rounded bg-surface overflow-hidden mb-10">
          <table className="nx-table">
            <thead>
              <tr>
                <th>Volunteer</th>
                <th>Status</th>
                <th>Invited</th>
                <th>Responded</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((i) => (
                <tr key={i.id}>
                  <td className="font-medium text-ink">{i.volunteerName}</td>
                  <td><InvitationStatusBadge status={i.status} /></td>
                  <td className="text-xs font-mono text-mist">{i.invitedAt ? new Date(i.invitedAt).toLocaleString() : "—"}</td>
                  <td className="text-xs font-mono text-mist">{i.respondedAt ? new Date(i.respondedAt).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Candidates */}
      <div className="nx-card space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <SectionTitle eyebrow="Send invitations" title="Recommended volunteers" />
            <p className="text-sm text-mist -mt-3">
              People in or near the affected areas. Filter further if you need to.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-mist">{selected.size} selected</span>
            <Button onClick={invite} disabled={busy || selected.size === 0}>
              <Send className="h-4 w-4" />
              {busy ? "Sending…" : `Send ${selected.size || ""} invitation${selected.size === 1 ? "" : "s"}`}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Input
            placeholder="Filter by skill (e.g. first-aid)"
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadRecommended()}
          />
          <div className="md:col-span-3">
            <LocationCascade value={filterLocation} onChange={setFilterLocation} />
          </div>
        </div>

        <div className="border border-ink-300 rounded bg-surface overflow-hidden">
          <table className="nx-table">
            <thead>
              <tr>
                <th className="w-8"></th>
                <th>Name</th>
                <th>Email</th>
                <th>Area</th>
                <th>Skills</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selected.has(v.id)}
                      onChange={(e) => {
                        const ns = new Set(selected);
                        if (e.target.checked) ns.add(v.id); else ns.delete(v.id);
                        setSelected(ns);
                      }}
                    />
                  </td>
                  <td className="font-medium text-ink">{v.name}</td>
                  <td className="text-xs">{v.email}</td>
                  <td className="text-xs">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-mist" />
                      {[v.thana?.name, v.district?.name, v.division?.name].filter(Boolean).join(", ")}
                    </span>
                  </td>
                  <td className="text-xs">
                    {v.skills.length ? v.skills.map((s) => <span key={s} className="nx-badge nx-badge-ink mr-1">{s}</span>) : <span className="text-mist">—</span>}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center text-sm py-6 text-mist">No volunteers match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}