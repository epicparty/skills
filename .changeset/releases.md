---
"@epicparty/skills": minor
---

`release`, `router`, `to-pr`, `ship`: releases are opt-in and cut when a batch is ready. A new **Releases** setting, **None** by default, describes how a project versions: Changesets, a commit-driven tool, or tags by hand. Its **Bump rules** define patch as a fix, minor as something new, and major as a change a project must act on; before 1.0.0 that is a minor whose entry starts with **Action:**. The new `/release` skill, which you type yourself, checks each pending change's bump, cuts the release on the head it checked, and follows it to its receipt, with staged versions approved oldest first. `to-pr` adds a changeset under **Changesets**, and `ship` says a merge waits for the next release. The pack's own `.changeset/README.md` and README `## Releasing` follow the same rules.
