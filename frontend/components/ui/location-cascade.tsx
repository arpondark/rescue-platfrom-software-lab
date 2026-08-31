"use client";
import * as React from "react";
import { Label } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { Location } from "@/lib/types";
import { ChevronDown } from "lucide-react";

/* Division → District → Thana cascade, hits /api/v1/locations. */
export function LocationCascade({
  value,
  onChange,
  required = false,
  showLabel = true,
}: {
  value: { divisionId?: number; districtId?: number; thanaId?: number };
  onChange: (v: { divisionId?: number; districtId?: number; thanaId?: number }) => void;
  required?: boolean;
  showLabel?: boolean;
}) {
  const [divisions, setDivisions] = React.useState<Location[]>([]);
  const [districts, setDistricts] = React.useState<Location[]>([]);
  const [thanas, setThanas] = React.useState<Location[]>([]);

  React.useEffect(() => {
    api<Location[]>("/api/v1/locations/divisions").then(setDivisions).catch(() => setDivisions([]));
  }, []);

  React.useEffect(() => {
    if (!value.divisionId) { setDistricts([]); setThanas([]); return; }
    api<Location[]>(`/api/v1/locations/districts?divisionId=${value.divisionId}`)
      .then(setDistricts).catch(() => setDistricts([]));
    setThanas([]);
  }, [value.divisionId]);

  React.useEffect(() => {
    if (!value.districtId) { setThanas([]); return; }
    api<Location[]>(`/api/v1/locations/thanas?districtId=${value.districtId}`)
      .then(setThanas).catch(() => setThanas([]));
  }, [value.districtId]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        {showLabel && <Label>Division {required && <span className="text-red-400">*</span>}</Label>}
        <Select
          placeholder="Choose a division"
          options={divisions.map((d) => ({ value: String(d.id), label: `${d.name}${d.bnName ? ` · ${d.bnName}` : ""}` }))}
          value={value.divisionId ? String(value.divisionId) : ""}
          onChange={(v) => onChange({ divisionId: v ? Number(v) : undefined })}
        />
      </div>
      <div>
        {showLabel && <Label>District {required && <span className="text-red-400">*</span>}</Label>}
        <Select
          placeholder={value.divisionId ? "Choose a district" : "Pick a division first"}
          disabled={!value.divisionId}
          options={districts.map((d) => ({ value: String(d.id), label: `${d.name}${d.bnName ? ` · ${d.bnName}` : ""}` }))}
          value={value.districtId ? String(value.districtId) : ""}
          onChange={(v) => onChange({ ...value, districtId: v ? Number(v) : undefined, thanaId: undefined })}
        />
      </div>
      <div>
        {showLabel && <Label>Thana {required && <span className="text-red-400">*</span>}</Label>}
        <Select
          placeholder={value.districtId ? "Choose a thana" : "Pick a district first"}
          disabled={!value.districtId}
          options={thanas.map((d) => ({ value: String(d.id), label: d.name }))}
          value={value.thanaId ? String(value.thanaId) : ""}
          onChange={(v) => onChange({ ...value, thanaId: v ? Number(v) : undefined })}
        />
      </div>
    </div>
  );
}

function Select({
  options,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-md border border-slate-700/80 bg-slate-900/60 px-4 pr-8 text-sm text-slate-100 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50"
      >
        <option value="">{placeholder ?? "Select…"}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="h-4 w-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}