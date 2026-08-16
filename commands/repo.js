const settings = require('../settings');

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

module.exports = async function (sock, chatId, msg) {
    const sendMsg = async (text) => sock.sendMessage(chatId, {
        text,
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363425744388546@newsletter',
                newsletterName: 'ITACHI',
                serverMessageId: 200
            }
        }
    }, { quoted: msg });

    try {
        await sock.sendMessage(chatId, { react: { text: '🔗', key: msg.key } });
        const website = getPublicUrl();
        const telegram = getTelegramLink();
        const response =
            `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n` +
            `┃  *BALI GIL MD — LINK CENTER*  ┃\n` +
            `┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n` +
            `┃  *Repository*\n` +
            `┃  https://github.com/itachi-uchia34/Bali-gil-md\n` +
            `┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n` +
            `┃  *Persistent Pairing*\n` +
            `┃  Use the website Connect panel or\n` +
            `┃  Telegram command: /connect 923271054080\n` +
            `┃  Both methods share one WhatsApp session.\n` +
            `┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n` +
            (website ? `┃  *Website*\n┃  ${website}\n` : '') +
            (telegram ? `┃  *Telegram*\n┃  ${telegram}\n` : '') +
            `┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n` +
            `┃  *Version* : ${settings.version || '4.0.1'}\n` +
            `┃  *Security* : Server-side session storage\n` +
            `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

        await sendMsg(response);
    } catch (error) {
        console.error('Repo command error:', error);
        await sendMsg('Unable to load the link center right now. Please try again shortly.');
    }
};
