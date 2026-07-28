"use client";
import { useState } from "react";
import { api, apiUrl } from "@/lib/api";
import type { BulkUploadResponse } from "@/lib/types";

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BulkUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await apiUpload<BulkUploadResponse>("/api/v1/ngo/volunteers/bulk", fd);
      setResult(r);
    } catch (ex: any) {
      setError(ex.message);
    } finally {
      setBusy(false);
    }
  }
  async function downloadTemplate() {
    const res = await fetch(apiUrl("/api/v1/ngo/volunteers/bulk/template"));
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "volunteers-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="card">
        <h2 className="text-lg font-semibold">Bulk Add Volunteers (CSV)</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Download the CSV template, fill it with up to 5,000 volunteers, and upload. Each volunteer will receive an email.
        </p>
        <button onClick={downloadTemplate} className="btn-secondary mt-3">Download template</button>
      </div>

      <form onSubmit={onSubmit} className="card space-y-3">
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} className="input" />
        <button className="btn-primary" disabled={busy || !file}>{busy ? "Uploading..." : "Upload"}</button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>

      {result && (
        <div className="card">
          <h3 className="font-semibold">Upload Summary</h3>
          <p>Total rows: {result.totalRows}</p>
          <p className="text-green-700">Successful: {result.successCount}</p>
          <p className="text-red-700">Failed: {result.failedCount}</p>
          {result.errors?.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm">Show errors</summary>
              <ul className="mt-2 text-xs space-y-1">
                {result.errors.map((e, i) => <li key={i}>Row {e.rowNumber}: {e.error}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

async function apiUpload<T>(path: string, form: FormData): Promise<T> {
  return (await import("@/lib/api")).apiUpload(path, form);
}