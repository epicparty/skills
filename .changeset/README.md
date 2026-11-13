# Changesets

Every pull request that changes what a project gets — a skill, the CLI — adds a changeset: `npx changeset`. Pick the bump for `@epicparty/skills`, then write one entry for the changelog.

**Start the entry with the skills it changes**, in backticks, then a colon:

```md
---
"@epicparty/skills": patch
---

`implement`, `triage`: read the **Labels** setting before writing a label.
```

Use the skill's folder name under `skills/` — `implement`, not `ep-implement`. Each named skill's own `metadata.version` gets the same bump when the release is versioned. A change to the CLI alone names no skill.

| Bump | When |
| --- | --- |
| `patch` | Wording, a fix, a clearer step. A project changes nothing. |
| `minor` | A new skill, step or setting, or a skill that now behaves differently. |
| `major` | A project must act: a renamed or removed skill or setting, a moved settings file, a CLI change. Before 1.0.0, use `minor` for these, and say what to do. |

CI fails a pull request that changes a skill and names it in no changeset. [`../README.md`](../README.md) `## Releasing` covers the rest.
