# Upstream

Parts of this pack are adapted from [mattpocock/skills](https://github.com/mattpocock/skills), under its MIT license ([`NOTICE`](./NOTICE)). This file records where each upstream file went, and the upstream commit it was last synced from. It is for maintainers: the CLI does not install it.

**Synced from:** `5863806dd4e15c63174bee4e7515a4256792ecfa` (2026-11-12).

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
| `skills/productivity/writing-for-agents/SKILL.md` | `skills/writing-for-agents/SKILL.md` | Copied, with the pack marker added. |
| `skills/productivity/writing-for-agents/SKILL-MECHANICS.md` | `skills/writing-for-agents/SKILL-MECHANICS.md` | Copied. |
| `skills/engineering/resolving-merge-conflicts/SKILL.md` | `skills/router/GIT.md` `## Catching up with the default branch` | Merged. Deleted upstream at `daa01d8`; nothing left to sync. |

Every `agents/openai.yaml` is skipped: the pack's own install handles each agent.

Not taken at all: `wizard`, `prototype`, `teach`, `wait-what`, and every upstream skill not listed above. A project that wants one installs it from upstream.

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
