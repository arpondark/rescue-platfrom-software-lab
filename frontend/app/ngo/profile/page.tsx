"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { NgoResponse } from "@/lib/types";

export default function NgoProfilePage() {
  const [profile, setProfile] = useState<NgoResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { api<NgoResponse>("/api/v1/ngo/profile").then(setProfile).catch(() => {}); }, []);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;
    setBusy(true); setMsg(null);
    const fd = new FormData(e.currentTarget);
    try {
      const r = await api<NgoResponse>("/api/v1/ngo/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: fd.get("name"),
          phone: fd.get("phone"),
          website: fd.get("website"),
        }),
      });
      setProfile(r);
      setMsg("Saved");
    } catch (ex: any) { setMsg(ex.message); } finally { setBusy(false); }
  }

  if (!profile) return <p>Loading...</p>;

  return (
    <form onSubmit={save} className="card grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
      <div className="md:col-span-2"><label className="label">Name</label><input name="name" defaultValue={profile.name} className="input" /></div>
      <div><label className="label">Email</label><input defaultValue={profile.email} className="input" disabled /></div>
      <div><label className="label">Phone</label><input name="phone" defaultValue={profile.phone} className="input" /></div>
      <div className="md:col-span-2"><label className="label">Website</label><input name="website" defaultValue={profile.website ?? ""} className="input" /></div>
      <div className="md:col-span-2"><label className="label">Registration No</label><input defaultValue={profile.registrationNo} className="input" disabled /></div>
      <div className="md:col-span-2"><label className="label">Area</label>
        <input className="input" disabled value={[profile.thana?.name, profile.district?.name, profile.division?.name].filter(Boolean).join(", ")} />
      </div>
      <button disabled={busy} className="btn-primary md:col-span-2">{busy ? "Saving..." : "Save"}</button>
      {msg && <p className="text-sm md:col-span-2">{msg}</p>}
    </form>
  );
}