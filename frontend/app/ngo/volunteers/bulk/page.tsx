"use client";
import { useState } from "react";
import { Download, UploadCloud, AlertTriangle } from "lucide-react";
import { apiUpload, apiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionTitle, ErrorState } from "@/components/ui/page";
import { toast } from "@/components/ui/toast";
import type { BulkUploadResponse } from "@/lib/types";

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BulkUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError(null); setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await apiUpload<BulkUploadResponse>("/api/v1/ngo/volunteers/bulk", fd);
      setResult(r);
      toast(r.failedCount > 0 ? "info" : "success",
        "Upload complete",
        `${r.successCount} added, ${r.failedCount} failed.`);
    } catch (ex: any) { setError(ex.message); }
    finally { setBusy(false); }
  }

  async function downloadTemplate() {
    const res = await fetch(apiUrl("/api/v1/ngo/volunteers/bulk/template"));
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "volunteers-template.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Bulk add"
        title="Add up to 5,000 volunteers at once."
        description="Download the template, fill it in, and upload. Each volunteer receives a setup email."
      />

      <div className="nx-card space-y-6">
        <section>
          <SectionTitle eyebrow="Step 1" title="Get the template" />
          <p className="text-sm text-mist mb-4">
            Columns: name, email, phone, division, district, thana, gender, skills, nid, dateOfBirth.
            Division, district, thana, and gender must match the platform's data exactly.
          </p>
          <Button onClick={downloadTemplate} variant="secondary">
            <Download className="h-4 w-4" /> Download CSV template
          </Button>
        </section>

        <hr />

        <section>
          <SectionTitle eyebrow="Step 2" title="Upload your file" />
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block border border-dashed border-ink-300 rounded p-6 text-center cursor-pointer hover:bg-paper-200 transition">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <UploadCloud className="h-6 w-6 mx-auto text-mist" />
              <div className="mt-2 text-sm font-medium text-ink">
                {file ? file.name : "Click to choose a CSV file"}
              </div>
              {file && (
                <div className="text-xs text-mist mt-1 font-mono">
                  {(file.size / 1024).toFixed(1)} KB
                </div>
              )}
            </label>

            {error && <ErrorState title="Upload failed" description={error} />}

            <div className="flex justify-end">
              <Button type="submit" disabled={busy || !file}>
                {busy ? "Uploading…" : "Upload and process"}
              </Button>
            </div>
          </form>
        </section>
      </div>

      {result && (
        <div className="mt-8">
          <SectionTitle eyebrow="Result" title="Upload summary" />
          <div className="grid grid-cols-3 gap-px bg-ink-300 border border-ink-300">
            <div className="bg-paper p-6">
              <div className="eyebrow">Total rows</div>
              <div className="font-display text-3xl">{result.totalRows}</div>
            </div>
            <div className="bg-paper p-6">
              <div className="eyebrow text-relief-600">Successful</div>
              <div className="font-display text-3xl text-relief-600">{result.successCount}</div>
            </div>
            <div className="bg-paper p-6">
              <div className="eyebrow text-signal-700">Failed</div>
              <div className="font-display text-3xl text-signal-700">{result.failedCount}</div>
            </div>
          </div>

          {result.errors && result.errors.length > 0 && (
            <div className="mt-6 nx-card-flat">
              <div className="eyebrow mb-3 flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3 text-signal" /> Row errors
              </div>
              <ul className="divide-y divide-ink-300">
                {result.errors.map((e, i) => (
                  <li key={i} className="py-2 flex items-baseline gap-4">
                    <span className="font-mono text-xs text-mist w-24 shrink-0">Row {e.rowNumber}</span>
                    <span className="text-sm text-ink">{e.error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}