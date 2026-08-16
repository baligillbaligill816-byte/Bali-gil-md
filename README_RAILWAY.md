# Railway Deployment Guide

This bot includes a Docker-based Railway deployment configuration. Railway uses the repository `railway.json` file and `Dockerfile` when a deployment is triggered from this repository. The repository intentionally keeps one canonical Railway config to avoid TOML/JSON conflicts.

## Required Railway variables

Add these variables in the Railway service settings. Do not commit them to `.env` or to the repository:

- `TELEGRAM_BOT_TOKEN`: Telegram bot token from BotFather. Required for Telegram pairing and deployment control.
- `TELEGRAM_BOT_USERNAME`: Telegram bot username without `@`, used to generate the public `https://t.me/...` link in the website.
- `OWNER_NUMBER`: WhatsApp number with country code, for example `923271054080`.
- `OWNER_TELEGRAM_ID`: Telegram chat ID used by the bot owner.
- `PUBLIC_URL`: Public Railway URL, for example `https://bali-gil-md-production-28b7.up.railway.app`. This is used by the dashboard and `.repo` command to show the live deployment link.
- `OPENAI_API_KEY`: Required only for AI commands that use OpenAI.

Railway provides the `PORT` variable automatically. The application listens on `process.env.PORT` and falls back to port `3000` for local development.

## Deploy

1. Create a Railway project and deploy this GitHub repository.
2. Confirm that the service uses the repository root as its source directory.
3. Add the variables above in the Railway service Variables panel.
4. Trigger a deployment. Railway will use the Dockerfile selected by `railway.json`.
5. Verify that the deployment logs show the server listening on the assigned port.
6. Open the public deployment URL and confirm that the **Deploy with Telegram** panel shows an active Telegram bot link.

The website’s `/api/runtime-config` endpoint returns only public configuration: the Telegram bot link, the public deployment URL, and the WhatsApp channel link. It never returns `TELEGRAM_BOT_TOKEN` or any other secret.

## Telegram deployment and WhatsApp pairing

The Telegram bot is the recommended deployment/linking method:

1. Open the Telegram bot link shown on the website, or open the bot directly in Telegram.
2. Send `/connect 923271054080` using the complete WhatsApp number with country code and no plus sign.
3. Keep the Telegram chat open and copy the pairing code sent by the bot.
4. In WhatsApp, open **Settings → Linked Devices → Link a Device** and enter the code.
5. The website and Telegram bot now report the same persistent session state.

The website Connect panel also accepts the number directly. Both the website and Telegram flow resolve to the same canonical session for a WhatsApp number, preventing duplicate sockets and conflicting pairing codes. The `.pair` command now displays this link center rather than starting an isolated temporary authentication directory.

The Telegram bot supports `/start`, `/connect <number>`, `/clearsession`, and owner-only status controls. A plain WhatsApp number sent to the Telegram bot is also accepted as a quick-connect shortcut.

## Persistence

Railway container storage is ephemeral. Without a persistent volume or externally stored WhatsApp authentication data, a restart can require WhatsApp pairing again. The bot’s session files must remain outside Git and should be backed by a Railway volume or another secure persistence strategy for production use.

## Security

Keep `.env`, Telegram tokens, OpenAI keys, and WhatsApp authentication data outside Git. If any credentials were previously committed, rotate them and remove the secrets from the repository history. Baileys is pinned in `package.json` and `package-lock.json` to the tested version so a future `latest` release cannot change the deployment unexpectedly.
