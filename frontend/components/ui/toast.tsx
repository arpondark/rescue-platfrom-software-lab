"use client";
import * as React from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; kind: ToastKind; title: string; description?: string };

const listeners = new Set<(t: Toast) => void>();
let nextId = 1;

export function toast(kind: ToastKind, title: string, description?: string) {
  const t: Toast = { id: nextId++, kind, title, description };
  listeners.forEach((fn) => fn(t));
}

export function ToastHost() {
  const [items, setItems] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    const onPush = (t: Toast) => {
      setItems((s) => [...s, t]);
      setTimeout(() => setItems((s) => s.filter((x) => x.id !== t.id)), 4000);
    };
    listeners.add(onPush);
    return () => { listeners.delete(onPush); };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-80">
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            "border rounded bg-surface shadow-panel p-3 flex items-start gap-2 animate-fade-in",
            t.kind === "success" && "border-relief-100",
            t.kind === "error"   && "border-signal-100",
            t.kind === "info"    && "border-ink-300"
          )}
        >
          {t.kind === "success" && <CheckCircle2 className="h-4 w-4 text-relief-500 mt-0.5" />}
          {t.kind === "error"   && <AlertTriangle className="h-4 w-4 text-signal mt-0.5" />}
          {t.kind === "info"    && <Info className="h-4 w-4 text-mist mt-0.5" />}
          <div className="flex-1">
            <div className="font-medium text-sm text-ink">{t.title}</div>
            {t.description && <div className="text-xs text-mist">{t.description}</div>}
          </div>
          <button onClick={() => setItems((s) => s.filter((x) => x.id !== t.id))}>
            <X className="h-3.5 w-3.5 text-mist" />
          </button>
        </div>
      ))}
    </div>
  );
}