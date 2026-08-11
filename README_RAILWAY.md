# 🚀 Railway Deployment Guide (No Session ID Required)

This bot has been optimized to deploy directly to Railway. You no longer need to manually generate a `SESSION_ID` before deploying.

## 🛠️ Deployment Steps

1.  **Environment Variables**:
    In your Railway project settings, add these variables:
    *   `TELEGRAM_BOT_TOKEN`: Your Telegram Bot Token from @BotFather.
    *   `OWNER_NUMBER`: Your WhatsApp number with country code (e.g., `923271054080`).
    *   `OWNER_TELEGRAM_ID`: Your Telegram Chat ID (Get it from @userinfobot).
    *   `PORT`: `3000`

2.  **Deploy**:
    Push the updated code to your GitHub repository. Railway will detect the changes and start the deployment.

3.  **Automatic Pairing**:
    *   Once the bot starts on Railway, it will detect that no session exists.
    *   It will automatically request a **Pairing Code** for the `OWNER_NUMBER` you provided.
    *   The bot will send this code directly to your **Telegram Bot**.
    *   Open WhatsApp > Linked Devices > Link a Device > Link with phone number instead, and enter the code sent to your Telegram.

4.  **Web Dashboard**:
    You can also access the web dashboard via your Railway public URL to monitor logs or manually trigger pairing.

## ⚠️ Important Note on Persistence
Railway's file system is ephemeral. If the bot restarts, it will try to use the `SESSION_ID` environment variable if you set one later. If not, it will simply send a new pairing code to your Telegram to reconnect. 

**For 24/7 stability without re-pairing:**
After you link the bot once, you can use the `session_gen.js` script (provided in the fix package) to generate a `SESSION_ID` and add it to Railway. This will keep the bot logged in forever.
