"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useDivisions, useDistricts, useThanas } from "@/lib/locations";
import type { PageResp, VolunteerResponse } from "@/lib/types";

export default function AdminVolunteersPage() {
  const [divisionId, setDivisionId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [thanaId, setThanaId] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [data, setData] = useState<PageResp<VolunteerResponse> | null>(null);

  const divisions = useDivisions();
  const districts = useDistricts(divisionId);
  const thanas = useThanas(districtId);

  async function load() {
    const sp = new URLSearchParams();
    if (divisionId) sp.set("divisionId", String(divisionId));
    if (districtId) sp.set("districtId", String(districtId));
    if (thanaId) sp.set("thanaId", String(thanaId));
    if (q) sp.set("q", q);
    sp.set("page", "0"); sp.set("size", "50");
    const d = await api<PageResp<VolunteerResponse>>(`/api/v1/admin/volunteers?${sp}`);
    setData(d);
  }
  useEffect(() => { load().catch(() => {}); }, [divisionId, districtId, thanaId]);

  return (
    <div className="space-y-4">
      <div className="card grid grid-cols-1 md:grid-cols-5 gap-3">
        <select className="input" value={divisionId ?? ""} onChange={(e) => { setDivisionId(e.target.value ? +e.target.value : null); setDistrictId(null); setThanaId(null); }}>
          <option value="">All Divisions</option>
          {divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="input" disabled={!divisionId} value={districtId ?? ""} onChange={(e) => { setDistrictId(e.target.value ? +e.target.value : null); setThanaId(null); }}>
          <option value="">All Districts</option>
          {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="input" disabled={!districtId} value={thanaId ?? ""} onChange={(e) => setThanaId(e.target.value ? +e.target.value : null)}>
          <option value="">All Thanas</option>
          {thanas.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input className="input" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn-primary" onClick={() => load()}>Search</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Area</th><th>Skills</th><th>Status</th></tr></thead>
          <tbody>
            {data?.content.map((v) => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td>{v.email}</td>
                <td>{v.phone}</td>
                <td>{[v.thana?.name, v.district?.name, v.division?.name].filter(Boolean).join(", ")}</td>
                <td className="text-xs">{v.skills.join(", ")}</td>
                <td><span className="badge-approved">{v.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}