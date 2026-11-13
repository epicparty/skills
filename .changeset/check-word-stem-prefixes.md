---
"@epicparty/skills": patch
---

The CLI installs under a prefix that starts English words, such as `up`, `re`, `co` or `self`. The check after a build read "an up-to-date base" as a reference to a missing skill `up-to-date` and installed nothing; it now counts only the pack's own skill names as references. `check` with no `epicparty-skills.json` says so, and asks for `--prefix`.
