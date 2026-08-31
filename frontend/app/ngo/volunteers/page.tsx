"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { Button, Input } from "@/components/ui/input";
import { VolunteerStatusBadge } from "@/components/ui/badge";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { LocationCascade } from "@/components/ui/location-cascade";
import type { PageResp, VolunteerResponse } from "@/lib/types";

export default function NgoVolunteersPage() {
  const [location, setLocation] = useState<{ divisionId?: number; districtId?: number; thanaId?: number }>({});
  const [q, setQ] = useState("");
  const [data, setData] = useState<PageResp<VolunteerResponse> | null>(null);

  async function load() {
    const sp = new URLSearchParams();
    if (location.divisionId) sp.set("divisionId", String(location.divisionId));
    if (location.districtId) sp.set("districtId", String(location.districtId));
    if (location.thanaId)    sp.set("thanaId", String(location.thanaId));
    if (q) sp.set("q", q);
    sp.set("page", "0"); sp.set("size", "50");
    const d = await api<PageResp<VolunteerResponse>>(`/api/v1/ngo/volunteers?${sp}`);
    setData(d);
  }
  useEffect(() => { load().catch(() => {}); }, [location.divisionId, location.districtId, location.thanaId]);

  return (
    <div>
      <PageHeader
        eyebrow="Roster"
        title="Your volunteers."
        description="Filter by location to find people in a specific area. Use bulk upload to add up to 5,000 at once."
      />

      <div className="nx-card space-y-4 mb-6">
        <LocationCascade value={location} onChange={setLocation} />
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-mist" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or email"
              className="pl-9"
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
          </div>
          <Button onClick={load} variant="secondary">Search</Button>
        </div>
      </div>

      {!data || data.content.length === 0 ? (
        <EmptyState
          title="No volunteers match."
          description="Adjust the filters, or add volunteers one by one or via CSV."
        />
      ) : (
        <div className="border border-ink-300 rounded bg-surface overflow-hidden">
          <table className="nx-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Area</th>
                <th>Skills</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((v) => (
                <tr key={v.id}>
                  <td className="font-medium text-ink">{v.name}</td>
                  <td className="text-xs">{v.email}</td>
                  <td className="text-xs font-mono">{v.phone}</td>
                  <td className="text-xs">{[v.thana?.name, v.district?.name, v.division?.name].filter(Boolean).join(", ")}</td>
                  <td className="text-xs">
                    {v.skills.length ? v.skills.map((s) => <span key={s} className="nx-badge nx-badge-ink mr-1">{s}</span>) : <span className="text-mist">—</span>}
                  </td>
                  <td><VolunteerStatusBadge status={v.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 text-xs text-mist border-t border-ink-300 flex items-center justify-between">
            <span>{data.totalElements} volunteer{data.totalElements !== 1 && "s"}</span>
            <span>Page {data.page + 1} of {data.totalPages}</span>
          </div>
        </div>
      )}
    </div>
  );
}