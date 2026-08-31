"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { api } from "@/lib/api";
import { Button, Input, Label, Textarea } from "@/components/ui/input";
import { PageHeader, SectionTitle, ErrorState } from "@/components/ui/page";
import { LocationCascade } from "@/components/ui/location-cascade";
import type { DisasterEventResponse, EventType, Severity } from "@/lib/types";

export default function CreateEventPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState({
    title: "",
    type: "FLOOD" as EventType,
    severity: "MEDIUM" as Severity,
    description: "",
    startAt: "",
    endAt: "",
    requiredVolunteers: 10,
  });
  const [areas, setAreas] = useState<{ divisionId?: number; districtId?: number; thanaId?: number }>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function up<K extends keyof typeof form>(k: K, v: any) { setForm((p) => ({ ...p, [k]: v })); }

  async function onSubmit() {
    setError(null); setBusy(true);
    try {
      const r = await api<DisasterEventResponse>("/api/v1/ngo/events", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          requiredVolunteers: Number(form.requiredVolunteers),
          divisionIds: areas.divisionId ? [areas.divisionId] : [],
          districtIds: areas.districtId ? [areas.districtId] : [],
          thanaIds:    areas.thanaId    ? [areas.thanaId]    : [],
          startAt: new Date(form.startAt).toISOString(),
          endAt:   new Date(form.endAt).toISOString(),
        }),
      });
      router.push(`/ngo/events/${r.id}`);
    } catch (ex: any) { setError(ex.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Open a disaster event"
        title="What happened, where, and when."
        description="Walk through three steps. You can return to edit before publishing."
      />

      {/* Step indicator */}
      <ol className="flex items-center gap-3 mb-8 text-sm">
        {[
          { n: 1, label: "Incident" },
          { n: 2, label: "Area" },
          { n: 3, label: "Resources" },
        ].map((s, i) => (
          <li key={s.n} className="flex items-center gap-3">
            <span className={`h-7 w-7 rounded-full inline-flex items-center justify-center font-mono text-xs ${step >= (s.n as any) ? "bg-signal text-paper" : "bg-paper-200 text-mist"}`}>
              {s.n}
            </span>
            <span className={step === (s.n as any) ? "font-medium text-ink" : "text-mist"}>{s.label}</span>
            {i < 2 && <ChevronRight className="h-3 w-3 text-ink-300" />}
          </li>
        ))}
      </ol>

      {/* Step 1 */}
      {step === 1 && (
        <div className="nx-card space-y-4">
          <SectionTitle eyebrow="Step 1" title="What kind of incident is this?" />
          <div>
            <Label>Title</Label>
            <Input required value={form.title} onChange={(e) => up("title", e.target.value)} placeholder="e.g. Flooding in Cox's Bazar" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Type</Label>
              <select
                className="h-9 w-full rounded bg-surface border border-ink-300 px-3 text-sm focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal"
                value={form.type}
                onChange={(e) => up("type", e.target.value)}
              >
                {["FLOOD","CYCLONE","EARTHQUAKE","FIRE","PANDEMIC","OTHER"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Severity</Label>
              <select
                className="h-9 w-full rounded bg-surface border border-ink-300 px-3 text-sm focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal"
                value={form.severity}
                onChange={(e) => up("severity", e.target.value)}
              >
                {["LOW","MEDIUM","HIGH","CRITICAL"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Volunteers needed</Label>
              <Input
                type="number" min={1}
                value={form.requiredVolunteers}
                onChange={(e) => up("requiredVolunteers", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={4} value={form.description} onChange={(e) => up("description", e.target.value)} placeholder="What's the situation on the ground?" />
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="nx-card space-y-4">
          <SectionTitle eyebrow="Step 2" title="Where is it happening?" />
          <p className="text-sm text-mist">
            Pick the area you need volunteers in. We'll filter your roster to this location when you invite.
          </p>
          <LocationCascade value={areas} onChange={setAreas} required />
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="nx-card space-y-4">
          <SectionTitle eyebrow="Step 3" title="When does it run?" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Starts</Label>
              <Input required type="datetime-local" value={form.startAt} onChange={(e) => up("startAt", e.target.value)} />
            </div>
            <div>
              <Label>Ends</Label>
              <Input required type="datetime-local" value={form.endAt} onChange={(e) => up("endAt", e.target.value)} />
            </div>
          </div>

          <hr />

          <div>
            <SectionTitle eyebrow="Review" title="Summary" />
            <dl className="text-sm grid grid-cols-2 gap-y-2">
              <dt className="text-mist">Title</dt><dd className="text-ink">{form.title || "—"}</dd>
              <dt className="text-mist">Type / Severity</dt><dd className="text-ink">{form.type} · {form.severity}</dd>
              <dt className="text-mist">Volunteers</dt><dd className="text-ink">{form.requiredVolunteers}</dd>
              <dt className="text-mist">Area</dt>
              <dd className="text-ink">
                {[areas.thanaId, areas.districtId, areas.divisionId].filter(Boolean).length
                  ? "Selected" : "—"}
              </dd>
            </dl>
          </div>

          {error && <ErrorState title="Could not create event" description={error} />}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <Button variant="secondary" disabled={step === 1} onClick={() => setStep((s) => (s - 1) as any)}>
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep((s) => (s + 1) as any)}>
            Continue <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={onSubmit} disabled={busy}>
            {busy ? "Creating…" : "Create event"}
          </Button>
        )}
      </div>
    </div>
  );
}