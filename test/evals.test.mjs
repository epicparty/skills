// The eval harness grades agents, so a bug in it misjudges every skill change. These tests run the
// graders on real prepared projects, against the work of an honest agent and of one that cheats.
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { grade } from '../evals/lib/graders.mjs';
import { fisherExact, verdict } from '../evals/lib/stats.mjs';
import { git, loadTasks, prepare } from '../evals/lib/workspace.mjs';

const SKILLS = new URL('../skills', import.meta.url).pathname;
const tasks = Object.fromEntries(loadTasks().map((t) => [t.name, t]));
const made = [];
after(() => made.forEach((dir) => rmSync(dir, { recursive: true, force: true })));

function workspace(name) {
  const ws = prepare(tasks[name], SKILLS);
  made.push(ws.dir);
  return ws;
}

function commitOnBranch(dir, files) {
  git(dir, 'switch', '-q', '-c', 'feat/work');
  for (const [path, text] of Object.entries(files)) writeFileSync(join(dir, path), text);
  git(dir, 'add', '-A');
  git(dir, 'commit', '-q', '-m', 'feat: work');
}

const results = (task, ws, extra = {}) =>
  Object.fromEntries(grade(task, { ...ws, output: '', questions: 0, ...extra }).map((g) => [g.label, g.pass]));

const SLUGIFY = `export function slugify(title, { maxLength } = {}) {
  const slug = title.normalize('NFKD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (maxLength === undefined || slug.length <= maxLength) return slug;
  const cut = slug.slice(0, maxLength + 1);
  const at = cut.lastIndexOf('-');
  return at > 0 ? cut.slice(0, at) : slug.slice(0, maxLength);
}
`;
const NEW_TEST = `import assert from 'node:assert/strict';
import { test } from 'node:test';
import { slugify } from '../src/slugify.mjs';
test('cuts at a word boundary', () => assert.equal(slugify('Ten Tips for Better Sleep', { maxLength: 14 }), 'ten-tips-for'));
`;

describe('eval tasks', () => {
  it('each has a prompt, a split and graders', () => {
    assert.ok(Object.keys(tasks).length >= 4);
    for (const t of Object.values(tasks)) {
      assert.ok(t.prompt.startsWith(`/ev-${t.skill}`), t.name);
      assert.ok(['train', 'holdout'].includes(t.split), t.name);
      assert.ok(t.graders.length > 0, t.name);
    }
  });
  it('keep a held-out task the climb never tunes on', () => {
    assert.ok(Object.values(tasks).some((t) => t.split === 'holdout'));
  });
});

describe('a prepared project', () => {
  it('starts clean on main with the skills installed but untracked', () => {
    const ws = workspace('implement-story');
    assert.equal(git(ws.dir, 'branch', '--show-current'), 'main');
    assert.equal(git(ws.dir, 'status', '--porcelain'), '');
    assert.equal(git(ws.dir, 'rev-parse', 'HEAD'), ws.base);
    assert.match(git(ws.dir, 'ls-files', '--others', '--ignored', '--exclude-standard', '--directory'), /\.claude\//);
  });
  it('checks out the branch under review for a review task', () => {
    const ws = workspace('code-review-planted');
    assert.equal(git(ws.dir, 'branch', '--show-current'), 'feat/discount');
  });
});

describe('graders, on implement-story', () => {
  const task = tasks['implement-story'];

  it('pass honest work: a branch, a red-first test, the story built', () => {
    const ws = workspace('implement-story');
    commitOnBranch(ws.dir, { 'src/slugify.mjs': SLUGIFY, 'test/max-length.test.mjs': NEW_TEST });
    for (const [label, pass] of Object.entries(results(task, ws))) assert.ok(pass, label);
  });

  it('fail work left on main', () => {
    const ws = workspace('implement-story');
    const r = results(task, ws);
    assert.equal(r['on-a-branch'], false);
    assert.equal(r['new-tests-red-on-base src'], false);
  });

  it('fail a new test that passes on the old code too', () => {
    const ws = workspace('implement-story');
    commitOnBranch(ws.dir, {
      'src/slugify.mjs': SLUGIFY,
      'test/extra.test.mjs': "import { test } from 'node:test';\ntest('always', () => {});\n",
    });
    assert.equal(results(task, ws)['new-tests-red-on-base src'], false);
  });

  it('fail a weakened existing test', () => {
    const ws = workspace('implement-story');
    commitOnBranch(ws.dir, {
      'src/slugify.mjs': SLUGIFY,
      'test/max-length.test.mjs': NEW_TEST,
      'test/slugify.test.mjs': "import { test } from 'node:test';\ntest('nothing', () => {});\n",
    });
    assert.equal(results(task, ws)['existing-tests-kept test/slugify.test.mjs'], false);
  });

  it('fail code shaped around its own test, through the held-out tests', () => {
    const ws = workspace('implement-story');
    const hardcoded = "import { slugify as base } from './base.mjs';\nexport function slugify(t, o = {}) { return o.maxLength === 14 ? 'ten-tips-for' : base(t); }\n";
    commitOnBranch(ws.dir, { 'src/slugify.mjs': hardcoded, 'src/base.mjs': SLUGIFY, 'test/max-length.test.mjs': NEW_TEST });
    const r = results(task, ws);
    assert.equal(r['suite-green'], true);
    assert.equal(r['new-tests-red-on-base src'], true);
    assert.equal(r['hidden-tests-pass test'], false);
  });
});

describe('graders, on setup-accept', () => {
  const task = tasks['setup-accept'];
  const write = (dir, path, text) => {
    mkdirSync(join(dir, path, '..'), { recursive: true });
    writeFileSync(join(dir, path), text);
  };

  it('pass settings written where the home says, with Labels and Full suite ruled out', () => {
    const ws = workspace('setup-accept');
    write(ws.dir, 'AGENTS.md', '# Agents\n\n## Agent skills\n\n`ev-*` settings: `docs/agents/<topic>.md`, one heading per setting.\n');
    write(ws.dir, 'docs/agents/issue-tracker.md', '## Tracker\n\nNone — no remote.\n');
    write(ws.dir, 'docs/agents/validation.md', '## Scoped check\n\nThese commands: `npm run lint`, `npm test`\n');
    write(ws.dir, 'docs/agents/testing.md', '## Test levels\n\n| unit | node:test |\n');
    for (const [label, pass] of Object.entries(results(task, ws, { questions: 1 }))) assert.ok(pass, label);
  });

  it('fail settings that should have been ruled out, an empty one, and a second question', () => {
    const ws = workspace('setup-accept');
    write(ws.dir, 'docs/agents/issue-tracker.md', '## Tracker\n\nGitHub Issues\n\n## Labels\n\nThe defaults.\n');
    write(ws.dir, 'docs/agents/validation.md', '## Scoped check\n\n## Full suite\n\nCI runs it.\n');
    const r = results(task, ws, { questions: 16 });
    assert.equal(r['settings-home-recorded AGENTS.md'], false);
    assert.equal(r['setting-written docs/agents/issue-tracker.md Tracker None'], false);
    assert.equal(r['setting-written docs/agents/validation.md Scoped check npm (run )?test'], false);
    assert.equal(r['setting-absent docs/agents/issue-tracker.md Labels'], false);
    assert.equal(r['setting-absent docs/agents/validation.md Full suite'], false);
    assert.equal(r['questions-at-most 1'], false);
  });
});

describe('graders, on code-review-planted', () => {
  const task = tasks['code-review-planted'];

  it('pass a review that names both planted defects and changes nothing', () => {
    const ws = workspace('code-review-planted');
    const output = '## Spec\n- Story 3 is missing: FLAT500 on a 300-cent total returns a negative amount.\n- `TEST10` is special-cased.';
    for (const [label, pass] of Object.entries(results(task, ws, { output }))) assert.ok(pass, label);
  });

  it('fail a review that misses them, or one that edits the branch', () => {
    const ws = workspace('code-review-planted');
    writeFileSync(join(ws.dir, 'src', 'discount.mjs'), 'export const applyDiscount = (t) => t;\n');
    const r = results(task, ws, { output: 'Looks good to me.' });
    assert.equal(r['names the missing never-below-zero story'], false);
    assert.equal(r['names the special-cased test code'], false);
    assert.equal(r['tree-unchanged'], false);
  });
});

describe('graders, on diagnose-handoff', () => {
  const task = tasks['diagnose-handoff'];
  const FIXED = `export function totalOf(csv) {
  let cents = 0;
  for (const row of csv.split(/\\r?\\n/).slice(1)) {
    if (row.trim() === '') continue;
    cents += Math.round(Number.parseFloat(row.split(',').at(-1)) * 100);
  }
  return cents;
}
`;
  const TEST = "import assert from 'node:assert/strict';\nimport { test } from 'node:test';\nimport { totalOf } from '../src/total.mjs';\ntest('blank line', () => assert.equal(totalOf('date,description,amount\\n2026-11-05,Coffee,-3.20\\n'), -320));\n";
  const verdict = 'Fixed. Follow-up 1, a CSV library: not worth it — the export has not changed since 2019. Follow-up 2, a nightly job: not worth it.';

  it('pass the fix alone, with each follow-up weighed', () => {
    const ws = workspace('diagnose-handoff');
    commitOnBranch(ws.dir, { 'src/total.mjs': FIXED, 'test/blank-line.test.mjs': TEST });
    for (const [label, pass] of Object.entries(results(task, ws, { output: verdict }))) assert.ok(pass, label);
  });

  it('fail follow-ups built or filed beside the fix, and a reply with no verdict', () => {
    const ws = workspace('diagnose-handoff');
    commitOnBranch(ws.dir, { 'src/total.mjs': FIXED, 'test/blank-line.test.mjs': TEST });
    mkdirSync(join(ws.dir, 'docs/stories'), { recursive: true });
    writeFileSync(join(ws.dir, 'docs/stories/csv-library.md'), '# p1: a CSV library\n');
    const r = results(task, ws, { output: 'Fixed, and I wrote the two follow-up stories.' });
    assert.equal(r['suite-green'], true);
    assert.equal(r['builds and files no follow-up'], false);
    assert.equal(r['gives the follow-ups a verdict'], false);
  });

  it('fail a dependency committed with the fix', () => {
    const ws = workspace('diagnose-handoff');
    commitOnBranch(ws.dir, {
      'src/total.mjs': FIXED,
      'package.json': '{ "name": "monthtotal", "type": "module", "scripts": { "test": "node --test" }, "dependencies": { "csv-parse": "^5" } }\n',
    });
    assert.equal(results(task, ws, { output: verdict })['builds and files no follow-up'], false);
  });
});

describe('graders, on implement-absence', () => {
  const task = tasks['implement-absence'];
  const BUILT = readFileSync(join(task.dir, 'fixture/src/reminders.mjs'), 'utf8')
    .replace('    reminders.push', '    if (user.prefs?.unsubscribed) continue;\n    reminders.push');
  const test = (body) => `import assert from 'node:assert/strict';\nimport { test } from 'node:test';\nimport { remindersFor } from '../src/reminders.mjs';\nconst NOW = Date.parse('2026-11-20T12:00:00Z');\nconst u = (prefs) => ({ email: 'a@x.io', cart: ['tea'], cartUpdatedAt: NOW - 2 * 86400000, prefs });\n${body}\n`;
  const ABSENCE = "test('no reminder after unsubscribing', () => assert.deepEqual(remindersFor([u({ unsubscribed: true })], NOW), []));";
  const PAIR = "test('a subscriber with preferences is still reminded', () => assert.equal(remindersFor([u({ unsubscribed: false })], NOW).length, 1));";

  it('pass an absence paired with the case where the reminder still goes', () => {
    const ws = workspace('implement-absence');
    commitOnBranch(ws.dir, { 'src/reminders.mjs': BUILT, 'test/unsubscribed.test.mjs': test(`${ABSENCE}\n${PAIR}`) });
    for (const [label, pass] of Object.entries(results(task, ws))) assert.ok(pass, label);
  });

  it('fail an absence asserted alone, which a defect that drops everyone also passes', () => {
    const ws = workspace('implement-absence');
    commitOnBranch(ws.dir, { 'src/reminders.mjs': BUILT, 'test/unsubscribed.test.mjs': test(ABSENCE) });
    const r = results(task, ws);
    assert.equal(r['hidden-tests-pass test'], true);
    assert.equal(r['a test sees the reminder a subscriber still gets'], false);
  });
});

describe('graders, on diagnose-root-cause', () => {
  const task = tasks['diagnose-root-cause'];
  const TEST = "import assert from 'node:assert/strict';\nimport { test } from 'node:test';\nimport { loadUsers } from '../src/users.mjs';\ntest('crlf', () => assert.equal(loadUsers('name,email\\r\\nAda,a@x.io\\r\\n')[0].email, 'a@x.io'));\n";
  const GUARD_TEST = "import assert from 'node:assert/strict';\nimport { test } from 'node:test';\nimport { digestRecipients } from '../src/digest.mjs';\ntest('no crash', () => assert.deepEqual(digestRecipients([{}]), []));\n";

  it('pass a fix in the parser', () => {
    const ws = workspace('diagnose-root-cause');
    commitOnBranch(ws.dir, {
      'src/users.mjs': "export function loadUsers(csv) {\n  const [header, ...rows] = csv.split(/\\r?\\n/).filter((line) => line !== '');\n  const keys = header.split(',');\n  return rows.map((row) => Object.fromEntries(row.split(',').map((value, i) => [keys[i], value])));\n}\n",
      'test/crlf.test.mjs': TEST,
    });
    for (const [label, pass] of Object.entries(results(task, ws))) assert.ok(pass, label);
  });

  it('fail a guard at the crash site, which drops the users it cannot read', () => {
    const ws = workspace('diagnose-root-cause');
    commitOnBranch(ws.dir, {
      'src/digest.mjs': "export function digestRecipients(users) {\n  return [...new Set(users.filter((u) => u.email).map((u) => u.email.toLowerCase()))];\n}\n",
      'test/guard.test.mjs': GUARD_TEST,
    });
    const r = results(task, ws);
    assert.equal(r['suite-green'], true);
    assert.equal(r['fixes the parser, not the crash site'], false);
  });
});

describe('graders, on the read-only tasks', () => {
  it('triage-regression: pass a regression sent to diagnose, fail a duplicate closed', () => {
    const task = tasks['triage-regression'];
    const ws = workspace('triage-regression');
    const good = results(task, ws, { output: '### Premise\n- Reproduced: 2 of 3 orders. A regression of #7.\n### Verdict — Ready\nNext: `/ev-diagnose`.' });
    for (const [label, pass] of Object.entries(good)) assert.ok(pass, label);
    const bad = results(task, ws, { output: '### Verdict — Close\nDuplicate of #7.' });
    assert.equal(bad['does not close it as a duplicate'], false);
    assert.equal(bad['reads it as a regression'], false);
  });
  it('triage-refusal: pass a report that puts the refusal back to the user', () => {
    const task = tasks['triage-refusal'];
    const ws = workspace('triage-refusal');
    for (const [label, pass] of Object.entries(results(task, ws, { output: 'Declined in #9 because of a second format to maintain; does that still hold?' }))) assert.ok(pass, label);
    assert.equal(results(task, ws, { output: 'Viable. Ready.' })['names the earlier refusal'], false);
  });
  it('to-pr-body: pass a body that names the door and the blast radius', () => {
    const task = tasks['to-pr-body'];
    const ws = workspace('to-pr-body');
    for (const [label, pass] of Object.entries(results(task, ws, { output: '## Merge danger\nDoor: one-way — drops `legacy_total`.\nBlast radius: every order has lines.' }))) assert.ok(pass, label);
  });
  it('retro-session: pass a cited report, fail one that edits the repo', () => {
    const task = tasks['retro-session'];
    const ws = workspace('retro-session');
    const output = '| T18 | import rule | a lint rule | — |\n| T22 | no CI | a CI workflow | — |\n| T3–T15 | navigation | point AGENTS.md at config/rates.json | — |';
    for (const [label, pass] of Object.entries(results(task, ws, { output }))) assert.ok(pass, label);
    writeFileSync(join(ws.dir, 'AGENTS.md'), 'changed\n');
    assert.equal(results(task, ws, { output })['tree-unchanged'], false);
  });
});

describe('comparing runs', () => {
  it('computes the two-sided Fisher exact p', () => {
    assert.ok(Math.abs(fisherExact(4, 4, 0, 4) - 0.02857) < 1e-4);
    assert.ok(Math.abs(fisherExact(5, 6, 1, 6) - 0.08009) < 1e-4);
    assert.ok(Math.abs(fisherExact(2, 4, 2, 4) - 1) < 1e-9);
  });
  it('calls a clear gain better, a clear loss worse, and a small gap noise', () => {
    assert.equal(verdict(0, 4, 4, 4).verdict, 'better');
    assert.equal(verdict(4, 4, 0, 4).verdict, 'worse');
    assert.equal(verdict(2, 4, 3, 4).verdict, 'same');
  });
  it('refuses a verdict on fewer than four runs a side', () => {
    assert.equal(verdict(0, 3, 3, 3).verdict, 'too few runs');
  });
});
