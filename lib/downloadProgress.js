function clampProgress(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return Math.max(0, Math.min(100, Math.round(numeric)));
}

function progressBar(value) {
    const progress = clampProgress(value);
    const total = 10;
    const filled = Math.round((progress / 100) * total);
    return `${'▰'.repeat(filled)}${'▱'.repeat(total - filled)}`;
}

function safeLabel(value, fallback = 'Requested media') {
    const label = String(value || fallback).replace(/\s+/g, ' ').trim();
    return label.length > 54 ? `${label.slice(0, 51)}...` : label;
}

function formatProgress({ title, state, progress, detail, failed }) {
    const status = failed ? 'DOWNLOAD FAILED' : state;
    const icon = failed ? '✕' : progress >= 100 ? '✓' : '☁';
    return `╭━━〔 *AKATSUKI DOWNLOAD* 〕━━\n` +
        `┃ ${icon} *STATE:* ${status}\n` +
        `┃ *PROGRESS:* ${progressBar(progress)} ${clampProgress(progress)}%\n` +
        `┃ *MEDIA:* ${safeLabel(title)}\n` +
        `┃ *DETAIL:* ${safeLabel(detail, 'Working through the crimson cloud')}\n` +
        `╰━━━━━━━━━━━━━━━━━━━━\n` +
        `> *BALI GIL // AKATSUKI NODE*`;
}

async function createDownloadProgress(sock, chatId, msg, options = {}) {
    let messageKey = null;
    const title = safeLabel(options.title, 'Requested media');

    async function publish(state, progress, detail, failed = false) {
        const text = formatProgress({ title, state, progress, detail, failed });
        if (messageKey) {
            try {
                await sock.sendMessage(chatId, { text, edit: messageKey });
                return;
            } catch (error) {
                // Some Baileys/WhatsApp versions do not support edits. Fall back to a new status message.
            }
        }

        const sent = await sock.sendMessage(chatId, { text }, { quoted: msg });
        messageKey = sent?.key || messageKey;
    }

    await publish('ANALYZING REQUEST', 12, options.detail || 'Locating a reliable media source');

    return {
        update: (state, progress, detail) => publish(state, progress, detail),
        complete: (detail = 'Media delivered successfully') => publish('COMPLETE', 100, detail),
        fail: (detail = 'The source did not return a downloadable file') => publish('FAILED', 100, detail, true)
    };
}

module.exports = {
    createDownloadProgress
};
