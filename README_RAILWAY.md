# Railway Deployment Guide

This bot includes a Docker-based Railway deployment configuration. Railway uses the repository `railway.json` file and `Dockerfile` when a deployment is triggered from this repository. The repository intentionally keeps one canonical Railway config to avoid TOML/JSON conflicts.

## Required Railway variables

Add these variables in the Railway service settings. Do not commit them to `.env` or to the repository:

- `TELEGRAM_BOT_TOKEN`: Telegram bot token from BotFather.
- `OWNER_NUMBER`: WhatsApp number with country code, for example `923271054080`.
- `OWNER_TELEGRAM_ID`: Telegram chat ID used by the bot owner.
- `OPENAI_API_KEY`: Required only for AI commands that use OpenAI.

Railway provides the `PORT` variable automatically. The application listens on `process.env.PORT` and falls back to port `3000` for local development.

## Deploy

1. Create a new Railway project and deploy this GitHub repository.
2. Confirm that the service uses the repository root as its source directory.
3. Add the required variables in the Railway service Variables panel.
4. Trigger a deployment. Railway will use the Dockerfile selected by `railway.json`.
5. Verify that the deployment logs show the server listening on the assigned port.

The configured health check is `GET /health`. A successful response is HTTP `200 OK` with body `OK`.

## WhatsApp pairing

When no saved WhatsApp session exists, the application requests a pairing code using `OWNER_NUMBER` and sends it through the configured Telegram bot. Complete the pairing from WhatsApp Linked Devices while the Telegram chat remains available.

## Persistence

Railway container storage is ephemeral. Without a persistent volume or an externally stored `SESSION_ID`, a restart can require WhatsApp pairing again. The repository does not currently include the `session_gen.js` script previously mentioned in older documentation, so persistent session generation should be implemented separately before relying on it in production.

## Security

Keep `.env`, Telegram tokens, OpenAI keys, and WhatsApp authentication data outside Git. If any credentials were previously committed, rotate them and remove the secrets from the repository history. Baileys is pinned in `package.json` and `package-lock.json` to the tested version so a future `latest` release cannot change the deployment unexpectedly.
