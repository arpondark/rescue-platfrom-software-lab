"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useDivisions, useDistricts, useThanas } from "@/lib/locations";
import type { VolunteerResponse, Gender } from "@/lib/types";

export default function AddVolunteerPage() {
  const divisions = useDivisions();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", nid: "", gender: "MALE" as Gender,
    divisionId: 0, districtId: 0, thanaId: 0, skills: "",
  });
  const districts = useDistricts(form.divisionId || null);
  const thanas = useThanas(form.districtId || null);
  const [result, setResult] = useState<VolunteerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function up<K extends keyof typeof form>(k: K, v: any) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const skills = form.skills.split(",").map(s => s.trim()).filter(Boolean);
      const r = await api<VolunteerResponse>("/api/v1/ngo/volunteers", {
        method: "POST",
        body: JSON.stringify({
          ...form, skills,
          divisionId: form.divisionId || null,
          districtId: form.districtId || null,
          thanaId: form.thanaId || null,
        }),
      });
      setResult(r);
    } catch (ex: any) { setError(ex.message); } finally { setBusy(false); }
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="card grid grid-cols-1 gap-4 md:grid-cols-2 max-w-3xl">
        <div className="md:col-span-2"><label className="label">Name</label><input required className="input" value={form.name} onChange={(e) => up("name", e.target.value)} /></div>
        <div><label className="label">Email</label><input required type="email" className="input" value={form.email} onChange={(e) => up("email", e.target.value)} /></div>
        <div><label className="label">Phone</label><input required className="input" placeholder="017xxxxxxxx" value={form.phone} onChange={(e) => up("phone", e.target.value)} /></div>
        <div><label className="label">NID</label><input className="input" value={form.nid} onChange={(e) => up("nid", e.target.value)} /></div>
        <div><label className="label">Gender</label>
          <select className="input" value={form.gender} onChange={(e) => up("gender", e.target.value)}>
            <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
          </select>
        </div>
        <div><label className="label">Division</label>
          <select required className="input" value={form.divisionId} onChange={(e) => { up("divisionId", +e.target.value); up("districtId", 0); up("thanaId", 0); }}>
            <option value={0}>Select...</option>
            {divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div><label className="label">District</label>
          <select className="input" disabled={!form.divisionId} value={form.districtId} onChange={(e) => { up("districtId", +e.target.value); up("thanaId", 0); }}>
            <option value={0}>Select...</option>
            {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-2"><label className="label">Thana</label>
          <select className="input" disabled={!form.districtId} value={form.thanaId} onChange={(e) => up("thanaId", +e.target.value)}>
            <option value={0}>Select...</option>
            {thanas.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-2"><label className="label">Skills (comma)</label>
          <input className="input" value={form.skills} onChange={(e) => up("skills", e.target.value)} />
        </div>
        {error && <p className="text-red-600 text-sm md:col-span-2">{error}</p>}
        <button className="btn-primary md:col-span-2" disabled={busy}>{busy ? "Adding..." : "Add Volunteer"}</button>
      </form>

      {result && (
        <div className="card mt-6">
          <p className="text-green-600">Volunteer added: {result.name} — an email was sent to {result.email}.</p>
        </div>
      )}
    </div>
  );
}