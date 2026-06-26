import type {ReactNode} from "react";
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

export function InsightPanel({icon, title, children}: {icon: ReactNode; title: string; children: ReactNode}) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-white/70 p-4 transition hover:border-ink/15 hover:shadow-soft">
      <PanelTitle icon={icon} label={title} />
      <div className="mt-3 text-sm leading-6 text-ink/78">{children}</div>
    </section>
  );
}

export function ModeButton({active, icon, label, onClick}: {active: boolean; icon: ReactNode; label: string; onClick: () => void}) {
  return (
    <button
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

export function AssetTab({active, label, onClick}: {active: boolean; label: string; onClick: () => void}) {
  return (
    <button type="button" className={clsx("focus-ring rounded-lg px-2 py-2 text-xs font-black transition", active ? "bg-white text-ink shadow-soft" : "text-ink/55 hover:text-ink")} onClick={onClick}>
      {label}
    </button>
  );
}

export function QuotaLine({label, value, percent}: {label: string; value: string; percent: number}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-bold text-ink/65">
        <span>{label}</span>
        <span className="text-ink/80">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-gradient-to-r from-tide to-sage transition-all duration-500" style={{width: `${percent}%`}} />
      </div>
    </div>
  );
}

export function UsageMetric({label, value}: {label: string; value: string}) {
  return (
    <div className="rounded-xl bg-paper/70 p-3 ring-1 ring-ink/5">
      <div className="text-xs font-bold text-ink/50">{label}</div>
      <div className="mt-1 break-words text-base font-black text-ink">{value}</div>
    </div>
  );
}

export function Fact({icon, label}: {icon: ReactNode; label: string}) {
  return (
    <div className="min-h-20 rounded-xl border border-ink/10 bg-white/60 p-2.5 transition hover:border-tide/30 hover:bg-white/80">
      <div className="mb-2 text-tide">{icon}</div>
      <div className="leading-4">{label}</div>
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
