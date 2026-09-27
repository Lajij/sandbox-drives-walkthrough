"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";

type StageId = 0 | 1 | 2 | 3;

type FileNode = {
  name: string;
  kind: "dir" | "file";
  size?: string;
  children?: FileNode[];
};

const WORKSPACE_FILES: FileNode[] = [
  {
    name: "agent-workspace",
    kind: "dir",
    children: [
      { name: "memory.jsonl", kind: "file", size: "42 MB" },
      { name: "node_modules/", kind: "dir", size: "1.2 GB" },
      { name: "repo-cache/", kind: "dir", size: "860 MB" },
      { name: "eval-fixtures/", kind: "dir", size: "310 MB" },
      { name: "last-run.lock", kind: "file", size: "2 KB" },
    ],
  },
];

const STAGES = [
  {
    id: 0 as StageId,
    label: "Without Drive",
    headline: "Disposable sandboxes forget everything",
    issue:
      "When the sandbox stops, the workspace dies with it. Morning starts empty — deps, memory, fixtures gone.",
  },
  {
    id: 1 as StageId,
    label: "With Drive",
    headline: "Mount /data. Stop. Remount. Files remain.",
    issue:
      "A Drive is storage that outlives the sandbox. Brain and hands can sleep; files stay mounted at /data.",
  },
  {
    id: 2 as StageId,
    label: "Overnight economics",
    headline: "Compute off. Storage stays.",
    issue:
      "Warm overnight machines burn compute for idle hands. Drives keep the workspace cheap while nothing is running.",
  },
  {
    id: 3 as StageId,
    label: "Parallel snapshots",
    headline: "One write. Many readers.",
    issue:
      "After a write, mount point-in-time read-only snapshots so review and test sandboxes read the same workspace concurrently.",
  },
] as const;

function VercelMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 76 65"
      fill="currentColor"
      aria-hidden
    >
      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
    </svg>
  );
}

function StatusDot({
  tone,
}: {
  tone: "idle" | "running" | "stopped" | "ok" | "warn";
}) {
  const color =
    tone === "running"
      ? "bg-success"
      : tone === "ok"
        ? "bg-success"
        : tone === "warn"
          ? "bg-warn"
          : tone === "stopped"
            ? "bg-danger"
            : "bg-muted";
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${color} ${tone === "running" ? "animate-pulse" : ""}`}
    />
  );
}

function FileTree({
  files,
  empty,
  emptyLabel,
}: {
  files: FileNode[];
  empty?: boolean;
  emptyLabel?: string;
}) {
  if (empty) {
    return (
      <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-black/40 px-4 text-center">
        <p className="font-mono text-sm text-danger">∅ empty</p>
        <p className="text-xs text-muted">
          {emptyLabel ?? "Workspace wiped with the sandbox"}
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-1 font-mono text-sm">
      {files.map((root) => (
        <li key={root.name}>
          <div className="flex items-center gap-2 text-foreground">
            <span className="text-muted">📁</span>
            <span>{root.name}</span>
          </div>
          <ul className="ml-5 mt-1 space-y-1 border-l border-border pl-3">
            {root.children?.map((child) => (
              <li
                key={child.name}
                className="flex items-center justify-between gap-3 text-muted"
              >
                <span className="flex items-center gap-2 text-foreground/90">
                  <span>{child.kind === "dir" ? "📂" : "📄"}</span>
                  {child.name}
                </span>
                {child.size ? (
                  <span className="text-xs text-muted">{child.size}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function SandboxCard({
  title,
  status,
  mount,
  children,
  badge,
}: {
  title: string;
  status: "running" | "stopped" | "idle";
  mount?: string;
  badge?: string;
  children: ReactNode;
}) {
  const tone =
    status === "running" ? "running" : status === "stopped" ? "stopped" : "idle";
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <StatusDot tone={tone} />
          <span className="text-sm font-medium">{title}</span>
          {badge ? (
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
              {badge}
            </span>
          ) : null}
        </div>
        <span className="font-mono text-xs uppercase tracking-wider text-muted">
          {status}
        </span>
      </div>
      {mount ? (
        <div className="border-b border-border bg-black/50 px-4 py-2 font-mono text-xs text-muted">
          mount <span className="text-foreground">{mount}</span>
        </div>
      ) : null}
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}

function StageWithoutDrive({
  phase,
  onRun,
  onStop,
  onMorning,
}: {
  phase: "idle" | "running" | "stopped" | "morning";
  onRun: () => void;
  onStop: () => void;
  onMorning: () => void;
}) {
  const empty = phase === "stopped" || phase === "morning";
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SandboxCard
        title="agent-run-47"
        status={phase === "running" ? "running" : phase === "idle" ? "idle" : "stopped"}
      >
        <FileTree
          files={WORKSPACE_FILES}
          empty={empty}
          emptyLabel={
            phase === "morning"
              ? "Next morning: rebuild from scratch"
              : "Sandbox stopped — local disk gone"
          }
        />
      </SandboxCard>
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-5">
        <div className="space-y-3">
          <p className="text-sm text-muted">What just happened</p>
          <ol className="space-y-3 text-sm leading-relaxed">
            <li
              className={
                phase === "idle" ? "text-foreground" : "text-muted line-through"
              }
            >
              1. Agent builds workspace on ephemeral disk
            </li>
            <li
              className={
                phase === "running"
                  ? "text-foreground"
                  : phase === "idle"
                    ? "text-muted"
                    : "text-muted line-through"
              }
            >
              2. Session ends — compute stops
            </li>
            <li
              className={
                phase === "stopped" || phase === "morning"
                  ? "text-danger"
                  : "text-muted"
              }
            >
              3. Workspace, deps, on-disk memory vanish
            </li>
            <li
              className={
                phase === "morning" ? "text-warn" : "text-muted"
              }
            >
              4. Morning = empty sandbox + full rebuild
            </li>
          </ol>
          {phase === "morning" ? (
            <div className="mt-4 rounded-lg border border-warn/30 bg-warn/5 px-4 py-3 text-sm">
              <p className="font-medium text-warn">The tax of amnesia</p>
              <p className="mt-1 text-muted">
                Illustrative demo: ~45 min rebuild · ~$12 compute · lost agent
                context. Teams either pay this every morning or keep machines
                warm overnight.
              </p>
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {phase === "idle" ? (
            <button
              type="button"
              onClick={onRun}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Start agent session
            </button>
          ) : null}
          {phase === "running" ? (
            <button
              type="button"
              onClick={onStop}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Stop sandbox
            </button>
          ) : null}
          {phase === "stopped" ? (
            <button
              type="button"
              onClick={onMorning}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Next morning →
            </button>
          ) : null}
          {phase === "morning" ? (
            <p className="text-sm text-muted">
              Ready for the fix — advance to With Drive.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StageWithDrive({
  phase,
  onMount,
  onWrite,
  onStop,
  onRemount,
}: {
  phase: "idle" | "mounted" | "written" | "stopped" | "remounted";
  onMount: () => void;
  onWrite: () => void;
  onStop: () => void;
  onRemount: () => void;
}) {
  const showFiles =
    phase === "written" || phase === "stopped" || phase === "remounted";
  const sandboxStatus =
    phase === "stopped" ? "stopped" : phase === "idle" ? "idle" : "running";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <SandboxCard
          title="agent-run-48"
          status={sandboxStatus}
          mount={
            phase === "idle"
              ? undefined
              : phase === "stopped"
                ? "/data → detached (Drive keeps files)"
                : "/data → drive:agent-workspace (rw)"
          }
          badge={phase !== "idle" ? "Drive attached" : undefined}
        >
          {phase === "idle" || phase === "mounted" ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 text-center">
              <p className="font-mono text-sm text-muted">
                {phase === "idle"
                  ? "No mount yet"
                  : "/data mounted — waiting for writes"}
              </p>
            </div>
          ) : (
            <FileTree
              files={WORKSPACE_FILES}
              empty={false}
            />
          )}
        </SandboxCard>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-2 text-xs uppercase tracking-wider text-muted">
            Persistent Drive
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm">agent-workspace</p>
              <p className="text-xs text-muted">lifecycle ≠ sandbox</p>
            </div>
            <StatusDot
              tone={
                phase === "stopped"
                  ? "ok"
                  : phase === "idle"
                    ? "idle"
                    : "running"
              }
            />
          </div>
          {showFiles ? (
            <p className="mt-3 font-mono text-xs text-success">
              ✓ 2.4 GB retained after stop
            </p>
          ) : (
            <p className="mt-3 font-mono text-xs text-muted">awaiting data…</p>
          )}
        </div>
      </div>
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-5">
        <div className="space-y-3">
          <p className="text-sm text-muted">Split brain / hands / files</p>
          <ul className="space-y-3 text-sm leading-relaxed">
            <li>
              <span className="text-muted">Brain</span> — model + orchestration
              (ephemeral)
            </li>
            <li>
              <span className="text-muted">Hands</span> — sandbox compute
              (start/stop anytime)
            </li>
            <li>
              <span className="text-foreground">Files</span> — Drive at{" "}
              <code className="rounded bg-black px-1.5 py-0.5 font-mono text-xs">
                /data
              </code>{" "}
              (persists)
            </li>
          </ul>
          {phase === "remounted" ? (
            <div className="mt-4 rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm">
              <p className="font-medium text-success">Same files. New sandbox.</p>
              <p className="mt-1 text-muted">
                Stop compute overnight. Remount /data in the morning. No rebuild.
                Context intact.
              </p>
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {phase === "idle" ? (
            <button
              type="button"
              onClick={onMount}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Mount Drive at /data
            </button>
          ) : null}
          {phase === "mounted" ? (
            <button
              type="button"
              onClick={onWrite}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Write workspace to /data
            </button>
          ) : null}
          {phase === "written" ? (
            <button
              type="button"
              onClick={onStop}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Stop sandbox
            </button>
          ) : null}
          {phase === "stopped" ? (
            <button
              type="button"
              onClick={onRemount}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Remount on new sandbox
            </button>
          ) : null}
          {phase === "remounted" ? (
            <p className="text-sm text-muted">
              Files survived. Advance for overnight economics.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StageEconomics() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">
        Numbers below are illustrative for the demo story — not official Vercel
        pricing.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-danger/40 bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted">
            Without Drive
          </p>
          <h3 className="mt-2 text-lg font-medium">Keep machines warm</h3>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            Idle compute stays up so the workspace doesn&apos;t vanish. You pay
            for hands that aren&apos;t working.
          </p>
          <dl className="mt-6 space-y-3 font-mono text-sm">
            <div className="flex justify-between border-b border-border pb-2">
              <dt className="text-muted">Overnight compute (8h)</dt>
              <dd className="text-danger">~$18.00</dd>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <dt className="text-muted">Or morning rebuild</dt>
              <dd className="text-danger">~$12 + 45 min</dd>
            </div>
            <div className="flex justify-between pt-1">
              <dt className="text-muted">Agent context</dt>
              <dd className="text-danger">reset / fragile</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-xl border border-success/40 bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted">
            With Drive
          </p>
          <h3 className="mt-2 text-lg font-medium">Compute off. Files stay.</h3>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            Stop the sandbox. The Drive holds deps, memory, fixtures. Remount
            when work resumes.
          </p>
          <dl className="mt-6 space-y-3 font-mono text-sm">
            <div className="flex justify-between border-b border-border pb-2">
              <dt className="text-muted">Overnight compute</dt>
              <dd className="text-success">$0.00</dd>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <dt className="text-muted">Drive storage (~2.4 GB)</dt>
              <dd className="text-success">~$0.004 / night</dd>
            </div>
            <div className="flex justify-between pt-1">
              <dt className="text-muted">Morning start</dt>
              <dd className="text-success">remount · seconds</dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted">
        <span className="text-foreground">The issue isn&apos;t storage cost.</span>{" "}
        It&apos;s paying for awake compute just so files don&apos;t disappear —
        or rebuilding the world every morning.
      </div>
    </div>
  );
}

function StageSnapshots({
  phase,
  onSnapshot,
}: {
  phase: "ready" | "parallel";
  onSnapshot: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <SandboxCard
          title="writer"
          status={phase === "parallel" ? "stopped" : "running"}
          mount="/data → drive (rw)"
          badge="wrote once"
        >
          <FileTree files={WORKSPACE_FILES} />
          <p className="mt-3 font-mono text-xs text-muted">
            One read-write mount at a time
          </p>
        </SandboxCard>
        <SandboxCard
          title="review"
          status={phase === "parallel" ? "running" : "idle"}
          mount={
            phase === "parallel"
              ? "/data → snapshot (ro)"
              : "waiting for snapshot"
          }
          badge={phase === "parallel" ? "read-only" : undefined}
        >
          {phase === "parallel" ? (
            <>
              <FileTree files={WORKSPACE_FILES} />
              <p className="mt-3 font-mono text-xs text-success">
                Point-in-time · concurrent
              </p>
            </>
          ) : (
            <div className="flex min-h-[140px] items-center justify-center text-sm text-muted">
              Idle
            </div>
          )}
        </SandboxCard>
        <SandboxCard
          title="test"
          status={phase === "parallel" ? "running" : "idle"}
          mount={
            phase === "parallel"
              ? "/data → snapshot (ro)"
              : "waiting for snapshot"
          }
          badge={phase === "parallel" ? "read-only" : undefined}
        >
          {phase === "parallel" ? (
            <>
              <FileTree files={WORKSPACE_FILES} />
              <p className="mt-3 font-mono text-xs text-success">
                Same Drive · no write risk
              </p>
            </>
          ) : (
            <div className="flex min-h-[140px] items-center justify-center text-sm text-muted">
              Idle
            </div>
          )}
        </SandboxCard>
      </div>
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-sm">
          <p className="font-medium">
            {phase === "parallel"
              ? "Review and test read the same workspace — concurrently."
              : "After the write, share the Drive without handing out write access."}
          </p>
          <p className="text-muted">
            Snapshots are point-in-time. Later writes need a new snapshot mount.
          </p>
        </div>
        {phase === "ready" ? (
          <button
            type="button"
            onClick={onSnapshot}
            className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Mount review + test snapshots
          </button>
        ) : (
          <span className="shrink-0 font-mono text-xs text-success">
            ✓ parallel readers live
          </span>
        )}
      </div>
    </div>
  );
}

export function Walkthrough() {
  const [stage, setStage] = useState<StageId>(0);
  const [withoutPhase, setWithoutPhase] = useState<
    "idle" | "running" | "stopped" | "morning"
  >("idle");
  const [withPhase, setWithPhase] = useState<
    "idle" | "mounted" | "written" | "stopped" | "remounted"
  >("idle");
  const [snapPhase, setSnapPhase] = useState<"ready" | "parallel">("ready");

  const current = STAGES[stage];

  const canAdvance = useMemo(() => {
    if (stage === 0) return withoutPhase === "morning";
    if (stage === 1) return withPhase === "remounted";
    if (stage === 2) return true;
    if (stage === 3) return snapPhase === "parallel";
    return false;
  }, [stage, withoutPhase, withPhase, snapPhase]);

  const goNext = useCallback(() => {
    if (stage < 3) setStage((s) => (s + 1) as StageId);
  }, [stage]);

  const goPrev = useCallback(() => {
    if (stage > 0) setStage((s) => (s - 1) as StageId);
  }, [stage]);

  const resetAll = useCallback(() => {
    setStage(0);
    setWithoutPhase("idle");
    setWithPhase("idle");
    setSnapPhase("ready");
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <header className="flex flex-col gap-6 border-b border-border pb-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <VercelMark className="h-4 w-4 text-white" />
            <span className="text-sm text-muted">Vercel Sandbox</span>
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted">
              Public beta
            </span>
          </div>
          <button
            type="button"
            onClick={resetAll}
            className="text-xs text-muted transition hover:text-foreground"
          >
            Reset demo
          </button>
        </div>
        <div className="max-w-2xl space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Sandbox Drives
          </h1>
          <p className="text-base leading-relaxed text-muted sm:text-lg">
            Enterprise agent fleets hit disposable-sandbox amnesia. When compute
            stops, workspace and on-disk memory vanish. Drives split brain,
            hands, and files — so storage outlives the run.
          </p>
        </div>
      </header>

      <nav aria-label="Walkthrough stages" className="overflow-x-auto">
        <ol className="flex min-w-max gap-2">
          {STAGES.map((s, i) => {
            const active = stage === s.id;
            const done = stage > s.id;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setStage(s.id)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                    active
                      ? "border-white bg-white text-black"
                      : done
                        ? "border-border bg-card text-foreground hover:border-muted"
                        : "border-border text-muted hover:border-muted hover:text-foreground"
                  }`}
                >
                  <span className="font-mono text-xs opacity-70">{i + 1}</span>
                  {s.label}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-wider text-muted">
            Stage {stage + 1} of 4
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            {current.headline}
          </h2>
          <p className="max-w-2xl text-muted leading-relaxed">{current.issue}</p>
        </div>

        {stage === 0 ? (
          <StageWithoutDrive
            phase={withoutPhase}
            onRun={() => setWithoutPhase("running")}
            onStop={() => setWithoutPhase("stopped")}
            onMorning={() => setWithoutPhase("morning")}
          />
        ) : null}
        {stage === 1 ? (
          <StageWithDrive
            phase={withPhase}
            onMount={() => setWithPhase("mounted")}
            onWrite={() => setWithPhase("written")}
            onStop={() => setWithPhase("stopped")}
            onRemount={() => setWithPhase("remounted")}
          />
        ) : null}
        {stage === 2 ? <StageEconomics /> : null}
        {stage === 3 ? (
          <StageSnapshots
            phase={snapPhase}
            onSnapshot={() => setSnapPhase("parallel")}
          />
        ) : null}
      </section>

      <footer className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={stage === 0}
            className="rounded-full border border-border px-4 py-2 text-sm text-foreground transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ← Back
          </button>
          {stage < 3 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canAdvance && stage !== 2}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next stage →
            </button>
          ) : (
            <button
              type="button"
              onClick={resetAll}
              className="rounded-full border border-border px-4 py-2 text-sm transition hover:bg-white/5"
            >
              Replay from start
            </button>
          )}
        </div>
        <p className="text-xs text-muted">
          Simulated client-side demo ·{" "}
          <a
            className="underline underline-offset-2 hover:text-foreground"
            href="https://vercel.com/changelog/drives-for-vercel-sandbox-are-now-in-public-beta"
            target="_blank"
            rel="noreferrer"
          >
            Changelog
          </a>{" "}
          ·{" "}
          <a
            className="underline underline-offset-2 hover:text-foreground"
            href="https://vercel.com/kb/guide/vercel-drives"
            target="_blank"
            rel="noreferrer"
          >
            Docs
          </a>
        </p>
      </footer>
    </div>
  );
}
