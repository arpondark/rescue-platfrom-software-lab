"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { EventStatusBadge, SeverityBadge, EventTypeBadge } from "@/components/ui/badge";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { formatDateTime } from "@/lib/utils";
import type { DisasterEventResponse, PageResp } from "@/lib/types";

export default function AdminEventsPage() {
  const [data, setData] = useState<PageResp<DisasterEventResponse> | null>(null);
  useEffect(() => { api<PageResp<DisasterEventResponse>>("/api/v1/admin/events?page=0&size=50").then(setData).catch(() => {}); }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="All disaster events."
        description="Every event opened by every NGO across the country."
      />

      {!data || data.content.length === 0 ? (
        <EmptyState title="No events recorded." />
      ) : (
        <div className="border border-ink-300 rounded bg-surface overflow-hidden">
          <table className="nx-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Severity</th>
                <th>NGO</th>
                <th>Area</th>
                <th>Start</th>
                <th>Status</th>
                <th>Roster</th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((e) => (
                <tr key={e.id}>
                  <td className="font-medium text-ink">
                    <Link href={`/ngo/events/${e.id}`} className="hover:text-signal">{e.title}</Link>
                  </td>
                  <td><EventTypeBadge type={e.type} /></td>
                  <td><SeverityBadge severity={e.severity} /></td>
                  <td className="text-xs">{e.ngoName}</td>
                  <td className="text-xs">{e.divisions.map((d) => d.name).join(", ")}</td>
                  <td className="text-xs font-mono text-mist">{formatDateTime(e.startAt)}</td>
                  <td><EventStatusBadge status={e.status} /></td>
                  <td className="text-xs">
                    <span className="font-mono">{e.acceptedCount}/{e.requiredVolunteers}</span>
                    <span className="text-mist"> · inv {e.invitedCount} · dec {e.declinedCount} · dep {e.deployedCount}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}