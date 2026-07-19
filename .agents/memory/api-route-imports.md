---
name: API server route import paths
description: Correct import path for the database in api-server route files
---

Route files in `artifacts/api-server/src/routes/` must import the database workspace package as:

```ts
import { db } from "@workspace/db";
import { someTable } from "@workspace/db";
```

**Why:** The esbuild bundler (`build.mjs`) resolves workspace packages by their package name. Using a relative path `"../db"` fails with `Could not resolve "../db"` because there is no `db.ts` file relative to the routes directory — the DB is a workspace package at `lib/db/`.

**How to apply:** Any time a new route file is created in `artifacts/api-server/src/routes/`, always use `@workspace/db` for all DB and schema imports. Same applies to middleware files.
