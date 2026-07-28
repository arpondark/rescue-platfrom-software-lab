"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useDivisions, useDistricts, useThanas } from "@/lib/locations";
import type { DisasterEventResponse, EventType, Severity } from "@/lib/types";

export default function CreateEventPage() {
  const router = useRouter();
  const divisions = useDivisions();
  const [divisionId, setDivisionId] = useState<number>(0);
  const [districtId, setDistrictId] = useState<number>(0);
  const [thanaId, setThanaId] = useState<number>(0);
  const districts = useDistricts(divisionId || null);
  const thanas = useThanas(districtId || null);

  const [form, setForm] = useState({
    title: "", type: "FLOOD" as EventType, severity: "MEDIUM" as Severity,
    description: "", startAt: "", endAt: "", requiredVolunteers: 10,
    divisionIds: [] as number[], districtIds: [] as number[], thanaIds: [] as number[],
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function up<K extends keyof typeof form>(k: K, v: any) { setForm((p) => ({ ...p, [k]: v })); }
  function toggle(ids: number[], id: number) { return ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]; }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      const r = await api<DisasterEventResponse>("/api/v1/ngo/events", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          requiredVolunteers: +form.requiredVolunteers,
          divisionIds: form.divisionIds.length ? form.divisionIds : (divisionId ? [divisionId] : []),
          districtIds: form.districtIds, thanaIds: form.thanaIds,
          startAt: new Date(form.startAt).toISOString(),
          endAt: new Date(form.endAt).toISOString(),
        }),
      });
      router.push(`/ngo/events/${r.id}`);
    } catch (ex: any) { setError(ex.message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={onSubmit} className="card grid grid-cols-1 gap-4 md:grid-cols-2 max-w-4xl">
      <div className="md:col-span-2"><label className="label">Title</label>
        <input required className="input" value={form.title} onChange={(e) => up("title", e.target.value)} /></div>
      <div><label className="label">Type</label>
        <select className="input" value={form.type} onChange={(e) => up("type", e.target.value)}>
          {["FLOOD","CYCLONE","EARTHQUAKE","FIRE","PANDEMIC","OTHER"].map(t => <option key={t}>{t}</option>)}
        </select></div>
      <div><label className="label">Severity</label>
        <select className="input" value={form.severity} onChange={(e) => up("severity", e.target.value)}>
          {["LOW","MEDIUM","HIGH","CRITICAL"].map(s => <option key={s}>{s}</option>)}
        </select></div>
      <div><label className="label">Start</label><input required type="datetime-local" className="input" value={form.startAt} onChange={(e) => up("startAt", e.target.value)} /></div>
      <div><label className="label">End</label><input required type="datetime-local" className="input" value={form.endAt} onChange={(e) => up("endAt", e.target.value)} /></div>
      <div><label className="label">Required volunteers</label>
        <input required type="number" min={1} className="input" value={form.requiredVolunteers} onChange={(e) => up("requiredVolunteers", e.target.value)} /></div>
      <div className="md:col-span-2"><label className="label">Description</label>
        <textarea className="input" rows={3} value={form.description} onChange={(e) => up("description", e.target.value)} /></div>

      <div className="md:col-span-2">
        <label className="label">Affected Divisions (required, multi-select)</label>
        <div className="flex flex-wrap gap-2">
          {divisions.map((d) => {
            const sel = form.divisionIds.includes(d.id);
            return (
              <button type="button" key={d.id}
                      onClick={() => up("divisionIds", toggle(form.divisionIds, d.id))}
                      className={`px-3 py-1.5 text-sm rounded ${sel ? "bg-brand-500 text-white" : "bg-slate-100 dark:bg-slate-800"}`}>
                {d.name}
              </button>
            );
          })}
        </div>
      </div>

      <div><label className="label">Districts (optional)</label>
        <select className="input" multiple size={6} value={form.districtIds.map(String)} onChange={(e) => up("districtIds", Array.from(e.target.selectedOptions).map(o => +o.value))}>
          {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select></div>
      <div><label className="label">Thanas (optional)</label>
        <select className="input" multiple size={6} value={form.thanaIds.map(String)} onChange={(e) => up("thanaIds", Array.from(e.target.selectedOptions).map(o => +o.value))}>
          {thanas.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select></div>

      {error && <p className="text-red-600 text-sm md:col-span-2">{error}</p>}
      <button className="btn-primary md:col-span-2" disabled={busy}>{busy ? "Creating..." : "Create Event"}</button>
    </form>
  );
}