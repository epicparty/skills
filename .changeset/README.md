# Changesets

Every pull request that changes what a project gets — a skill, the CLI — adds a changeset: `npx changeset`. Pick the bump for `@epicparty/skills`, then write one entry for the changelog. A change to tests, CI or tooling alone adds none.

**Start the entry with the skills it changes**, in backticks, then a colon:

```md
---
"@epicparty/skills": patch
---

`implement`, `triage`: read the **Labels** setting before writing a label.
```

Use the skill's folder name under `skills/` — `implement`, not `ep-implement`. Each named skill's own `metadata.version` gets the same bump when the release is versioned. A change to the CLI alone names no skill.

## The bump

Ask what a project using the pack experiences. These are the **Bump rules** in `skills/router/SKILL.md` (**Releases**), applied to this pack:

| Bump | When | In this repo's history |
| --- | --- | --- |
| `patch` | Nothing new to learn: a skill now does what it already said, clearer wording, a step tightened inside its stated purpose, a CLI fix | The check that misread `up-to-date` (#2); claims that were not exclusive and a board read from the wrong project (#9); the tautological-test rule (#14) |
| `minor` | Something new: a skill, a step, a setting, an option, or behaviour a user would notice | Setup's review table (#7); the automatic reviewer kind (#10); the **Prove it** step (#16) |
| `major` | A project must act: a renamed or removed skill or setting, a moved settings file, a CLI change that breaks an install | — |

The pack is before 1.0.0, so a `major` is filed as `minor`, and its entry starts with **Action:** and says what a project must do.

Several changes in one release take the highest bump among them. That is the release's bump, not a reason to inflate each change's own.

## When to release

Changesets pile up in `.changeset/` until a maintainer judges the batch ready, and the `chore: release` pull request waits until then. [`../README.md`](../README.md) `## Releasing` covers the rest.

CI fails a pull request that changes a skill and names it in no changeset.
