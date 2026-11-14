---
"@epicparty/skills": minor
---

`setup`: proposes every setting in one table instead of asking them one at a time. It reads the repo, `gh`, the CI workflows, `package.json` and the agent files first, then shows each setting with a recommended option, its follow-up filled in, and the reason, and asks one question: accept all, or name the rows to change (`3: None; skip 5`). Actions an answer brings, such as creating the missing labels, are rows of the same table, and nothing is written or created before the accept. README: a project whose formatter checks JSON excludes `epicparty-skills.json`, which `update` rewrites.
