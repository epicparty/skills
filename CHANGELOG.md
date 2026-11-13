# @epicparty/skills

## 0.1.1

### Patch Changes

- [#2](https://github.com/epicparty/skills/pull/2) [`ecc751e`](https://github.com/epicparty/skills/commit/ecc751efff699426560087d397849bb3e9023387) Thanks [@narcisoaf](https://github.com/narcisoaf)! - The CLI installs under a prefix that starts English words, such as `up`, `re`, `co` or `self`. The check after a build read "an up-to-date base" as a reference to a missing skill `up-to-date` and installed nothing; it now counts only the pack's own skill names as references. `check` with no `epicparty-skills.json` says so, and asks for `--prefix`.

## 0.1.0

### Minor Changes

- [`3ad7dcd`](https://github.com/epicparty/skills/commit/3ad7dcd17ea9a75d1814d8350d6d4e1ff7e75263) Thanks [@narcisoaf](https://github.com/narcisoaf)! - First release of the pack: 19 skills, from a request to a merged, deployed pull request, installed under each project's own prefix by the `@epicparty/skills` CLI. Every skill starts at 0.1.0.
