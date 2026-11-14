---
"@epicparty/skills": patch
---

`implement`: `TDD.md` widens the tautological-test anti-pattern to any test that adds no verification: a constant string checked for substrings of itself, a function asserted to return its hardcoded value, a snapshot of internals, anything that passes when the behaviour is wrong. A pure constant or a logic-free mapping is used, not tested. Every test first answers "if I introduced a real bug in the logic, would this fail?", and a good test prefers the larger unit, covers edge cases and error paths, and fails when user-facing behaviour breaks.
