# epicparty/skills

A delivery workflow for coding agents: from a request to a merged, deployed pull request. Explore the work, write it up as a story, build it test-first, open the PR, watch it, and ship it. A router skill reads a request and walks you through the route.

The skills install under **your project's prefix**. Generic names like `implement` or `copy` say nothing about where a skill comes from, and they collide with other packs. With the prefix `acme`, you get `/acme` (the router), `/acme-implement`, `/acme-to-pr`, and so on. Each project picks its own.

## Install

```sh
npx @epicparty/skills add --prefix acme
```

Without `--prefix`, the CLI asks for one. It builds the skills under that prefix and installs them with the [`skills`](https://github.com/vercel-labs/skills) CLI, which links them for every agent it supports (Claude Code, Codex, Cursor and others). Pass `--agent <name>` to choose agents.

The prefix and the version go into `epicparty-skills.json` at the project root. Commit it.

```sh
npx @epicparty/skills@latest update   # same prefix and agents, newer skills
npx @epicparty/skills remove
npx @epicparty/skills add --dry-run --prefix acme   # build and check only
```

Do not install this repository with `npx skills add epicparty/skills` directly. That installs the skills under their bare folder names (`implement`, `copy`), while their text refers to each other with a prefix.

## The skills

| Skill | What it does |
| --- | --- |
| `<prefix>` | Reads a request, names the route through the skills, and walks it. Start here. |
| `<prefix>-setup` | Asks every unset setting up front, or changes one. |
| `<prefix>-explore` | Maps what a piece of work involves before anything is decided. |
| `<prefix>-to-story` | Writes the conversation up as one user story on the tracker. |
| `<prefix>-triage` | Judges one existing issue and ends in one verdict. |
| `<prefix>-implement` | Builds one story on one branch: test-first, validated, reviewed, committed. |
| `<prefix>-code-review` | Reviews code on two axes: the project's standards, and the spec. |
| `<prefix>-to-pr` | Opens a pull request with its suite report and issue link. |
| `<prefix>-babysit` | Sweeps an open PR toward merged. |
| `<prefix>-ship` | Merges, confirms the production deploy, and cleans the checkout. |
| `<prefix>-deliver` | Delivers the stories marked to start, in sequence or across parallel workers. |
| `<prefix>-copy` | Writes or reviews user-facing copy. |
| `<prefix>-research` | Investigates a question against primary sources. |
| `<prefix>-outdated` | Reports which dependencies of a pnpm workspace have newer releases, and what changed. |
| `<prefix>-upgrade` | Upgrades those dependencies and migrates the code. |

GitHub (issues, pull requests, Projects) is built in. Another tracker works when you describe it in the **Tracker** setting.

## Settings

The skills ask for a project fact the first time they need it: the tracker, the labels, how to run the full test suite, how a deploy is confirmed. Each answer is saved where you choose — by default `docs/agents/<topic>.md`, one file per topic — and is never asked again. Run `/<prefix>-setup` to answer them all at once, or to change one.

Each skill declares its own settings in its `## Settings` section, so the list grows with the skills you install.

## How the prefix is applied

The skills in this repository are written with the prefix `ep`. The CLI rewrites, in every Markdown file:

- `/ep` to `/<prefix>`, and `/ep-<skill>` or `ep-<skill>` to `<prefix>-<skill>`;
- `ep-*` to `<prefix>-*`;
- links into a sibling skill's folder, `../<skill>/`, to `../<prefix>-<skill>/`;
- each `SKILL.md`'s `name` to its installed name.

Then it checks the result: every name matches its folder, every link and heading anchor resolves, and every skill named in the text is installed. Each skill also carries `pack: epicparty/skills` under `metadata`, which is how `/<prefix>-setup` finds the pack's skills whatever the prefix.

`npx @epicparty/skills check` runs the same check on an installed project.

## Limits

- Project installs only. Global (`-g`) installs are not supported yet.
- The `skills` CLI records each skill it installs in `skills-lock.json`. This CLI removes its own skills from that file, because the `skills` CLI cannot update them; `update` here replaces `skills update` for this pack.

## Develop

```sh
npm test
node bin/cli.mjs build --prefix acme --out /tmp/acme
node bin/cli.mjs add --from ./skills --prefix acme   # in a test project
```

## License

MIT
