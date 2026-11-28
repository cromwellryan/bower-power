# Bower Power ♠

A mobile-first family euchre scorekeeper. Record completed games, see individual and partnership standings, explore head-to-head records, and share private trip links.

Production: https://bower-power.ryan-2f3.workers.dev/

## Source of truth

**GitHub main is canonical.** Commit directly to main; no pull requests are required for this repository. Run the regression checks, then deploy that exact committed version to the existing Cloudflare Worker. Never modify the production Worker directly without first committing the change to GitHub.

- `src/worker.js` — complete Worker, API, and browser application.
- `deployment.json` — production Worker configuration and existing D1 binding (resource identifier, not an API credential).
- `db/schema.sql` — baseline schema for a new database only; do not reapply to production.
- `scripts/check.mjs` — syntax and regression checks.
- `scripts/deploy.mjs` — authenticated deployment from a clean checkout of origin/main.

## Checks and deployment

Requires Node.js 22 or later and Git. Run:

```sh
node scripts/check.mjs
```

After committing and pushing directly to main, a maintainer can deploy with:

```sh
git checkout main
git pull --ff-only origin main
node scripts/deploy.mjs
```

Provide `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` securely through the environment (Workers Scripts write permission for the target account, plus any required binding permissions). Never commit API tokens. The script refuses to deploy a dirty checkout or a revision that differs from origin/main.

An authorized Cloudflare integration can alternatively upload the exact committed file using deployment.json, then verify the deployed bytes. Do not edit production source in place.

## Data and privacy

Cloudflare D1 is the source of truth for trips, players, and games. Deployments reuse the existing DB binding and never reset or replace the database. Do not commit family records, invitation links, or access tokens. Invitation links confer read/write access; share only with intended participants.

## Current workflow

Direct commits to main trigger Cloudflare Workers Builds, configured to run `node scripts/check.mjs` and `node scripts/deploy.mjs`. Native build verification is pending. Manual deployment from the exact GitHub commit remains the fallback. No PRs.
