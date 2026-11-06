import { test } from "node:test";
import assert from "node:assert/strict";
import { pickNewPrs, reviewRequest } from "./watch-prs.mjs";

const pr = (number, paths, extra = {}) => ({
  number,
  title: `PR ${number}`,
  url: `https://github.com/o/r/pull/${number}`,
  author: { login: "dev" },
  headRefOid: "abcdef1234567",
  isDraft: false,
  files: paths.map((path) => ({ path })),
  ...extra,
});

test("picks only new, non-draft PRs that change a watched path", () => {
  const prs = [
    pr(1, ["demo/src/users.js"]),
    pr(2, ["README.md"]),
    pr(3, ["demo/test/users.test.js"], { isDraft: true }),
    pr(4, ["demo/src/log.js"]),
  ];
  const picked = pickNewPrs(prs, new Set([4]), ["demo/"]);
  assert.deepEqual(picked.map((p) => p.number), [1]);
});

test("review request addresses the auditor with the PR number", () => {
  const text = reviewRequest(pr(7, ["demo/a.js"]), "uvera-dpdp-auditor");
  assert.match(text, /^@uvera-dpdp-auditor review PR #7: /);
  assert.match(text, /head abcdef1\)/);
});
