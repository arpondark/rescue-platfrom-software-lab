"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function AdminLocationsPage() {
  const [divName, setDivName] = useState("");
  const [distInfo, setDistInfo] = useState({ divisionId: "", name: "" });
  const [thanaInfo, setThanaInfo] = useState({ districtId: "", name: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold">Add Division</h2>
        <div className="mt-3 flex gap-2">
          <input className="input" placeholder="Division name" value={divName} onChange={(e) => setDivName(e.target.value)} />
          <button className="btn-primary" disabled={busy || !divName} onClick={async () => {
            setBusy(true); setMsg(null);
            try { await api("/api/v1/admin/locations/divisions?name=" + encodeURIComponent(divName), { method: "POST" }); setMsg("Added"); setDivName(""); }
            catch (e: any) { setMsg(e.message); } finally { setBusy(false); }
          }}>Add</button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold">Add District</h2>
        <div className="mt-3 flex gap-2">
          <input className="input" type="number" placeholder="Division ID" value={distInfo.divisionId} onChange={(e) => setDistInfo(p => ({ ...p, divisionId: e.target.value }))} />
          <input className="input" placeholder="District name" value={distInfo.name} onChange={(e) => setDistInfo(p => ({ ...p, name: e.target.value }))} />
          <button className="btn-primary" disabled={busy || !distInfo.divisionId || !distInfo.name} onClick={async () => {
            setBusy(true); setMsg(null);
            try {
              await api(`/api/v1/admin/locations/districts?divisionId=${distInfo.divisionId}&name=${encodeURIComponent(distInfo.name)}`, { method: "POST" });
              setMsg("Added"); setDistInfo({ divisionId: "", name: "" });
            } catch (e: any) { setMsg(e.message); } finally { setBusy(false); }
          }}>Add</button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold">Add Thana</h2>
        <div className="mt-3 flex gap-2">
          <input className="input" type="number" placeholder="District ID" value={thanaInfo.districtId} onChange={(e) => setThanaInfo(p => ({ ...p, districtId: e.target.value }))} />
          <input className="input" placeholder="Thana name" value={thanaInfo.name} onChange={(e) => setThanaInfo(p => ({ ...p, name: e.target.value }))} />
          <button className="btn-primary" disabled={busy || !thanaInfo.districtId || !thanaInfo.name} onClick={async () => {
            setBusy(true); setMsg(null);
            try {
              await api(`/api/v1/admin/locations/thanas?districtId=${thanaInfo.districtId}&name=${encodeURIComponent(thanaInfo.name)}`, { method: "POST" });
              setMsg("Added"); setThanaInfo({ districtId: "", name: "" });
            } catch (e: any) { setMsg(e.message); } finally { setBusy(false); }
          }}>Add</button>
        </div>
      </div>

      {msg && <p className="text-sm text-slate-600 dark:text-slate-300">{msg}</p>}
    </div>
  );
}