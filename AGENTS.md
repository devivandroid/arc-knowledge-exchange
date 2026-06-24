# Agent Rules

- Never upload, commit, deploy, paste, log, or expose private keys, seed phrases, API keys, access tokens, passwords, wallet files, `.env` files, or any other sensitive data to GitHub, Fly.io, third-party services, public logs, screenshots, or any server we deploy.
- Never commit or upload `.env`, `.env.local`, `.env.production`, `.env.development`, or any copied environment file to GitHub.
- Never deploy private keys, wallet seed phrases, or raw secrets to Fly.io as public app files or `NEXT_PUBLIC_*` variables.
- `PRIVATE_KEY` must only be used locally for testnet deployment or stored as a protected deployment secret when explicitly needed.
- Even for testnet wallets, never commit private keys, seed phrases, or `.env.local` files to the repository.
- Use `.env.example` only for non-secret placeholders and public configuration values.
- Keep real secrets only in local `.env.local` files or in the deployment platform's secret manager.
- If a command, build, script, or deployment step could expose sensitive data, stop and ask before continuing.
