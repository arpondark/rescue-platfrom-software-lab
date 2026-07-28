"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useDivisions, useDistricts, useThanas } from "@/lib/locations";
import type { VolunteerResponse } from "@/lib/types";

export default function VolunteerProfilePage() {
  const [me, setMe] = useState<VolunteerResponse | null>(null);
  const divisions = useDivisions();
  const [form, setForm] = useState({ phone: "", nid: "", skills: "", divisionId: 0, districtId: 0, thanaId: 0 });
  const districts = useDistricts(form.divisionId || null);
  const thanas = useThanas(form.districtId || null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    api<VolunteerResponse>("/api/v1/volunteer/dashboard").then((v) => {
      setMe(v);
      setForm({
        phone: v.phone, nid: v.nid ?? "", skills: v.skills.join(", "),
        divisionId: v.division?.id ?? 0, districtId: v.district?.id ?? 0, thanaId: v.thana?.id ?? 0,
      });
    }).catch(() => {});
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const r = await api<VolunteerResponse>("/api/v1/volunteer/profile", {
        method: "PUT",
        body: JSON.stringify({
          phone: form.phone, nid: form.nid, skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
          divisionId: form.divisionId || null, districtId: form.districtId || null, thanaId: form.thanaId || null,
        }),
      });
      setMe(r);
      setMsg("Saved");
    } catch (ex: any) { setMsg(ex.message); } finally { setBusy(false); }
  }

  if (!me) return <p>Loading...</p>;
  return (
    <form onSubmit={save} className="card grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
      <div><label className="label">Name</label><input className="input" defaultValue={me.name} disabled /></div>
      <div><label className="label">Email</label><input className="input" defaultValue={me.email} disabled /></div>
      <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
      <div><label className="label">NID</label><input className="input" value={form.nid} onChange={(e) => setForm(p => ({ ...p, nid: e.target.value }))} /></div>
      <div className="md:col-span-2"><label className="label">Skills (comma)</label>
        <input className="input" value={form.skills} onChange={(e) => setForm(p => ({ ...p, skills: e.target.value }))} /></div>
      <div><label className="label">Division</label>
        <select className="input" value={form.divisionId} onChange={(e) => setForm(p => ({ ...p, divisionId: +e.target.value, districtId: 0, thanaId: 0 }))}>
          <option value={0}>Select...</option>
          {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
      <div><label className="label">District</label>
        <select className="input" disabled={!form.divisionId} value={form.districtId} onChange={(e) => setForm(p => ({ ...p, districtId: +e.target.value, thanaId: 0 }))}>
          <option value={0}>Select...</option>
          {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
      <div className="md:col-span-2"><label className="label">Thana</label>
        <select className="input" disabled={!form.districtId} value={form.thanaId} onChange={(e) => setForm(p => ({ ...p, thanaId: +e.target.value }))}>
          <option value={0}>Select...</option>
          {thanas.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <button disabled={busy} className="btn-primary md:col-span-2">{busy ? "Saving..." : "Save"}</button>
      {msg && <p className="text-sm md:col-span-2">{msg}</p>}
    </form>
  );
}