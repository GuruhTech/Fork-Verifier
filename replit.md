# ULTRA GURU Fork Verifier

A deployment gateway that checks whether a GitHub user has forked the [ULTRA-GURU](https://github.com/GuruhTech/ULTRA-GURU) repo before redirecting them to deploy on Heroku.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/fork-verifier run dev` — run the frontend (port 25883)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Frontend: React + Vite + TailwindCSS + shadcn/ui + framer-motion
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod validation schemas
- `artifacts/api-server/src/routes/verify.ts` — fork verification logic (calls GitHub API)
- `artifacts/fork-verifier/src/pages/home.tsx` — the main UI page

## Architecture decisions

- Frontend calls `/api/verify-fork` with a GitHub username; the API server uses the GitHub REST API to check if the user has forked GuruhTech/ULTRA-GURU.
- Fast path: checks `GET /repos/{username}/ULTRA-GURU` directly first (single request). Falls back to paginated forks list if the fork was renamed.
- GITHUB_TOKEN secret is used server-side only (never exposed to the browser) to raise the rate limit from 60 to 5,000 req/hr.
- On verified fork: returns the Heroku deploy URL and the frontend auto-redirects with a 1.5s delay (with a manual fallback button).

## Product

Users land on the ULTRA GURU Deployment Gateway, enter their GitHub username, and the app verifies they've forked the repo. Verified users are redirected to Heroku for one-click deployment. Unverified users see a link to fork the repo first.

## User preferences

- GitHub token stored as GITHUB_TOKEN secret (server-side only)
- Heroku deploy URL: https://dashboard.heroku.com/new?template=https://github.com/GuruhTech/ULTRA-GURU

## Gotchas

- Do not commit or expose GITHUB_TOKEN to the frontend — it is read only in `artifacts/api-server/src/routes/verify.ts`
- Run `pnpm --filter @workspace/api-spec run codegen` after any changes to `lib/api-spec/openapi.yaml`
- The fork-verifier frontend runs at `/` (root preview path)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
