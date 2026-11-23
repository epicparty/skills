# Coding standards

- Code outside `src/db/` reaches the database through `src/db/index.mjs` only, never a file under `src/db/internal/`.
- Money is integer cents.
