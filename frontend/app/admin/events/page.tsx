"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { DisasterEventResponse, PageResp } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function AdminEventsPage() {
  const [data, setData] = useState<PageResp<DisasterEventResponse> | null>(null);
  useEffect(() => { api<PageResp<DisasterEventResponse>>("/api/v1/admin/events?page=0&size=50").then(setData).catch(() => {}); }, []);

  return (
    <div className="card overflow-x-auto">
      <table className="table">
        <thead><tr><th>Title</th><th>Type</th><th>Severity</th><th>NGO</th><th>Area</th><th>Start</th><th>Status</th><th>Counts</th></tr></thead>
        <tbody>
          {data?.content.map((e) => (
            <tr key={e.id}>
              <td>{e.title}</td>
              <td>{e.type}</td>
              <td>{e.severity}</td>
              <td>{e.ngoName}</td>
              <td className="text-xs">{e.divisions.map(d => d.name).join(", ")}</td>
              <td className="text-xs">{formatDateTime(e.startAt)}</td>
              <td>{e.status}</td>
              <td className="text-xs">A:{e.acceptedCount} I:{e.invitedCount} D:{e.declinedCount} X:{e.deployedCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}