# Upstream

Parts of this pack are adapted from [mattpocock/skills](https://github.com/mattpocock/skills) and from [backnotprop/pstack](https://github.com/backnotprop/pstack), each under its MIT license ([`NOTICE`](./NOTICE)). This file records where each upstream file went, and the upstream commit it was last synced from. It is for maintainers: the CLI does not install it.

**Synced from:** `abeeaf95660ba9e8b7c753eb38f441ca707a8823` (2026-11-19).

## Where each file went

Every place that took upstream text carries a marker naming its source, such as `<!-- upstream: mattpocock/skills skills/engineering/tdd/SKILL.md -->`. Search for `<!-- upstream:` to find them all.

| Upstream file | Went to | How |
| --- | --- | --- |
| `skills/engineering/tdd/SKILL.md` | `skills/implement/TDD.md` | Merged. Seams come from the story; refactoring points at implement § 7. |
| `skills/engineering/tdd/tests.md` | `skills/implement/TDD.md` `## Good and bad tests` | Merged. |
| `skills/engineering/tdd/mocking.md` | `skills/implement/TDD.md` `## When to mock` | Merged and shortened. |
| `skills/engineering/codebase-design/SKILL.md` | `skills/to-story/SEAMS.md` | Merged. Read at to-story § 3, cited by implement and diagnose. |
| `skills/engineering/codebase-design/DEEPENING.md` | `skills/to-story/SEAMS.md`, the last two sections | Merged as a table. |
| `skills/engineering/codebase-design/DESIGN-IT-TWICE.md` | `skills/architect/DESIGN-IT-TWICE.md` | Moved beside its one caller; points at `SEAMS.md`, and serves a new feature's interface as well as a deepening. |
| `skills/engineering/domain-modeling/SKILL.md` | `skills/grill/SKILL.md` § 3, and `skills/router/DECISIONS.md` | Split. The session habits went to grill; where the files live and when to write them went to DECISIONS.md. |
| `skills/engineering/domain-modeling/GLOSSARY-FORMAT.md` | `skills/router/GLOSSARY-FORMAT.md` | Adopted. The pack also accepts the older `CONTEXT.md` names. |
| `skills/engineering/domain-modeling/ADR-FORMAT.md` | `skills/router/DECISIONS.md` `## Writing an ADR` | Merged with the pack's own ADR rules. |
| `skills/productivity/grilling/SKILL.md` | `skills/grill/SKILL.md` § 2 | Adopted, with a facts-first step and a hand-on step. |
| `skills/engineering/grill-with-docs/SKILL.md` | `skills/grill/SKILL.md` | Folded in: grill always keeps the glossary. |
| `skills/productivity/grill-me/SKILL.md` | `skills/grill/SKILL.md` | Folded in: a one-line alias upstream. |
| `skills/engineering/diagnosing-bugs/SKILL.md` | `skills/diagnose/SKILL.md` | Adopted. Adds the issue, the branch, validation and the hand-off to to-pr. |
| `skills/engineering/diagnosing-bugs/scripts/hitl-loop.template.sh` | `skills/diagnose/scripts/hitl-loop.template.sh` | Copied unchanged. |
| `skills/engineering/improve-codebase-architecture/SKILL.md` | `skills/architect/SKILL.md` § 5 | Reshaped. Upstream's whole-codebase scan became § 5, run only on request over a named area. §§ 1–4 — designing a feature or judging a design — are the pack's own, and model-invoked. |
| `skills/engineering/improve-codebase-architecture/HTML-REPORT.md` | `skills/architect/HTML-REPORT.md` | Adopted; vocabulary from `SEAMS.md`, Tailwind and Mermaid pinned to exact versions, a viewport meta added. |
| `skills/productivity/handoff/SKILL.md` | `skills/router/SKILL.md` `## Hand off` | Merged: `/ep handoff`. |
| `skills/productivity/writing-for-agents/SKILL.md` | `skills/writing-for-agents/SKILL.md` | Copied, with the pack marker added. `## Encode the lesson` is the pack's own (see pstack below). |
| `skills/productivity/writing-for-agents/SKILL-MECHANICS.md` | `skills/writing-for-agents/SKILL-MECHANICS.md` | Copied. |
| `skills/engineering/resolving-merge-conflicts/SKILL.md` | `skills/router/GIT.md` `## Catching up with the default branch` | Merged. Deleted upstream at `daa01d8`; nothing left to sync. |
| `skills/engineering/triage/SKILL.md`, `OUT-OF-SCOPE.md` | `skills/triage/SKILL.md` §§ 1, 2 and 7 | Ideas only, in the pack's words: resume from an earlier triage note; reproduce a bug's claim; surface an earlier refusal, kept as an ADR rather than in `.out-of-scope/`; the two-part needs-info note; a marker on every comment it posts. Its state machine and labels stay the pack's own. |
| `skills/engineering/setup-matt-pocock-skills/issue-tracker-github.md` | `skills/to-story/SPLITTING.md` `## GitHub mechanics`, and `skills/router/SKILL.md` **Tracker** | The native `gh` sub-issue and blocking flags, with the REST calls kept for an older `gh`; the fork check. |
| `skills/engineering/pr/SKILL.md` | `skills/to-pr/PICTURES.md`, and `skills/to-pr/SKILL.md` § 4 | Ideas only: the menu of pictures (by way of Dex Horthy's `show-me`, credited in upstream's `CREDITS.md`), before-and-after proof, and **Merge danger** — the door and the blast radius, fed by `/ep-code-review`. Its template is not taken: the pack's body keeps its own headings, and `/ep-babysit` holds a one-way door. |
| `skills/engineering/retro/SKILL.md` | `skills/retro/SKILL.md` | Reshaped into the pack's steps: moments with citations, the lenses, each fix on `writing-for-agents`' rung ladder, accepted fixes leaving as stories or branches. The pack lens is new. |
| `skills/in-progress/chief-of-staff/SKILL.md` | `skills/retro/SKILL.md` § 1 | One idea: retro the parked runs first, then one in five. |
| `skills/engineering/prototype/SKILL.md` | `skills/grill/SKILL.md` § 2 | Cut down to its shared rules, as a way to answer a question that has to be seen. `LOGIC.md` and `UI.md` are not taken. |
| `skills/engineering/ask-matt/PHASE-BOUNDARIES.md` | `skills/router/SKILL.md` § 4, **Context hygiene** | The decision at a boundary, and its order: continue, clear, hand off, compact. |
| `skills/in-progress/claude-handoff/SKILL.md` | `skills/router/SKILL.md` `## Hand off` | One idea: offer to start the fresh agent with the document. |

Every `agents/openai.yaml` is skipped: the pack's own install handles each agent.

Not taken at all, and why:

- `implement-spec`, and `to-tickets`' many thin tickets per plan — several tickets on one branch, where the pack holds one goal, one story, one PR. `to-spec` and `implement` are covered by `/ep-to-story` and `/ep-implement`, and `code-review` and `research` by the pack's own.
- `wayfinder` — a map of decisions across many sessions; the pack writes an epic by hand ([`SPLITTING.md`](./skills/to-story/SPLITTING.md)).
- `git-guardrails-claude-code` — it blocks `git push`, which `/ep-ship` runs.
- `wizard`, `teach`, `wait-what`, `to-questionnaire`, `loop-me`, `software-factory`, `setup-pre-commit`, `setup-ts-deep-modules`, the `writing-*` skills and the `misc` course tooling — outside a delivery pack.

A project that wants one installs it from upstream.

## backnotprop/pstack

[backnotprop/pstack](https://github.com/backnotprop/pstack) mirrors Lauren Tan's [Cursor pstack](https://github.com/cursor/plugins/tree/main/pstack). The pack took a few **ideas** from it, rewritten in the pack's words, never its text, so there is nothing to sync line by line. Each place carries a `<!-- upstream: backnotprop/pstack … -->` marker.

**Read at:** `c3464c11c60b1352d5e8f5f0428a3a6943837568` (2026-11-20).

| pstack file | Went to | Idea |
| --- | --- | --- |
| `skills/poteto-mode/playbooks/hillclimb.md` | `skills/implement/VERIFY.md` | A frozen harness, one change per round, keep or revert, a stop that a lucky round cannot trigger. |
| `skills/benchmark-checklist/SKILL.md` | `skills/implement/VERIFY.md` `## Explain the number` | Name what limits the number, check the work ran, compare fairly, end to end; otherwise inconclusive. |
| `skills/create-verification-skill/SKILL.md` | `skills/implement/SKILL.md` § 7 | Prove the story on the user's surface; a check never seen failing proves nothing. |
| `skills/principle-attack-the-premise/SKILL.md` | `skills/diagnose/SKILL.md` § 5 | After two failed fixes on one premise, test the premise. |
| `skills/blast-radius/SKILL.md` | `skills/code-review/SKILL.md` § 4 | The one fact a change is safe because of, with ranked evidence. |
| `skills/correct/SKILL.md` | `skills/writing-for-agents/SKILL.md` `## Encode the lesson` | Fix a repeated mistake on the highest rung that holds; prose last. |
| `skills/principle-fix-root-causes/SKILL.md`, `skills/why/SKILL.md` | `skills/diagnose/SKILL.md` § 5 | Is the state that set off the symptom legitimate? If not, a guard at the crash site hides the bug: fix where it went wrong. Read the commit and PR that added a guard before changing it. |
| `automations/benny/skills/reproduce-and-fix-issues/SKILL.md` | `skills/diagnose/SKILL.md`, before § 1 | Look for a fix that already exists, and prove it red without and green with it. |
| `automations/benny/skills/triage-issue-reports/SKILL.md` | `skills/triage/SKILL.md` § 2 | A bug filed after its fix shipped is a regression, not a duplicate to close. |
| `skills/principle-test-behavior-not-implementation/SKILL.md` | `skills/implement/TDD.md` `## Anti-patterns`, and `TEST-VALUE.md` | Pair an absence with a sibling where it happens; assert the error's type, not its message. |

Not taken, and why: opt-in TDD (the pack tests every story), several narrow PRs per goal (one goal, one PR), never blocking on the human (open questions stay the user's, and `poteto-mode/worker.md` repeats it), arenas, `interrogate`'s multi-model review and per-PR verification swarms (their cost outweighs a single feature), `show-me-your-work`'s transcript audit, `figure-it-out`, and skills that edit themselves. The code-design principles (`principle-boundary-discipline`, `type-system-discipline` and the like) are the project's standards to set, which `/ep-code-review` already defers to.

## Syncing

Ask an agent to sync this pack with upstream, pointing it at this file. It:

1. **Fetches upstream** and diffs every file in the table from the **Synced from** commit to upstream's head — `git diff <synced>..HEAD -- <path>` in a clone. A file listed as not taken is diffed too: a change there may make it worth taking.
2. **Lists the new upstream skills and the deleted ones** since that commit, so a new one gets a decision.
3. **Sorts every change** into one of three:
   - **Adopt** — an improvement that fits the pack. Apply it at the marked place, in the pack's own style and words, the way the "How" column says the file was adapted.
   - **Already covered** — the pack already says it, often in another skill.
   - **Conflicts** — it contradicts a pack rule, such as the glossary names, a setting, or the board. Skip it, and give the reason.
4. **Shows the sorted list** to the maintainer before editing, and applies only what they accept.
5. **Checks the pack** — `npm test`, then a build — and updates **Synced from** and this table.

Done when every upstream change since the last sync is adopted, covered or rejected with a reason, and **Synced from** names the new commit.
