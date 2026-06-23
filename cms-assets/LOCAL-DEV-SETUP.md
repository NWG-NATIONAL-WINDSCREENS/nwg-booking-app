# Local Development Setup

## Prerequisites

- Node.js >= 18
- HubSpot CLI v8+ (`npm i -g @hubspot/cli@latest`)
- HubSpot account `442555257` (NWG staging) authenticated in the CLI

## Authenticating the HubSpot CLI

The CMS dev server needs an authenticated HubSpot account to proxy serverless function requests and preview modules.

```bash
# Check existing accounts
hs accounts list

# Add the NWG staging account (if not listed)
hs account auth
# Choose "Personal Access Key", paste the key from
# https://app.hubspot.com/personal-access-key/442555257
```

Modern HubSpot CLI writes to a single **global** config at `~/.hscli/config.yml` (Windows: `C:\Users\<you>\.hscli\config.yml`). There is no per-repo `hubspot.config.yml` anymore — if you see an `archived.hubspot.config.yml` in the parent directory, that is the deprecated local config that was auto-migrated on first run of `hs account auth` and is safe to delete after confirming the global config has the accounts you need.

Set `nwg-staging` as the default so you never need to remember to pass `--account`:

```bash
hs accounts use nwg-staging
```

## Starting the Dev Server

```bash
cd nwg-project/nwg-booking-app
yarn start
# which runs: npx hs-cms-dev-server . --account nwg-staging --ssl
```

This starts the local dev server at `https://hslocal.net:3000`.

- **Preview a module:** `https://hslocal.net:3000/preview/module/Booking?dev=true`
- **Tailwind watcher (separate terminal):** `yarn tw`

### About the `--account` flag

Two gotchas worth knowing:

1. **Use the space form**, not the equals form: `--account nwg-staging`, not `--account=nwg-staging`. The cms-dev-server's arg parser does a strict `arg === "--account"` comparison, so `--account=X` is silently ignored and the server falls back to `defaultAccount`.
2. **Pass the account name, not the numeric ID.** Name lookup is first and more forgiving than numeric portal ID lookup in `@hubspot/local-dev-lib`.

## How Serverless Function Proxying Works

The `hs-cms-dev-server` does **not** run serverless functions locally. Instead, it proxies API requests to the deployed functions on the HubSpot account:

```
Browser (hslocal.net:3000)
  → /hs/serverless/api/v1/session/create
  → Proxy forwards to https://442555257.hs-sites-ap1.com/hs/serverless/api/v1/session/create
  → Response piped back to browser
```

### URL Patterns

| Prefix            | Target                     | Project                  |
| ----------------- | -------------------------- | ------------------------ |
| `/hs/serverless/` | Deployed project functions | `nwg-project-functions/` |
| `/_hcms/api/`     | Legacy CMS functions       | `nwg-functions/`         |

### Requirements

1. **Serverless functions must be deployed** to the target account before local dev will work.
2. **The account must be authenticated** in the HubSpot CLI (`hs account auth`).
3. **Default account is `nwg-staging`** in `~/.hscli/config.yml`. If you need to target prod (`nwg`, `441426038`), pass `--account nwg` explicitly.

## Proxy Patch (`@hubspot/cms-dev-server`)

The stock `hs-cms-dev-server` has a bug in its serverless proxy — it pipes response bodies but does not forward HTTP status codes, headers, or cookies. This breaks:

- **Session cookies** — the JWT `Set-Cookie` header from HubSpot gets dropped, so authenticated endpoints fail.
- **Content decoding** — the `content-encoding: gzip` header is forwarded but `node-fetch` already decompresses the body, causing `ERR_CONTENT_DECODING_FAILED` in the browser.

### What the Patch Does

The patch lives at `patches/@hubspot+cms-dev-server+1.2.1.patch` and modifies `dist/run.js`:

1. **Forwards response status codes** — so 401s are actually 401s, not 200s.
2. **Rewrites `Set-Cookie` headers** — strips `domain=`, `Secure`, and changes `SameSite=None` to `SameSite=Lax` so cookies work on `hslocal.net`.
3. **Skips encoding headers** — removes `content-encoding`, `transfer-encoding`, and `content-length` since `node-fetch` already decompresses responses.
4. **Forwards all other response headers** — including `content-type: application/json`.

### Applying the Patch

The patch auto-applies on `npm install` / `yarn install` via the `postinstall` script in `package.json`:

```json
"scripts": {
  "postinstall": "patch-package"
}
```

You can verify the patch is in place by grepping the installed file:

```bash
grep -c "PROXY" node_modules/@hubspot/cms-dev-server/dist/run.js
# Expected: 6 (or more)
```

If the patch fails to apply (typically after a `@hubspot/cms-dev-server` version bump), `patch-package` will print a fuzzy-match error:

```bash
# 1. Manually edit node_modules/@hubspot/cms-dev-server/dist/run.js
#    Find the proxyServerlessRequest function and re-apply the changes described above.
# 2. Regenerate the patch against the new version
npx patch-package @hubspot/cms-dev-server
# This will rename the patch file to match the current installed version
# (e.g. @hubspot+cms-dev-server+1.2.25.patch). Commit the new patch file.
```

## Troubleshooting

### "No supported components" error with `hs project dev`

`hs project dev` does not support CMS React apps (islands). Use `hs-cms-dev-server` instead.

### `Error: Account with id  not found` (note the empty id)

This means `validateConfig()` returned false and the dev server couldn't resolve an account. Usually one of:

1. You passed `--account=X` with an equals sign — use `--account X` (space-separated).
2. The account name you passed isn't in `~/.hscli/config.yml`. Run `hs accounts list` to check.
3. The global config file doesn't exist. Run `hs account auth` and pick `nwg-staging`.

### `INVALID_EXPIRY` 401 from `api.hubspot.com`

Your cached access token is expired *and* `@hubspot/local-dev-lib` couldn't refresh it using the stored personal access key. Most likely the PAK itself is expired (they have their own ~1 year TTL). Regenerate one at https://app.hubspot.com/personal-access-key/442555257 and run `hs account auth` again.

### `ERR_CONTENT_DECODING_FAILED` in browser

The proxy patch isn't applied. Check with `grep -c "PROXY" node_modules/@hubspot/cms-dev-server/dist/run.js` — if the count is 0, run `npx patch-package` manually or `rm -rf node_modules && yarn install` to trigger `postinstall`.

### Serverless requests return no data

Check the dev server terminal for `[PROXY]` log lines. If you don't see them, the patch isn't applied to `dist/run.js` (the correct file — not `dist/index.js`).

### Port 3000 already in use

```bash
# From WSL or Git Bash
lsof -ti :3000 | xargs kill -9

# From Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```
