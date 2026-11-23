# @epicparty/skills

## 0.10.0

### Minor Changes

- [#31](https://github.com/epicparty/skills/pull/31) [`3c3440e`](https://github.com/epicparty/skills/commit/3c3440e0d4685689c36efbacc2d436a3fb826d87) Thanks [@narcisoaf](https://github.com/narcisoaf)! - `router`, `babysit`, `to-pr`, `implement`: a call left to the user holds the merge. **Open question** now covers a call you left *to* the user, such as whether the work crosses a line the request drew, as well as one you made for them: every call put to the user about the work is one. **Found in passing** says what can wait until after the merge: a finding that would be its own story either way. The change's own follow-through, such as a list or a doc it leaves stale, lands as a commit, or is an open question where a line drawn around the work leaves it out. The merge gate reads **Found in passing** and the replies on the PR for any such call, moves it to an open question, and holds.

### Patch Changes

- [#30](https://github.com/epicparty/skills/pull/30) [`d391b57`](https://github.com/epicparty/skills/commit/d391b579dbf13d6e880eb0d5c0b919d12ace49d9) Thanks [@narcisoaf](https://github.com/narcisoaf)! - `retro`: read only the transcript of each session named, never another project's logs unless the user asks.

## 0.9.0

### Minor Changes

- [#28](https://github.com/epicparty/skills/pull/28) [`8efa6d0`](https://github.com/epicparty/skills/commit/8efa6d06ecd5f2a1b89ada03e01cfee4a011d4ad) Thanks [@narcisoaf](https://github.com/narcisoaf)! - `diagnose`: looks for a fix that already exists before writing one, and proves it red without and green with it; a regression bisects from the fix that shipped. A fix goes where the system first went wrong, not as a guard at the crash site, and a guard someone wrote is read in its commit before it is changed.

- [#28](https://github.com/epicparty/skills/pull/28) [`8efa6d0`](https://github.com/epicparty/skills/commit/8efa6d06ecd5f2a1b89ada03e01cfee4a011d4ad) Thanks [@narcisoaf](https://github.com/narcisoaf)! - `grill`: a question that has to be seen can earn a throwaway prototype, on a `prototype/<slug>` branch that never merges, before its round.

- [#28](https://github.com/epicparty/skills/pull/28) [`8efa6d0`](https://github.com/epicparty/skills/commit/8efa6d06ecd5f2a1b89ada03e01cfee4a011d4ad) Thanks [@narcisoaf](https://github.com/narcisoaf)! - `to-pr`, `implement`, `babysit`: the PR body shows the change's shape in the smallest picture that makes the point, proves a visible change before and after, and states its **Merge danger** — a one-way or two-way door, and the blast radius `code-review` named. `babysit` merges a one-way door only on the user's word, and under `deliver` holds it as a go/no-go.

- [#28](https://github.com/epicparty/skills/pull/28) [`8efa6d0`](https://github.com/epicparty/skills/commit/8efa6d06ecd5f2a1b89ada03e01cfee4a011d4ad) Thanks [@narcisoaf](https://github.com/narcisoaf)! - `retro`: a new skill you type. It looks back over a session, or the stories a `deliver` run parked, finds the cause of each moment that went slow or wrong, and proposes each fix on the rung that holds it — a check before a rule, a rule before prose.

- [#28](https://github.com/epicparty/skills/pull/28) [`8efa6d0`](https://github.com/epicparty/skills/commit/8efa6d06ecd5f2a1b89ada03e01cfee4a011d4ad) Thanks [@narcisoaf](https://github.com/narcisoaf)! - `router`: in a fork, the **GitHub Issues** answer names the repo that owns the work, and issues are filed there; the context decision is made at a stage boundary, in order — continue, clear, hand off, compact; `/ep handoff` offers to start the fresh agent itself; and `/ep-retro` has a route.

- [#28](https://github.com/epicparty/skills/pull/28) [`8efa6d0`](https://github.com/epicparty/skills/commit/8efa6d06ecd5f2a1b89ada03e01cfee4a011d4ad) Thanks [@narcisoaf](https://github.com/narcisoaf)! - `triage`, `deliver`: triage reproduces a bug's claim where that is cheap, reads a bug filed after its fix shipped as a regression for `diagnose` rather than a duplicate to close, surfaces an earlier refusal with its reason (and offers to keep it as an ADR), resumes from an earlier triage note, posts needs-info as "established so far / still need from you", and marks every comment it posts. `deliver` no longer takes a triage note for a human's answer.

### Patch Changes

- [#28](https://github.com/epicparty/skills/pull/28) [`8efa6d0`](https://github.com/epicparty/skills/commit/8efa6d06ecd5f2a1b89ada03e01cfee4a011d4ad) Thanks [@narcisoaf](https://github.com/narcisoaf)! - The CLI's `check` parses every installed `SKILL.md` frontmatter as strict YAML, the way the `skills` installer does, so a description with an unquoted `: ` fails the check instead of being skipped at install without a word.

- [#28](https://github.com/epicparty/skills/pull/28) [`8efa6d0`](https://github.com/epicparty/skills/commit/8efa6d06ecd5f2a1b89ada03e01cfee4a011d4ad) Thanks [@narcisoaf](https://github.com/narcisoaf)! - `implement`: two more test anti-patterns — an absence asserted with no sibling test where the thing happens, and an error matched by its message where callers branch on its type.

- [#28](https://github.com/epicparty/skills/pull/28) [`8efa6d0`](https://github.com/epicparty/skills/commit/8efa6d06ecd5f2a1b89ada03e01cfee4a011d4ad) Thanks [@narcisoaf](https://github.com/narcisoaf)! - `to-story`: sub-issues and blocking edges use `gh issue create --parent/--blocked-by` and `gh issue edit --add-sub-issue/--add-blocked-by`, with the REST calls kept for an older `gh`.

## 0.8.0

### Minor Changes

- [#26](https://github.com/epicparty/skills/pull/26) [`fa28e9d`](https://github.com/epicparty/skills/commit/fa28e9d3c12195d16c94a6a43bc9a342b01a7ec6) Thanks [@narcisoaf](https://github.com/narcisoaf)! - `router`, `ship`: the **Checkout** setting can name when a cleanup command runs without a choice, such as a worktree delete when nothing else is left for the user. `/ep-ship` runs that command last without asking when its conditions hold, also under `/ep-deliver`, where a checkout started for one story was always kept.

## 0.7.0

### Minor Changes

- [#24](https://github.com/epicparty/skills/pull/24) [`018c722`](https://github.com/epicparty/skills/commit/018c7225458ca3dc958221cea2fd0f3af2987df0) Thanks [@narcisoaf](https://github.com/narcisoaf)! - `router`, `babysit`, `deliver`: a security gap reaches the user before the merge. A new **Security gap** term — a way past auth, a permission, a limit or a secret, or a check that lets one through, in a file the branch changes — always raises an open question, like a sibling. **Found in passing** now holds only what can wait until after the merge. The merge gate moves a security gap or a sibling filed under **Found in passing** to an open question and holds. Under `/ep-deliver`, a worker whose gate stops on an open question asks it on the PR with the `**A worker needs a decision**` line and parks.

## 0.6.0

### Minor Changes

- [#22](https://github.com/epicparty/skills/pull/22) [`e9c2620`](https://github.com/epicparty/skills/commit/e9c2620ed70185112d5ee4b6d1091fbc40ddd7eb) Thanks [@narcisoaf](https://github.com/narcisoaf)! - `router`, `diagnose`: weigh every proposal before putting it to the user. A story, fix, guard or follow-up now comes with what it buys, what it costs, what it can break and a verdict, and an agent's own earlier plan or a hand-off's leftover work is weighed again before it acts. `diagnose`'s cheap-signal finding stays a line in the report when it costs more than the failure it catches.

## 0.5.0

### Minor Changes

- [#19](https://github.com/epicparty/skills/pull/19) [`28d665f`](https://github.com/epicparty/skills/commit/28d665f28b5fe48f010a5594988902409ec9ee8f) Thanks [@narcisoaf](https://github.com/narcisoaf)! - `release`, `router`, `to-pr`, `ship`: releases are opt-in and cut when a batch is ready. A new **Releases** setting, **None** by default, describes how a project versions: Changesets, a commit-driven tool, or tags by hand. Its **Bump rules** define patch as a fix, minor as something new, and major as a change a project must act on; before 1.0.0 that is a minor whose entry starts with **Action:**. The new `/release` skill, which you type yourself, checks each pending change's bump, cuts the release on the head it checked, and follows it to its receipt, with staged versions approved oldest first. `to-pr` adds a changeset under **Changesets**, and `ship` says a merge waits for the next release. The pack's own `.changeset/README.md` and README `## Releasing` follow the same rules.

- [#16](https://github.com/epicparty/skills/pull/16) [`8069a4e`](https://github.com/epicparty/skills/commit/8069a4e8d3086fe8c9f4a173d64049c505a9046e) Thanks [@narcisoaf](https://github.com/narcisoaf)! - `implement`, `to-story`, `to-pr`, `code-review`, `diagnose`, `writing-for-agents`: verify work on the user's surface and by measurement. `implement` gains § 7 **Prove it**: each numbered story is exercised where its user meets it, with evidence, and anything else is inconclusive, never a pass. A story's **Measure** line, new in `to-story`'s testing decisions, is proven by `VERIFY.md`'s hill climb: a frozen harness, alternating baseline runs and a noise floor, one change per round, a confirmed stop, and an explained number. Red tests are frozen, and a test's P score decides whether it is written. `to-pr` carries the proof into the PR body. `code-review`'s Spec axis flags code shaped around tests and names the change's blast radius. `diagnose` tests a failed fix's premise and names the signal that would have caught the bug. `writing-for-agents` encodes a repeated mistake on the highest rung that holds. Ideas adapted from Lauren Tan's pstack (MIT), credited in `UPSTREAM.md` and `NOTICE`.

### Patch Changes

- [#14](https://github.com/epicparty/skills/pull/14) [`1a88848`](https://github.com/epicparty/skills/commit/1a8884872de24dd6cba320d1bb1625088e32901f) Thanks [@narcisoaf](https://github.com/narcisoaf)! - `implement`: `TDD.md` widens the tautological-test anti-pattern to any test that adds no verification: a constant string checked for substrings of itself, a function asserted to return its hardcoded value, a snapshot of internals, anything that passes when the behaviour is wrong. A pure constant or a logic-free mapping is used, not tested. Every test first answers "if I introduced a real bug in the logic, would this fail?", and a good test prefers the larger unit, covers edge cases and error paths, and fails when user-facing behaviour breaks.

## 0.4.0

### Minor Changes

- [#10](https://github.com/epicparty/skills/pull/10) [`563d160`](https://github.com/epicparty/skills/commit/563d16052a0e9abf71580bec426e3438be668c66) Thanks [@narcisoaf](https://github.com/narcisoaf)! - `babysit`: the **External reviewers** setting has a third kind, **automatic**, for a bot that reviews every PR on its own, such as CodeRabbit or Copilot code review. Its row names the check or status its run shows on the head commit and the comment that re-requests it. Step 8 takes its review as the PR's external review on every PR, never asks about it, and re-requests it only when its run is missing on the head commit. The merge gate waits for its run to finish on the head SHA and for its findings to carry a disposition. Setup recommends the automatic kind for an installed bot that reviews PRs nobody asked it on. Normal and security reviewers keep their request-only rules.

### Patch Changes

- [#13](https://github.com/epicparty/skills/pull/13) [`891ba8b`](https://github.com/epicparty/skills/commit/891ba8b64c535aca4fc4a300ee2e4f1fd14ad46d) Thanks [@narcisoaf](https://github.com/narcisoaf)! - `babysit`: an automatic reviewer is re-requested whenever the head commit has no review from it: its run missing, or ended skipped, rate limited or neutral, unless its row counts that skip as a review, such as "No files to review". The substantial-push rule applies only to normal and security reviewers. A re-request after a rate limit waits until the limit lifts. Each request counts against the row's cap, and with the cap spent and still no review, the gate holds the PR and the report says so.

## 0.3.0

Not published to npm: a release pull request overwritten just before its merge left out [#10](https://github.com/epicparty/skills/pull/10). These changes ship in 0.4.0.

### Minor Changes

- [#9](https://github.com/epicparty/skills/pull/9) [`8427b90`](https://github.com/epicparty/skills/commit/8427b9018388e7e682e03c97a3f597c9bdfeb796) Thanks [@narcisoaf](https://github.com/narcisoaf)! - `deliver`, `implement`, `router`: a story is claimed with a claim comment that names the worker, read back so the first claim wins. Several workers on one login could all win a self-assignment or a Building status. A claim with no branch yet is returned to the queue only once its worker is gone, not while it sets up. A parked question counts as answered only by a person with write access who answers it, never a review bot. A parked story resumes at the stage its park comment records, on its own branch, instead of always at `to-pr`. `implement` builds work that has no issue without claiming or linking one. The **Tracker** setting records the board by its project number, and `BOARD.md`'s commands write to that board instead of the first one linked to the repo.

### Patch Changes

- [#9](https://github.com/epicparty/skills/pull/9) [`8427b90`](https://github.com/epicparty/skills/commit/8427b9018388e7e682e03c97a3f597c9bdfeb796) Thanks [@narcisoaf](https://github.com/narcisoaf)! - `code-review`, `explore`, `to-story`: a review of one commit reads that commit (`git show`), a range reads its two endpoints, and working changes include untracked files. `explore` reads the issue the user named, with its comments, and `to-story` refines it instead of filing another. A split reads **Tracker** before publishing and only prints the stories under **None**, and its frontier also drops a child whose `## Blocked by` list names an open issue.

## 0.2.0

### Minor Changes

- [#7](https://github.com/epicparty/skills/pull/7) [`8451d47`](https://github.com/epicparty/skills/commit/8451d47727751b411204e16f4c54cefcccad28d8) Thanks [@narcisoaf](https://github.com/narcisoaf)! - `setup`: proposes every setting in one table instead of asking them one at a time. It reads the repo, `gh`, the CI workflows, `package.json` and the agent files first, then shows each setting with a recommended option, its follow-up filled in, and the reason, and asks one question: accept all, or name the rows to change (`3: None; skip 5`). Actions an answer brings, such as creating the missing labels, are rows of the same table, and nothing is written or created before the accept. README: a project whose formatter checks JSON excludes `epicparty-skills.json`, which `update` rewrites.

### Patch Changes

- [#5](https://github.com/epicparty/skills/pull/5) [`be70d21`](https://github.com/epicparty/skills/commit/be70d217b0c4e008894394a3a7b5890a553ea740) Thanks [@narcisoaf](https://github.com/narcisoaf)! - README: the `skills` CLI may move an existing `skills-lock.json` to its version 2 format and rehash every entry, so commit the change; and `/<prefix>`, `/<prefix>-setup`, `/<prefix>-deliver` and `/<prefix>-upgrade` are typed by you, since an agent can't start them.

## 0.1.1

### Patch Changes

- [#2](https://github.com/epicparty/skills/pull/2) [`ecc751e`](https://github.com/epicparty/skills/commit/ecc751efff699426560087d397849bb3e9023387) Thanks [@narcisoaf](https://github.com/narcisoaf)! - The CLI installs under a prefix that starts English words, such as `up`, `re`, `co` or `self`. The check after a build read "an up-to-date base" as a reference to a missing skill `up-to-date` and installed nothing; it now counts only the pack's own skill names as references. `check` with no `epicparty-skills.json` says so, and asks for `--prefix`.

## 0.1.0

### Minor Changes

- [`3ad7dcd`](https://github.com/epicparty/skills/commit/3ad7dcd17ea9a75d1814d8350d6d4e1ff7e75263) Thanks [@narcisoaf](https://github.com/narcisoaf)! - First release of the pack: 19 skills, from a request to a merged, deployed pull request, installed under each project's own prefix by the `@epicparty/skills` CLI. Every skill starts at 0.1.0.
