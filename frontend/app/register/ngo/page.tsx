"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useDivisions, useDistricts, useThanas } from "@/lib/locations";

export default function RegisterNgoPage() {
  const router = useRouter();
  const divisions = useDivisions();
  const [form, setForm] = useState({
    name: "", email: "", password: "", registrationNo: "", phone: "", website: "",
    divisionId: 0, districtId: 0, thanaId: 0,
  });
  const districts = useDistricts(form.divisionId || null);
  const thanas = useThanas(form.districtId || null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function up<K extends keyof typeof form>(k: K, v: any) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await api("/api/v1/auth/register/ngo", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSuccess("Registration received. Your NGO is pending Super Admin approval. You will receive an email when approved.");
      setTimeout(() => router.push("/login"), 2500);
    } catch (ex: any) {
      setError(ex.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-2xl font-bold">NGO Registration</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Your NGO must be approved by a Super Admin before you can log in.
      </p>
      <form onSubmit={onSubmit} className="card mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label">NGO name</label>
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
          <label className="label">Registration No.</label>
          <input className="input" required value={form.registrationNo} onChange={(e) => up("registrationNo", e.target.value)} />
        </div>
        <div>
          <label className="label">Phone (+880 or 01x...)</label>
          <input className="input" required placeholder="01712345678" value={form.phone} onChange={(e) => up("phone", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Website (optional)</label>
          <input className="input" value={form.website} onChange={(e) => up("website", e.target.value)} />
        </div>
        <div>
          <label className="label">Division</label>
          <select className="input" required value={form.divisionId} onChange={(e) => { up("divisionId", +e.target.value); up("districtId", 0); up("thanaId", 0); }}>
            <option value={0}>Select...</option>
            {divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">District</label>
          <select className="input" required disabled={!form.divisionId} value={form.districtId} onChange={(e) => { up("districtId", +e.target.value); up("thanaId", 0); }}>
            <option value={0}>Select...</option>
            {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="label">Thana (Upazila)</label>
          <select className="input" required disabled={!form.districtId} value={form.thanaId} onChange={(e) => up("thanaId", +e.target.value)}>
            <option value={0}>Select...</option>
            {thanas.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
        {success && <p className="text-sm text-green-600 md:col-span-2">{success}</p>}
        <button disabled={loading} className="btn-primary md:col-span-2">
          {loading ? "Submitting..." : "Submit for approval"}
        </button>
      </form>
    </main>
  );
}