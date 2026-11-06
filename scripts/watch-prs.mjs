#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function pickNewPrs(prs, seen, paths) {
  return prs.filter(
    (pr) =>
      !pr.isDraft &&
      !seen.has(pr.number) &&
      pr.files.some((f) => paths.some((p) => f.path.startsWith(p))),
  );
}

export function reviewRequest(pr, auditor) {
  return `@${auditor} review PR #${pr.number}: ${pr.title} (opened by ${pr.author.login}, head ${pr.headRefOid.slice(0, 7)}) ${pr.url}`;
}

function listOpenPrs(repo) {
  const out = execFileSync(
    "gh",
    ["pr", "list", "-R", repo, "--state", "open", "--limit", "50",
     "--json", "number,title,url,author,headRefOid,isDraft,files"],
    { encoding: "utf8" },
  );
  return JSON.parse(out);
}

async function main() {
  const repo = process.env.DPDP_REPO ?? "sachin-uvera/dpdp-pr-room";
  const hook = process.env.DPDP_WEBHOOK_URL;
  const auditor = process.env.DPDP_AUDITOR ?? "uvera-dpdp-auditor";
  const paths = (process.env.DPDP_WATCH_PATHS ?? "demo/").split(",");
  const everyMs = Number(process.env.DPDP_POLL_SECONDS ?? 60) * 1000;
  const stateFile = process.env.DPDP_STATE_FILE ?? ".watch-prs-state.json";
  const dryRun = process.argv.includes("--dry-run");

  if (!hook && !dryRun) {
    console.error("DPDP_WEBHOOK_URL is not set. Run with --env-file=<file> or --dry-run.");
    process.exit(1);
  }

  const seen = new Set(existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, "utf8")) : []);
  if (!existsSync(stateFile)) {
    for (const pr of listOpenPrs(repo)) seen.add(pr.number);
    writeFileSync(stateFile, JSON.stringify([...seen]));
    console.log(`First run: ${seen.size} open PR(s) marked as already seen. Watching for new ones.`);
  }

  console.log(`Watching ${repo} every ${everyMs / 1000}s for new PRs that change ${paths.join(", ")}`);
  for (;;) {
    try {
      for (const pr of pickNewPrs(listOpenPrs(repo), seen, paths)) {
        const text = reviewRequest(pr, auditor);
        if (dryRun) {
          console.log(`[dry run] would post: ${text}`);
        } else {
          const res = await fetch(hook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });
          if (!res.ok) throw new Error(`Mattermost webhook returned ${res.status}`);
          console.log(`Posted review request for PR #${pr.number}`);
        }
        seen.add(pr.number);
        writeFileSync(stateFile, JSON.stringify([...seen]));
      }
    } catch (err) {
      console.error(`${new Date().toISOString()} ${err.message}. Retrying next poll.`);
    }
    await new Promise((r) => setTimeout(r, everyMs));
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
