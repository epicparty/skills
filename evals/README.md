# Evals

The pack's tests check the skills' **shape**. These evals check their **behaviour**: a real agent runs a skill on a small project, and deterministic graders score what it left behind. A skill edit is kept only when the evals say it helped and hurt nothing. This folder is for maintainers; the CLI does not ship it.

## Run them

```sh
npm run eval -- --runs 4                     # every train task, 4 runs each, with Claude Code
npm run eval -- --task implement-story       # one task
npm run eval -- --agent codex --runs 4       # with Codex
npm run eval -- --split holdout --runs 4     # the held-out tasks, at the end of a climb only
npm run eval:compare -- <baseline.json> <candidate.json>
```

Each run builds a fresh project in a temporary folder: the task's `fixture/` as a git repo on `main`, the skills from `--skills` (default `skills/`) installed under the prefix `ev`, and, where `task.json` says `"settings": true`, the answered settings in `settings-ev/`. The agent runs unattended, with no MCP servers and none of your own settings. Results and transcripts go to `evals/results/`, which git ignores. A run the agent did not finish (a timeout, a quota, a crash) is **void**: it counts for nothing either way.

Runs cost real tokens and minutes. Four runs of every train task is a session's budget, not a CI step.

## A task

`tasks/<name>/` holds:

- `task.json`: the skill, the `split` (`train` or `holdout`), the prompt, and the graders.
- `fixture/`: the project the agent starts in.
- `hidden/`: held-out tests copied in only at grading. The agent never sees them, so code shaped around its own tests fails here.
- `branch/`: for a review task, the change committed on a branch under review.

**Graders are deterministic** (`lib/graders.mjs`): a command's exit status, a file's heading, a count, a pattern in the final reply. A grader that asks a model is a second agent to evaluate. `test/evals.test.mjs` runs every grader against an honest agent's work and a cheating one's, so a grader bug fails `npm test` before it misjudges a skill.

The prompt never says "eval", "test run" or "grader": the agent works the way it would on a real project. The work folder is named `work-*` for the same reason.

## Hill-climb a skill

One skill change, kept only when it beats the noise. The rules exist because a skill tuned against its own evals overfits them, and an agent climbing a number is the likeliest to game it.

1. **Freeze the harness.** The tasks, fixtures, graders and agent are fixed for the whole climb. A grader that turns out wrong is fixed in its own commit, and the climb restarts from a new baseline. Never loosen a grader so that a change passes.
2. **Baseline.** Run the train tasks at least 4 times on `main`. Two runs of the same skills differ: that spread is the noise, and `compare.mjs` reads every difference against it.
3. **Name one failure.** Read the failing runs' transcripts and name the failure in one sentence. Write down the hypothesis — the change, the grader it should move, the graders it must not move — before editing.
4. **Change one thing.** One edit to one skill. Two edits leave a gain with no cause. State the fix as a general rule: never paste a failing case or a grader's expectation into a skill.
5. **Measure the same way.** At least 4 runs, then `npm run eval:compare -- <baseline> <candidate>`. It runs a two-sided Fisher exact test per grader at p < 0.1, and exits 1 when anything got worse.
6. **Keep or revert.** Keep the change when its target grader is `better` and nothing is `worse`. A `same` is noise: revert it. Expect about one `better` in ten rows by chance alone, so a gain on a grader the hypothesis did not name is luck until it repeats.
7. **Stop** after three hypotheses in a row that did not hold. Then sort the remaining failures by cause and edit nothing more.
8. **Check the holdout once**, at the end: `--split holdout`. A climb that improved the train tasks and left the holdout flat or worse overfitted: revert it.

Log each hypothesis, kept or not, in the pull request that carries the change, so the next climb does not retry it.

## Add a task

A task earns its place by catching a regression a real project would feel. Prefer a behaviour a past bug broke, such as setup asking every setting one by one, or a claim two workers could both win. Give it at least one grader that a lazy or cheating run fails: a hidden test, a must-not-change file, a count. Run it a few times on `main` before relying on it: a task every run passes or every run fails measures nothing.

Sources for the method: [Anthropic, *Demystifying evals for AI agents*](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents), [Anthropic, *Automating eval design and hillclimbing*](https://claude.dev/blog/automating-eval-design-and-hillclimbing/), [Cursor, *Hillclimbing*](https://cursor.com/docs/agent-sdk/hillclimbing), and pstack's [`hillclimb`](https://github.com/backnotprop/pstack/blob/main/skills/poteto-mode/playbooks/hillclimb.md) and [`eval`](https://github.com/backnotprop/pstack/blob/main/skills/poteto-mode/playbooks/eval.md) playbooks.
