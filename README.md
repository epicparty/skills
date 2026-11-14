# epicparty/skills

A delivery workflow for coding agents, from a request to a merged, deployed pull request: explore the work, write the story, build it test-first, prove it, open the PR, and ship it. Start with the router, `/<prefix>`: it reads a request and walks the route.

## Install

```sh
npx @epicparty/skills add --prefix acme              # asks for a prefix when you omit it
npx @epicparty/skills@latest update                  # same prefix and agents, newer skills
npx @epicparty/skills add --dry-run --prefix acme    # build and check, install nothing
npx @epicparty/skills remove
npx @epicparty/skills --help                         # every command and option
```

The skills install under **your project's prefix** — `/acme`, `/acme-implement`, `/acme-to-pr` — so their names say where they come from and never collide with another pack. The CLI links them for every agent the [`skills`](https://github.com/vercel-labs/skills) CLI supports; `--agent <name>` picks agents.

Commit `epicparty-skills.json`, which records the prefix, the agents and each skill's version. A formatter that checks JSON (Biome, Prettier) should exclude it, because `update` rewrites it.

Install through this CLI, not `npx skills add epicparty/skills`: the skills refer to each other by prefixed name, which only this CLI writes.

## The skills

| Skill | What it does |
| --- | --- |
| `<prefix>` | Reads a request, names the route through the skills, and walks it. `/<prefix> handoff` hands a thread to a fresh agent. |
| `<prefix>-setup` | Proposes every unset setting in one table to accept or amend, or changes one. |
| `<prefix>-explore` | Maps what a piece of work involves before anything is decided. |
| `<prefix>-grill` | Grills you on a plan, and keeps the glossary and ADRs as it settles things. |
| `<prefix>-to-story` | Writes the conversation up as one user story on the tracker. |
| `<prefix>-triage` | Judges one existing issue, ending in one verdict. |
| `<prefix>-implement` | Builds one story on one branch: test-first, proven on the user's surface, reviewed, committed. |
| `<prefix>-diagnose` | Finds and fixes a failure with a loop that goes red on it before any theory. |
| `<prefix>-architect` | Recommends how to architect a feature, or judges your design. |
| `<prefix>-code-review` | Reviews code against the project's standards and against the spec. |
| `<prefix>-to-pr` | Opens a pull request with its proof, suite report and issue link. |
| `<prefix>-babysit` | Sweeps an open PR toward merged. |
| `<prefix>-ship` | Merges, confirms the deploy, and cleans the checkout. |
| `<prefix>-deliver` | Delivers the stories marked to start, in sequence or across parallel workers. |
| `<prefix>-release` | Cuts a release when the merged changes are ready. Opt-in, through the **Releases** setting. |
| `<prefix>-copy` | Writes or reviews user-facing copy. |
| `<prefix>-research` | Investigates a question against primary sources. |
| `<prefix>-outdated` | Reports what a pnpm workspace's dependencies released since your versions. |
| `<prefix>-upgrade` | Upgrades those dependencies and migrates the code. |
| `<prefix>-writing-for-agents` | How to write skills, `AGENTS.md` and anything else an agent reads. |

You type five of them yourself — `/<prefix>`, `/<prefix>-setup`, `/<prefix>-deliver`, `/<prefix>-upgrade`, `/<prefix>-release` — and an agent asked to start one is refused.

GitHub issues, pull requests and Projects are built in. Another tracker works once the **Tracker** setting describes it, and a project with none answers **None**.

## Settings

A skill asks for a project fact — the tracker, the test suite, how a deploy is confirmed — the first time it needs one, and saves the answer where you choose, by default `docs/agents/<topic>.md`. `/<prefix>-setup` settles them all at once: it reads the repo, shows every setting with a recommended value and the reason, and asks one question — accept all, or name the rows to change.

## How the prefix is applied

The skills are written with the prefix `ep`, the router in `skills/router`. At install, the CLI rewrites every skill name, slash command and link between skills to your prefix, then checks the result: names match folders, links and anchors resolve, and every skill named is installed. `npx @epicparty/skills check` runs that check on an installed project.

## Limits

- Project installs only, not global (`-g`).
- `outdated` and `upgrade` work on pnpm workspaces only.
- Unattended runs (`/loop`) need `gh api` and `gh issue develop` allowed in your agent's permissions.
- A repo with no remote works up to a local commit; the skills that push, merge or deploy stop there and say so.
- The `skills` CLI may move an existing `skills-lock.json` to its current format, rehashing every entry: commit the change. This CLI keeps its own skills out of that file, so update them with `update` here, not `skills update`.

## Versions

The pack has a version, and so does each skill (`metadata.version`), which moves only when that skill changes. `update` lists the skills it added, removed or moved. [`CHANGELOG.md`](./CHANGELOG.md) says what changed, skill by skill.

## Develop

```sh
npm install
npm test                                             # the CLI, the pack's shape, the eval graders
node bin/cli.mjs build --prefix acme --out /tmp/acme
node bin/cli.mjs add --from ./skills --prefix acme   # in a test project
npm run eval -- --runs 4                             # real agents on the eval tasks
```

A skill edit is kept when the evals say it helped and hurt nothing: [`evals/README.md`](./evals/README.md) has the hill-climb.

## Releasing

Releases run on [Changesets](https://github.com/changesets/changesets):

1. **A pull request that changes the pack adds a changeset** (`npx changeset`), its entry starting with the skills it changes. [`.changeset/README.md`](./.changeset/README.md) has the bump rules. CI fails a pull request that changes a skill and names it in none.
2. **The Release workflow keeps a `chore: release` pull request** with the next version and changelog, rebuilt on every push to `main`.
3. **A maintainer merges it when the batch is ready**, never once per pull request, pinned to the head they read: `gh pr merge <n> --match-head-commit <sha>`.
4. **The merge stages the version on npm** through [trusted publishing](https://docs.npmjs.com/trusted-publishers), with no stored token, and tags it with a GitHub release.
5. **A maintainer approves it with 2FA**: `npm stage list @epicparty/skills`, then `npm stage approve <id>`, oldest first — approving an older version after a newer one moves `latest` back. A failed staging is retried by running the Release workflow by hand.

Two settings make this work. On npmjs.com, `@epicparty/skills` → **Trusted publishing** names GitHub Actions, `epicparty/skills` and `release.yml`, no environment, with **Allow npm publish** unticked so a run can only stage. On GitHub, **Settings → Actions → General** allows Actions to create and approve pull requests.

## License

MIT. [`NOTICE`](./NOTICE) carries the licenses of the projects below, and every installed skill holding adapted text ships a copy.

## Credits

- [Matt Pocock's skills](https://github.com/mattpocock/skills): `grill`, `diagnose`, `architect` and `writing-for-agents`, and the test-first, seams, glossary and hand-off parts of others.
- Lauren Tan's [pstack](https://github.com/backnotprop/pstack): the verification ideas — proving a story on its user's surface, measuring a target, a failed fix's premise, a change's blast radius, encoding a lesson.

[`UPSTREAM.md`](./UPSTREAM.md) maps what came from where. Thank you both.
