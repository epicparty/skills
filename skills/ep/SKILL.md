---
name: ep
description: Ask what to do with a request, and get walked through it. The router over the ep-* skills.
disable-model-invocation: true
metadata:
  pack: epicparty/skills
---

# EP

A request arrives — a feature, a bug, a half-formed idea, a question. `/ep` reads its **shape**, names the **route** through the `ep-*` skills, and walks that route to the end.

The user asked for their thing done. Routing is your job.

**The route's destination is one merged PR, deployed, and a clean default branch to start the next task from** — unless the request was a question. Everything below is sized to that.

## 1. Read the shape

Two facts decide the route, and both are cheap to establish:

- **Provenance** — does an issue already describe this work? The user may not know. When they named none, search the tracker with the request's own nouns, closed issues included. The tracker is the **Tracker** setting when the settings home has one — read it, never ask for it — or GitHub when `gh repo view` finds the repo; with neither, say no tracker was searched. On GitHub: `gh issue list --search "<keywords>" --state all`, then `gh issue view <n> --comments` on a hit. A hit describing the same work is the provenance; an adjacent one is context. An issue that already specs the work is a grilling you do not need to run.
- **What is unsettled** — the decisions this work turns on that nobody has made. A request with none is buildable now; a request with several has earned a grilling first.

When the request touches code you have not read this session, run `/ep-explore` to establish both. It is the default first move, not an optional one.

Done when you can name the issue this work came from or say it has none, and list what is still unsettled.

## 2. Pick the route

| What arrived | The route |
| --- | --- |
| An idea you want stress-tested before anyone builds it | `/grilling` → `/ep-to-story` → `/ep-implement` → `/ep-to-pr` → `/ep-ship` |
| A feature understood well enough to build | `/ep-explore` → `/ep-to-story` → `/ep-implement` → `/ep-to-pr` → `/ep-ship` |
| An issue already written and Ready | `/ep-implement` → `/ep-to-pr` → `/ep-ship` |
| An issue you are not sure is still right — old, thin, or mislabelled | `/ep-triage`, then the route its verdict names |
| Small and obvious — one seam, no decisions | `/ep-implement` → `/ep-to-pr` → `/ep-ship` |
| Something is broken | `/diagnosing-bugs` — a loop that goes **red** on the bug before any theorising — then `/ep-to-pr` → `/ep-ship` |
| A design question that running code settles faster than talk | `/prototype`, then rejoin at `/ep-to-story` |
| A question about facts outside this repo | `/ep-research`. Ends in findings, and a published note when they are worth keeping, not a PR |
| A question about this codebase | `/ep-explore`, then answer. Ends in an answer, not a PR — say so rather than inventing work |
| What is outdated, or what a new release brings | `/ep-outdated`. Ends in a report, not a PR |
| Dependencies to upgrade — named packages, or all of them | `/ep-upgrade` → `/ep-to-pr` → `/ep-ship`. No story |
| A committed branch with no PR | `/ep-to-pr` → `/ep-ship` |
| An open PR that needs carrying to merged | `/ep-ship` |
| A step only a human can take — credentials, a third-party dashboard, a cutover | `/wizard` writes them a script, then the route that hit the step continues |
| An idea to keep, not to build now — "save it as an idea" | A draft in the board's Ideas stage ([`BOARD.md`](./BOARD.md) `board_idea`). Ends in the draft, not a PR |
| "Check the board", "update the statuses" | [Checking the board](./BOARD.md#checking-the-board). Ends in a report of every card moved, not a PR |
| Several stories marked to start, or named together | `/ep-deliver` — the coordinator walks them in sequence or starts a worker per story, and prints where each one stands |

Editing an existing issue needs no skill — the story rules in `/ep-to-story` govern it, and a story whose work is on the default branch is frozen.

`/grilling`, `/prototype`, `/diagnosing-bugs`, `/tdd`, `/wizard` and `/handoff` come from [mattpocock/skills](https://github.com/mattpocock/skills). Where one is not installed, do its step inline and say so.

Done when you can name the route and the property of the request that chose it.

## 3. Tell the user the route

Before any of it starts, lay out what is about to happen to **their** request, in their terms: the stages in order, and where they have to be present live. A skill name is fine shorthand; reciting this file is not.

```
Here's the plan for the invite-links feature:
1. I'll grill you on the open decisions — one question at a time, so stay with me.
2. Story from that conversation, published as one issue.
3. Implement it on a branch, test-first, and review the diff.
4. Open the PR, drive it to green, merge it, confirm the deploy landed, and put you back on a clean default branch.
```

Flag the **HITL** stages hardest — grilling and prototype are worked *with* the user, one question at a time, and stall silently when they wander off. An agent that answers its own grilling questions has skipped the only part the user was needed for.

Done when every stage is named in order and the HITL ones are flagged as needing the user live.

## 4. Walk it

Follow the skills the route names, and keep the two rules that bind every route:

- **Context hygiene.** Grilling and the story stay in one unbroken window, so both build on the same thinking. `/ep-implement` then starts fresh from the issue. `/handoff` when a thread fills before the story exists.
- **Re-route when the work says so.** A route is a reading of the request, and the request gets clearer as you work it. An "obvious" change that opens three decisions has earned a grilling; fog that burns off in exploration drops straight to `/ep-to-story`. Say when you change route and why.

Every skill on a route reaches a skill by its name. Reading one off disk works too — following a skill you have read is the same as invoking it.

Done when every stage the route named has run, and any re-route is on the record with the property of the work that forced it.

## 5. Report

The shape is `/ep-ship` § 4 — **Details**, then **TL;DR**, then **Your turn** last, because the user reads the chat from the bottom — and a route that reached `/ep-ship` has already produced it. Add the route you walked and any re-route, then stop. The same report twice is one report and one restatement.

A route that ended anywhere else takes the same three sections at whatever size it earned: an answer, a research note's link, or a stage that stalled. Where it stalled, the details name the condition and who owns it, the TL;DR says so, and **Your turn** closes with what only they can unblock.

## Vocabulary

Every `ep-*` skill on a route uses these four terms, and this is where they are defined.

- **Open question** — a call you made *for* the user: a trade-off you resolved on their behalf, a placement you would defend either way, an option they picked before you saw how it rendered, a line you drew around the work. It reaches the user before whatever ships the work. With a PR, it goes in your reply and in the PR body while the diff is open, and `/ep-babysit` holds the merge until it has an answer. Without one — a commit straight to the default branch — ask in your reply and hold the push until the user answers. After the ship it costs a whole PR to act on, so the same words read as commentary rather than a choice.
- **Sibling** — the same defect at a site the request did not name. It always raises an open question: whether it rides along is the user's scope call.
- **Small fix** — a fix that lands on the branch even when the branch did not cause the defect: it fixes a defect, adds no behaviour, needs no decision from the user, and fits in one commit the branch's own gate validates. It goes in as its own commit, and the PR body names it.
- **Found in passing** — the PR body's heading for every finding larger than a small fix, where the user sees it while the diff is open and decides whether it becomes a story. Off a branch, the finding goes in your reply before the push.

A finding earns a durable home in exactly four cases: the user asked for one, it becomes a story on the tracker, it is a decision that earns an ADR ([`DECISIONS.md`](./DECISIONS.md)), or it is context the project's agent files genuinely lack. Otherwise a new file or a new section is work nobody requested, nobody reviewed, and nobody maintains.

## Working rules

Every `ep-*` skill works by these, in every checkout.

- **Preserve work you did not write.** The tree may be dirty, and humans and other agents may write to it at the same time. A `git status` change after one of your commands does not prove you caused it. Before discarding any change you did not make — `git checkout --`, `git restore`, `git stash`, a reset — show that you caused it, show the diff, and ask. When in doubt, leave the tree alone.
- **Do not agree by default.** A flawed premise or a non-standard approach gets corrected when you see it, not after it is built.
- **Git** — how work is committed, named, merged and caught up — is [`GIT.md`](./GIT.md).
- **Board** — how a project board's stages are kept, where the project has one — is [`BOARD.md`](./BOARD.md).
- **Decisions** — where a decision the work makes is written down, and how the glossary and the ADRs are read — are [`DECISIONS.md`](./DECISIONS.md).

## Settings

The skills on a route share the **settings** defined here. A skill that writes to what a setting names asks for it per these steps when it is missing; a skill that only looks something up reads it when it is set and never asks. Each `###` heading below is one setting: its topic, its question, and its options. `/ep-setup` reads the same headings to ask every setting up front.

1. **The settings home.** The `## Agent skills` block of the root `AGENTS.md` — or `CLAUDE.md`, whichever the project has — names where `ep-*` settings live and in what form. With no such line, ask the user where to keep them, the default first:
   - **`docs/agents/<topic>.md`** (default) — one Markdown file per topic, one heading per setting.
   - **One file** — at a path the user names.
   - **Another form** — as the user describes it.

   Write their answer as one line in that block, creating the block when it is missing. With neither file present, ask which to create.
2. **The setting.** Read it at the settings home. Present: use it, and ask nothing.
3. **Missing.** Ask its question below, recommended answer first, with the follow-up its option needs. Write the answer at the settings home, tell the user where it went and that they can edit it there or through `/ep-setup`, then continue.

### Tracker

Topic `issue-tracker`. Question: *Where does the project track its work, how does its writing refer to an issue, and does a board follow the work?*

| Option | Follow-up | Recommend when |
| --- | --- | --- |
| **GitHub Issues** | An issue prefix, optional — such as `EP-`, so issue 42 reads `EP-42` and `#42` is always a PR. Recommend one when the agent files or recent commit messages use it (`git log --oneline -200`); otherwise none, and issues read `#<n>`. Then the board, optional — a GitHub Project linked to the repo, with its status name for each [stage](./BOARD.md#stages) and the automations it runs (add on create, done on close, review on a linked PR). Recommend it when the repo links one open project | `gh repo view` finds the repo |
| **Another tracker** | How to create, read with comments, search, comment on, label and close an issue there, and how a PR names the issue it closes. The issue key it numbers by, such as `ENG-` in Linear or `PROJ-` in Jira, where it has one. Its board, where the work moves through one: its status name for each [stage](./BOARD.md#stages), and how to read and set one | The work lives anywhere else |

With **Another tracker**, every step that names a `gh issue` command does the same thing the way this setting describes.

With a board, [`BOARD.md`](./BOARD.md) is how the skills keep it. Without one, they skip every board step.

**Naming an issue in prose.** Every `ep-*` skill names an issue with the prefix in chat replies, reports, issue and PR bodies, and commit bodies. A form the tracker parses keeps the tracker's own syntax: on GitHub, `Closes #<n>`, `Part of #<n>` and `Refines #<n>` keep `#`, because GitHub closes the issue or writes the backlink from them, and an `EP-` string would be inert text. In a chat reply, a report or a PR body, an issue is a **link**, and its first mention carries its title in bold — `[EP-42](<url>) **"<title>"**` — read from the tracker, never from memory. Later mentions are the bare link. A fixed-width table that already has a title column is exempt.

### Labels

Topic `issue-tracker`. Question: *Which labels mark an issue's state, and which axes classify it?*

The skills name labels by **role**: triage (not yet evaluated), info (waiting on the reporter), discovery (a decision is unmade), ready for an agent, ready for a human, won't fix, and epic. An **axis** is a family of labels every issue carries one of — a type, a priority, a product.

| Option | Follow-up | Recommend when |
| --- | --- | --- |
| **The defaults** | — | The tracker uses none of these yet. Roles are `needs-triage`, `needs-info`, `needs-grilling`, `ready-for-agent`, `ready-for-human`, `wontfix` and `epic`; there are no axes. |
| **A document** | The file and heading that map the roles and define the axes | The agent files or a tracker document already do |
| **This mapping** | Each role's label, and each axis with its values | The tracker has labels that no document holds |
| **None** | — | The tracker has no labels: the skills skip labelling, and an issue's state lives where the **Tracker** setting says |

**Once answered**, compare the labels the answer names with the ones the tracker has. On GitHub, list the missing ones and ask whether to create them now; on yes, `gh label create` each. On another tracker, name the missing ones and ask the user how they want them made. A skill that later finds a label missing names it in its report, and never creates it.

### Scopes

Topic `naming`. Question: *Which scopes name a piece of work — the product or layer, and the area inside it?*

| Option | Follow-up | Recommend when |
| --- | --- | --- |
| **A document** | The file and heading that hold the vocabulary | The agent files or a commit standard already fix one |
| **This list** | The scopes, one per line | The project uses scopes that no document holds |
| **None** | — | One product, no areas: commit scopes are absent or free |

A document keeps the vocabulary in one place: the setting points at it rather than copying it.

### Merge strategy

Topic `git`. Question: *How does a PR merge into the default branch?*

| Option | Follow-up | Recommend when |
| --- | --- | --- |
| **Rebase** | — | The repository allows only rebase merges (`gh repo view --json rebaseMergeAllowed,squashMergeAllowed,mergeCommitAllowed`) |
| **Squash** | — | It allows only squash merges |
| **Merge commit** | — | It allows only merge commits |

Where the repository allows several, recommend the one its recent history shows (`git log --oneline -30 origin/<default>`). [`GIT.md`](./GIT.md) `## Merging` says what each one means for commits and PR bodies.

### Test levels

Topic `testing`. Question: *Which levels does the project test at, and what does each one prove?*

| Option | Follow-up | Recommend when |
| --- | --- | --- |
| **These levels** | One row per level: its name, what it proves, its tool, its run command, and the standard that governs it | Always: propose the rows from the test tools in `package.json` and their configs, the test scripts, and any testing standard the agent files route to |

The "proves" column decides the level, so write it as a kind of behaviour — "a pure function", "a journey across the UI" — never as a tool.

### Full suite

Topic `validation`. Question: *Which suite proves a branch before it merges, and who runs it?*

| Option | Follow-up | Recommend when |
| --- | --- | --- |
| **CI runs it** | — | The PR's required checks run the whole suite on every push (`gh api repos/{owner}/{repo}/branches/<default>/protection`, and the workflows they name) |
| **A document** | The file and heading that say what to run, by what the change touches | The agent files already say what runs before a push |
| **This table** | One row per kind of change — a package, a layer, root files — and the commands it runs, in order | The checks run locally, and no document holds them |
| **One command** | The command, such as `pnpm test:all` | One script runs everything |

Under **CI runs it**, the suite's evidence is the required checks passing on the PR's head commit. Under any other option, the skill runs the suite on the head commit itself, and the PR body carries a **suite report** — the commands, the commit SHA and the result — because nothing else proves that commit was tested.

### Checkout

Topic `checkout`. Question: *Which kinds of checkout does the work happen in, and how is each one set up and cleaned up?*

| Option | Follow-up | Recommend when |
| --- | --- | --- |
| **This checkout** | — | The project is worked in one clone that switches branches in place (`git worktree list` shows one) |
| **These kinds** | One row per kind: how to recognise it (a path, a directory name), its setup command, and its cleanup once the work merged — switch back to the default branch, or commands, and whether the user chooses among them. Then which kind a worker started in parallel gets (`/ep-deliver`) | The project works in worktrees, numbered clones, or a tool that prepares them |

Under **This checkout**, setup is a fresh branch off the default branch, and cleanup switches back to the default branch, pulls it, and deletes the merged branch locally and remotely.

## Guardrails

- **One goal, one story, one PR.** A story is as large as the outcome the user asked for, and one PR delivers it whole. A second story exists for a second goal and nothing else (`/ep-to-story`'s `SPLITTING.md`); a tracker of fragments hides the stories that matter.
- **The user owns the decisions.** Facts you look up in the codebase. Decisions you put to them and wait for.
- **The pull to start coding is strongest on the requests that least deserve it.** A big vague ask feels fastest to attack directly, and it is exactly the one where an hour of grilling saves a week of building the wrong thing.
- **A request outside these routes just gets done.** Not everything is a feature. When no route fits, do the thing and say that is what you did.
