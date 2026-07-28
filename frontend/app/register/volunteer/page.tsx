"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, dashboardPath } from "@/lib/auth";
import { api } from "@/lib/api";
import { useDivisions, useDistricts, useThanas } from "@/lib/locations";
import type { AuthResponse, Gender } from "@/lib/types";

export default function RegisterVolunteerPage() {
  const router = useRouter();
  const setSession = useAuth((s) => s.setSession);
  const divisions = useDivisions();
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", nid: "", gender: "MALE" as Gender,
    divisionId: 0, districtId: 0, thanaId: 0, skills: "",
  });
  const districts = useDistricts(form.divisionId || null);
  const thanas = useThanas(form.districtId || null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function up<K extends keyof typeof form>(k: K, v: any) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api<AuthResponse>("/api/v1/auth/register/volunteer", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          divisionId: form.divisionId || null,
          districtId: form.districtId || null,
          thanaId: form.thanaId || null,
        }),
      });
      setSession(data);
      router.push(dashboardPath(data.principal.role));
    } catch (ex: any) {
      setError(ex.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-2xl font-bold">Volunteer Registration</h1>
      <form onSubmit={onSubmit} className="card mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label">Full name</label>
          <input className="input" required value={form.name} onChange={(e) => up("name", e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required value={form.email} onChange={(e) => up("email", e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" required minLength={8} value={form.password} onChange={(e) => up("password", e.target.value)} />
        </div>
        <div>
          <label className="label">Phone (+880 or 01x...)</label>
          <input className="input" required placeholder="01712345678" value={form.phone} onChange={(e) => up("phone", e.target.value)} />
        </div>
        <div>
          <label className="label">NID (optional)</label>
          <input className="input" value={form.nid} onChange={(e) => up("nid", e.target.value)} />
        </div>
        <div>
          <label className="label">Gender</label>
          <select className="input" value={form.gender} onChange={(e) => up("gender", e.target.value)}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="label">Division</label>
          <select className="input" value={form.divisionId} onChange={(e) => { up("divisionId", +e.target.value); up("districtId", 0); up("thanaId", 0); }}>
            <option value={0}>Select...</option>
            {divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">District</label>
          <select className="input" disabled={!form.divisionId} value={form.districtId} onChange={(e) => { up("districtId", +e.target.value); up("thanaId", 0); }}>
            <option value={0}>Select...</option>
            {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Thana (Upazila)</label>
          <select className="input" disabled={!form.districtId} value={form.thanaId} onChange={(e) => up("thanaId", +e.target.value)}>
            <option value={0}>Select...</option>
            {thanas.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="label">Skills (comma separated)</label>
          <input className="input" placeholder="first-aid,swimming,driving" value={form.skills} onChange={(e) => up("skills", e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
        <button disabled={loading} className="btn-primary md:col-span-2">
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
    </main>
  );
}