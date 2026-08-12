const settings = require('../settings');

async function ownerCommand(sock, from, msg) {
    const ownerText = `👤 *BOT OWNER:* ${settings.ownerName}\n` +
                    `📱 *NUMBER:* +${settings.ownerNumber}\n` +
                    `🔗 *OFFICIAL WHATSAPP CHANNEL:*\n` +
                    `> *https://whatsapp.com/channel/0029VbC1gR3J3jv22YgI511b*`;
    await sock.sendMessage(from, { text: ownerText }, { quoted: msg });
}

module.exports = ownerCommand;
