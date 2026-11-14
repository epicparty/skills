---
"@epicparty/skills": minor
---

`babysit`: the **External reviewers** setting has a third kind, **automatic**, for a bot that reviews every PR on its own, such as CodeRabbit or Copilot code review. Its row names the check or status its run shows on the head commit and the comment that re-requests it. Step 8 takes its review as the PR's external review on every PR, never asks about it, and re-requests it only when its run is missing on the head commit. The merge gate waits for its run to finish on the head SHA and for its findings to carry a disposition. Setup recommends the automatic kind for an installed bot that reviews PRs nobody asked it on. Normal and security reviewers keep their request-only rules.
