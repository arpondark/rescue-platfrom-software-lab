"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button, Input, Label, HelpText } from "@/components/ui/input";
import { LocationCascade } from "@/components/ui/location-cascade";
import { PageHeader, SectionTitle, ErrorState } from "@/components/ui/page";
import { toast } from "@/components/ui/toast";
import type { Gender, VolunteerResponse } from "@/lib/types";

export default function AddVolunteerPage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", nid: "", gender: "MALE" as Gender, skills: "",
  });
  const [location, setLocation] = useState<{ divisionId?: number; districtId?: number; thanaId?: number }>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function up<K extends keyof typeof form>(k: K, v: any) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      const skills = form.skills.split(",").map((s) => s.trim()).filter(Boolean);
      const r = await api<VolunteerResponse>("/api/v1/ngo/volunteers", {
        method: "POST",
        body: JSON.stringify({
          ...form, skills,
          divisionId: location.divisionId ?? null,
          districtId: location.districtId ?? null,
          thanaId: location.thanaId ?? null,
        }),
      });
      toast("success", "Volunteer added", `${r.name} will receive a setup email at ${r.email}.`);
      setForm({ name: "", email: "", phone: "", nid: "", gender: "MALE", skills: "" });
      setLocation({});
    } catch (ex: any) { setError(ex.message); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Add to roster"
        title="Add a volunteer."
        description="Use this for one-off additions. For larger groups, switch to Bulk upload."
      />

      <form onSubmit={onSubmit} className="space-y-10 max-w-3xl">
        <section>
          <SectionTitle eyebrow="01" title="Who they are" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Full name</Label>
              <Input required value={form.name} onChange={(e) => up("name", e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input required type="email" value={form.email} onChange={(e) => up("email", e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input required value={form.phone} onChange={(e) => up("phone", e.target.value)} placeholder="+8801712345678" />
              <HelpText>Format: +8801XXXXXXXXX or 01XXXXXXXXX.</HelpText>
            </div>
            <div>
              <Label>NID (optional)</Label>
              <Input value={form.nid} onChange={(e) => up("nid", e.target.value)} />
            </div>
            <div>
              <Label>Gender</Label>
              <select
                className="h-9 w-full rounded bg-surface border border-ink-300 px-3 text-sm focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal"
                value={form.gender}
                onChange={(e) => up("gender", e.target.value)}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <SectionTitle eyebrow="02" title="Where they're based" />
          <LocationCascade value={location} onChange={setLocation} required />
        </section>

        <section>
          <SectionTitle eyebrow="03" title="What they can do" />
          <div>
            <Label>Skills</Label>
            <Input
              value={form.skills}
              onChange={(e) => up("skills", e.target.value)}
              placeholder="first-aid, swimming, driving"
            />
          </div>
        </section>

        {error && <ErrorState title="Could not add volunteer" description={error} />}

        <div className="flex items-center justify-between border-t border-ink-300 pt-6">
          <p className="text-xs text-mist">They'll get a setup email with a link to choose their password.</p>
          <Button type="submit" disabled={busy}>{busy ? "Adding…" : "Add volunteer"}</Button>
        </div>
      </form>
    </div>
  );
}