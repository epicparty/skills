# @epicparty/skills

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
