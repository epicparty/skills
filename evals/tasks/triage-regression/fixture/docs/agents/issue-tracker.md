## Tracker

Another tracker: issues are Markdown files in `issues/`, one per issue, named `<n>.md`. Each opens with a front-matter block — `title`, `state` (`open` or `closed`), `closed_reason` (`completed` or `not planned`, once closed), `opened` and `closed` dates, `author` and `labels` — then the body, then its comments under `## Comments`, each a `### <author>, <date>` heading. Search: `grep -ril "<words>" issues/`. Comment: append under `## Comments`. Label: edit `labels`. Close: set `state: closed`, `closed_reason` and `closed`. A PR closes an issue with `Closes #<n>`. Issues are named `#<n>`. No board.

## Labels

None.

## Scopes

None.
