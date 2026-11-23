---
"@epicparty/skills": patch
---

The CLI's `check` parses every installed `SKILL.md` frontmatter as strict YAML, the way the `skills` installer does, so a description with an unquoted `: ` fails the check instead of being skipped at install without a word.
