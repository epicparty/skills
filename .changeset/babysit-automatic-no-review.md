---
"@epicparty/skills": patch
---

`babysit`: an automatic reviewer is re-requested whenever the head commit has no review from it: its run missing, or ended skipped, rate limited or neutral, unless its row counts that skip as a review, such as "No files to review". The substantial-push rule applies only to normal and security reviewers. A re-request after a rate limit waits until the limit lifts. Each request counts against the row's cap, and with the cap spent and still no review, the gate holds the PR and the report says so.
