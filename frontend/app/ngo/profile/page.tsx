"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button, Input, Label } from "@/components/ui/input";
import { PageHeader, SectionTitle } from "@/components/ui/page";
import { NgoStatusBadge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import type { NgoResponse } from "@/lib/types";

export default function NgoProfilePage() {
  const [profile, setProfile] = useState<NgoResponse | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { api<NgoResponse>("/api/v1/ngo/profile").then(setProfile).catch(() => {}); }, []);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;
    setBusy(true);
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
      toast("success", "Profile saved", "Your changes have been applied.");
    } catch (ex: any) {
      toast("error", "Could not save", ex.message);
    } finally {
      setBusy(false);
    }
  }

  if (!profile) return <p className="text-sm text-mist">Loading…</p>;

  return (
    <div>
      <PageHeader
        eyebrow="Profile"
        title={
          <span className="flex items-center gap-3">
            {profile.name}
            <NgoStatusBadge status={profile.status} />
          </span>
        }
        description={profile.rejectionReason ? `Rejection reason: ${profile.rejectionReason}` : undefined}
      />

      <form onSubmit={save} className="space-y-10 max-w-3xl">
        <section>
          <SectionTitle eyebrow="01" title="Organisation" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Name</Label>
              <Input name="name" defaultValue={profile.name} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input defaultValue={profile.email} disabled />
            </div>
            <div>
              <Label>Phone</Label>
              <Input name="phone" defaultValue={profile.phone} required />
            </div>
            <div className="md:col-span-2">
              <Label>Website</Label>
              <Input name="website" defaultValue={profile.website ?? ""} />
            </div>
          </div>
        </section>

        <section>
          <SectionTitle eyebrow="02" title="Records" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Registration No</Label>
              <Input defaultValue={profile.registrationNo} disabled />
            </div>
            <div>
              <Label>Operating area</Label>
              <Input
                disabled
                value={[profile.thana?.name, profile.district?.name, profile.division?.name].filter(Boolean).join(", ")}
              />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between border-t border-ink-300 pt-6">
          <p className="text-xs text-mist">Changes apply to your public NGO profile.</p>
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
        </div>
      </form>
    </div>
  );
}