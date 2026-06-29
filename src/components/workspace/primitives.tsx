"use client";

import {useEffect, useState, type ReactNode} from "react";
import {CheckCircle2, FileAudio, Loader2, LockKeyhole} from "lucide-react";
import clsx from "clsx";
import type {Task} from "./types";

export function PanelTitle({icon, label}: {icon: ReactNode; label: string}) {
  return (
    <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-ink/55">
      <span className="text-tide">{icon}</span>
      {label}
    </h2>
  );
}

export function InsightPanel({icon, title, action, children}: {icon: ReactNode; title: string; action?: ReactNode; children: ReactNode}) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-white/70 p-4 transition hover:border-ink/15 hover:shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PanelTitle icon={icon} label={title} />
        {action}
      </div>
      <div className="mt-3 text-sm leading-6 text-ink/78">{children}</div>
    </section>
  );
}

export function ModeButton({active, icon, label, onClick}: {active: boolean; icon: ReactNode; label: string; onClick: () => void}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={clsx(
        "focus-ring flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition",
        active ? "bg-white text-ink shadow-soft" : "text-ink/55 hover:text-ink"
      )}
      onClick={onClick}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}

export function Fact({icon, label, items}: {icon: ReactNode; label: string; items: readonly string[]}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex] ?? "";

  useEffect(() => {
    if (items.length < 2) return;

    setActiveIndex(0);
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 1800);

    return () => window.clearInterval(interval);
  }, [items]);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-primary">{icon}</div>
      <div className="w-[250px] min-w-0">
        <div className="text-lg font-semibold text-ink">{label}</div>
        <div className="h-7 overflow-hidden text-primary">
          <div key={activeItem} className="animate-fade-up truncate whitespace-nowrap">
            {activeItem}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MindMap({node}: {node?: any}) {
  if (!node) return null;
  return (
    <div className="overflow-auto">
      <div className="inline-block min-w-full">
        <div className="rounded-xl bg-gradient-to-r from-tide to-sage px-3 py-2 text-center font-bold text-white shadow-soft">{node.label}</div>
        <div className="mt-3 grid gap-2">
          {node.children?.map((child: any, index: number) => (
            <div key={`${child.label}-${index}`} className="rounded-xl border border-tide/20 bg-tide/5 px-3 py-2">
              {child.label}
              {child.children?.length ? (
                <div className="mt-2 grid gap-1 text-xs text-ink/65">
                  {child.children.map((leaf: any) => <span key={leaf.label}>{leaf.label}</span>)}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StatusStrip({task, t}: {task: Task | null; t: (key: string) => string}) {
  const done = task?.status === "COMPLETED";
  const failed = task?.status === "FAILED";
  const icon = done ? <CheckCircle2 size={18} /> : failed ? <LockKeyhole size={18} /> : task ? <Loader2 className="animate-spin" size={18} /> : <FileAudio size={18} />;

  return (
    <div className="rounded-2xl border border-ink/20 bg-gradient-to-br from-ink to-ink/90 px-4 py-3.5 text-paper shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-bold">
          <span className={clsx(done && "text-sage", failed && "text-coral")}>{icon}</span>
          {t("status")}: {task?.status ?? t("ready")}
        </div>
        <div className="text-sm text-paper/65">{task?.provider ? `${task.provider} · ${task.detectedLanguage ?? ""}` : task?.statusMessage}</div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper/15">
        <div className={clsx("h-full rounded-full transition-all duration-500", failed ? "bg-coral" : "bg-gradient-to-r from-brass to-coral")} style={{width: `${task?.progress ?? 0}%`}} />
      </div>
    </div>
  );
}
