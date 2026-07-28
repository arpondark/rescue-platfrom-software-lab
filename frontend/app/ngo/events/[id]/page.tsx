"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useDistricts, useDivisions, useThanas } from "@/lib/locations";
import type {
  DisasterEventResponse, InvitationResponse, VolunteerResponse,
} from "@/lib/types";

export default function EventManagePage() {
  const params = useParams<{ id: string }>();
  const id = +params.id;
  const [event, setEvent] = useState<DisasterEventResponse | null>(null);
  const [invitations, setInvitations] = useState<InvitationResponse[] | null>(null);
  const [candidates, setCandidates] = useState<VolunteerResponse[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const divisions = useDivisions();
  const [filterDivisionId, setFilterDivisionId] = useState<number | null>(null);
  const districts = useDistricts(filterDivisionId);
  const [filterDistrictId, setFilterDistrictId] = useState<number | null>(null);
  const thanas = useThanas(filterDistrictId);
  const [filterThanaId, setFilterThanaId] = useState<number | null>(null);
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
    setBusy(true); setMsg(null);
    try {
      const r = await api<{ invited: number; skipped: number }>(`/api/v1/events/${id}/invitations`, {
        method: "POST", body: JSON.stringify({ volunteerIds: Array.from(selected) }),
      });
      setMsg(`Invited: ${r.invited}, skipped: ${r.skipped}`);
      setSelected(new Set());
      await load();
    } catch (e: any) { setMsg(e.message); } finally { setBusy(false); }
  }

  if (!event) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold">{event.title}</h2>
        <p className="text-sm text-slate-500">{event.type} · {event.severity} · {event.status}</p>
        <p className="text-sm">Starts: {new Date(event.startAt).toLocaleString()} | Ends: {new Date(event.endAt).toLocaleString()}</p>
        <p>Areas: {event.divisions.map(d => d.name).join(", ")}</p>
        {event.description && <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{event.description}</p>}
      </div>

      <div className="card">
        <h3 className="font-semibold">Invitations ({invitations?.length ?? 0})</h3>
        <table className="table mt-2">
          <thead><tr><th>Volunteer</th><th>Status</th><th>Responded</th></tr></thead>
          <tbody>
            {invitations?.map((i) => (
              <tr key={i.id}>
                <td>{i.volunteerName}</td>
                <td>{i.status}</td>
                <td className="text-xs">{i.respondedAt ? new Date(i.respondedAt).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 className="font-semibold">Invite Volunteers</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 my-3">
          <select className="input" value={filterDivisionId ?? ""} onChange={(e) => { setFilterDivisionId(e.target.value ? +e.target.value : null); setFilterDistrictId(null); setFilterThanaId(null); }}>
            <option value="">Any division</option>
            {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select className="input" disabled={!filterDivisionId} value={filterDistrictId ?? ""} onChange={(e) => { setFilterDistrictId(e.target.value ? +e.target.value : null); setFilterThanaId(null); }}>
            <option value="">Any district</option>
            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select className="input" disabled={!filterDistrictId} value={filterThanaId ?? ""} onChange={(e) => setFilterThanaId(e.target.value ? +e.target.value : null)}>
            <option value="">Any thana</option>
            {thanas.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input className="input" placeholder="Skill filter (optional)" value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)} />
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead><tr><th></th><th>Name</th><th>Email</th><th>Area</th><th>Skills</th></tr></thead>
            <tbody>
              {candidates.map((v) => (
                <tr key={v.id}>
                  <td><input type="checkbox" checked={selected.has(v.id)}
                             onChange={(e) => { const ns = new Set(selected); e.target.checked ? ns.add(v.id) : ns.delete(v.id); setSelected(ns); }} /></td>
                  <td>{v.name}</td>
                  <td>{v.email}</td>
                  <td className="text-xs">{[v.thana?.name, v.district?.name, v.division?.name].filter(Boolean).join(", ")}</td>
                  <td className="text-xs">{v.skills.join(", ")}</td>
                </tr>
              ))}
              {candidates.length === 0 && <tr><td colSpan={5} className="text-center text-sm py-3 text-slate-500">No volunteers found in affected areas</td></tr>}
            </tbody>
          </table>
        </div>
        <button onClick={invite} disabled={busy || selected.size === 0} className="btn-primary mt-3">
          {busy ? "Sending..." : `Send ${selected.size} invitation(s)`}
        </button>
        {msg && <p className="mt-2 text-sm text-slate-600">{msg}</p>}
      </div>
    </div>
  );
}