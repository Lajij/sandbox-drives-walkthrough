# Talk track — Sandbox Drives (2–3 min)

Spoken script for JJ’s LinkedIn camera walkthrough. Issue-first. Pain and value only.  
Stage directions in `[click]` / `[say]`. Numbers on the overnight screen are illustrative demo figures, not official pricing.

---

## Open (≈15s)

[say] Enterprise agent fleets have a quiet tax: disposable-sandbox amnesia.  
When compute stops, the workspace dies with it — deps, on-disk memory, fixtures. Gone.  
So teams either keep expensive machines warm overnight… or rebuild every morning.

[say] Sandbox Drives fix that. Persistent storage you mount into a Vercel Sandbox. Files outlive the run.

---

## Stage 1 — Without Drive (≈40s)

[click] Stage 1: Without Drive · Start agent session  

[say] Here’s the default world. Agent builds a real workspace — memory, node_modules, repo cache.

[click] Stop sandbox  

[say] Session ends. Sandbox stops. Watch the disk — empty. Nothing survived.

[click] Next morning →  

[say] Next morning you’re back at zero. Rebuild cost, rebuild time, lost context. That’s the issue.

---

## Stage 2 — With Drive (≈45s)

[click] Next stage → · Mount Drive at /data  

[say] Same problem, different primitive. We mount a Drive at `/data`. Storage isn’t tied to this sandbox.

[click] Write workspace to /data  

[say] Agent writes the workspace onto the Drive. Brain and hands are still ephemeral. Files are not.

[click] Stop sandbox  

[say] Compute stops. Drive stays. Two-point-four gig retained.

[click] Remount on new sandbox  

[say] New sandbox. Same `/data`. Same files. No rebuild. That’s the split: brain, hands, files.

---

## Stage 3 — Overnight economics (≈30s)

[click] Next stage →  

[say] Overnight, the old playbook is keep machines warm so files don’t vanish — or eat a morning rebuild.  
With a Drive: compute off, storage stays. Remount in seconds.  
[say] The figures on screen are illustrative for the story — not a quote. The point is the shape of the cost: awake hands versus sleeping files.

---

## Stage 4 — Parallel snapshots (≈30s)

[click] Next stage → · Mount review + test snapshots  

[say] After a write, you don’t hand everyone write access.  
Mount point-in-time read-only snapshots. Review and test read the same workspace concurrently — no write risk, no waiting for a single sandbox.

---

## Close (≈15s)

[say] Disposable sandboxes were built for isolation. Agent fleets need persistence too.  
Sandbox Drives — public beta on Vercel. Mount `/data`, stop, remount. Files remain.

[optional] Link in the post: live demo + changelog.
