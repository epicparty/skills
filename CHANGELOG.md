# @epicparty/skills

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
