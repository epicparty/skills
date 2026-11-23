---
"@epicparty/skills": minor
---

`diagnose`: looks for a fix that already exists before writing one, and proves it red without and green with it; a regression bisects from the fix that shipped. A fix goes where the system first went wrong, not as a guard at the crash site, and a guard someone wrote is read in its commit before it is changed.
