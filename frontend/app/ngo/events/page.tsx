"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { DisasterEventResponse, PageResp } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function NgoEventsPage() {
  const [data, setData] = useState<PageResp<DisasterEventResponse> | null>(null);
  useEffect(() => { api<PageResp<DisasterEventResponse>>("/api/v1/ngo/events?page=0&size=50").then(setData).catch(() => {}); }, []);

  async function changeStatus(id: number, s: DisasterEventResponse["status"]) {
    await api(`/api/v1/events/${id}/status?status=${s}`, { method: "PATCH" });
    const d = await api<PageResp<DisasterEventResponse>>("/api/v1/ngo/events?page=0&size=50");
    setData(d);
  }

  return (
    <div className="card overflow-x-auto">
      <div className="mb-3 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Events</h2>
        <Link href="/ngo/events/new" className="btn-primary">+ New Event</Link>
      </div>
      <table className="table">
        <thead><tr><th>Title</th><th>Type</th><th>Severity</th><th>Start</th><th>End</th><th>Status</th><th>Counts</th><th>Actions</th></tr></thead>
        <tbody>
          {data?.content.map((e) => (
            <tr key={e.id}>
              <td>{e.title}</td>
              <td>{e.type}</td>
              <td>{e.severity}</td>
              <td className="text-xs">{formatDateTime(e.startAt)}</td>
              <td className="text-xs">{formatDateTime(e.endAt)}</td>
              <td>{e.status}</td>
              <td className="text-xs">A:{e.acceptedCount} I:{e.invitedCount} D:{e.declinedCount} X:{e.deployedCount}</td>
              <td className="space-x-1">
                <Link href={`/ngo/events/${e.id}`} className="btn-secondary text-xs px-2 py-1">Manage</Link>
                {e.status === "OPEN" && <button className="btn-secondary text-xs px-2 py-1" onClick={() => changeStatus(e.id, "ONGOING")}>Start</button>}
                {e.status === "ONGOING" && <button className="btn-secondary text-xs px-2 py-1" onClick={() => changeStatus(e.id, "CLOSED")}>Close</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}