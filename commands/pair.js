function getPublicUrl() {
    if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, '');
    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
        const domain = process.env.RAILWAY_PUBLIC_DOMAIN.replace(/^https?:\/\//, '').replace(/\/$/, '');
        return `https://${domain}`;
    }
    return '';
}

function getTelegramLink() {
    const username = String(process.env.TELEGRAM_BOT_USERNAME || '').trim().replace(/^@/, '').replace(/[^a-zA-Z0-9_]/g, '');
    return username ? `https://t.me/${username}` : '';
}

async function pairCommand(sock, from, msg, q) {
    const number = String(q || '').replace(/\D/g, '');
    const numberLine = number.length >= 10 ? `\nNumber received: ${number}` : '';
    const website = getPublicUrl();
    const telegram = getTelegramLink();
    const links = [
        website ? `Website: ${website}` : '',
        telegram ? `Telegram: ${telegram}` : ''
    ].filter(Boolean).join('\n');

    const instructions =
        `╭━━〔 *BALI GIL LINK CENTER* 〕━━╮\n` +
        `┃ Persistent session linking\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
        `The old temporary pairing flow has been retired so your browser, Telegram, and WhatsApp sessions do not conflict.${numberLine}\n\n` +
        `Use the Telegram bot and send:\n` +
        `\`/connect ${number.length >= 10 ? number : '923271054080'}\`\n\n` +
        `Or open the website and use the Connect panel. Both methods now use the same persistent session.\n\n` +
        (links || 'Set PUBLIC_URL and TELEGRAM_BOT_USERNAME in the deployment variables to show direct links.') +
        `\n\n> POWERED BY ITACHI-UCHIHA`;

    await sock.sendMessage(from, { text: instructions }, { quoted: msg });
}

module.exports = pairCommand;
