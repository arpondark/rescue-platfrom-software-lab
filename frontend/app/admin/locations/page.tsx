"use client";
import { useState } from "react";
import { Plus, Building2, MapPin, Map } from "lucide-react";
import { api } from "@/lib/api";
import { Button, Input, Label } from "@/components/ui/input";
import { PageHeader, SectionTitle, ErrorState } from "@/components/ui/page";
import { toast } from "@/components/ui/toast";

export default function AdminLocationsPage() {
  const [divName, setDivName] = useState("");
  const [distInfo, setDistInfo] = useState({ divisionId: "", name: "" });
  const [thanaInfo, setThanaInfo] = useState({ districtId: "", name: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addDivision() {
    setBusy(true); setError(null);
    try {
      await api(`/api/v1/admin/locations/divisions?name=${encodeURIComponent(divName)}`, { method: "POST" });
      toast("success", "Division added", divName);
      setDivName("");
    } catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function addDistrict() {
    setBusy(true); setError(null);
    try {
      await api(`/api/v1/admin/locations/districts?divisionId=${distInfo.divisionId}&name=${encodeURIComponent(distInfo.name)}`, { method: "POST" });
      toast("success", "District added", distInfo.name);
      setDistInfo({ divisionId: "", name: "" });
    } catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function addThana() {
    setBusy(true); setError(null);
    try {
      await api(`/api/v1/admin/locations/thanas?districtId=${thanaInfo.districtId}&name=${encodeURIComponent(thanaInfo.name)}`, { method: "POST" });
      toast("success", "Thana added", thanaInfo.name);
      setThanaInfo({ districtId: "", name: "" });
    } catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Country data"
        title="Bangladesh locations."
        description="Maintain the division / district / thana data the entire platform depends on."
      />

      {error && <ErrorState title="Action failed" description={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-ink-300 border border-ink-300">
        <div className="bg-paper p-6">
          <SectionTitle eyebrow="Divisions" title="Add a division" />
          <Label>Name</Label>
          <Input value={divName} onChange={(e) => setDivName(e.target.value)} placeholder="e.g. Chattogram" />
          <div className="mt-3">
            <Button onClick={addDivision} disabled={busy || !divName}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </div>

        <div className="bg-paper p-6">
          <SectionTitle eyebrow="Districts" title="Add a district" />
          <Label>Division ID</Label>
          <Input
            type="number"
            value={distInfo.divisionId}
            onChange={(e) => setDistInfo((p) => ({ ...p, divisionId: e.target.value }))}
            placeholder="Numeric ID"
          />
          <Label className="mt-3">Name</Label>
          <Input
            value={distInfo.name}
            onChange={(e) => setDistInfo((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Feni"
          />
          <div className="mt-3">
            <Button onClick={addDistrict} disabled={busy || !distInfo.divisionId || !distInfo.name}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </div>

        <div className="bg-paper p-6">
          <SectionTitle eyebrow="Thanas" title="Add a thana" />
          <Label>District ID</Label>
          <Input
            type="number"
            value={thanaInfo.districtId}
            onChange={(e) => setThanaInfo((p) => ({ ...p, districtId: e.target.value }))}
            placeholder="Numeric ID"
          />
          <Label className="mt-3">Name</Label>
          <Input
            value={thanaInfo.name}
            onChange={(e) => setThanaInfo((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Feni Sadar"
          />
          <div className="mt-3">
            <Button onClick={addThana} disabled={busy || !thanaInfo.districtId || !thanaInfo.name}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}