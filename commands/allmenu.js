const { buildFullMenuText } = require('../lib/menu');

async function allMenu(sock, from, msg, session = {}, commands = {}) {
    const menuText = buildFullMenuText(session, commands);
    await sock.sendMessage(from, { text: menuText }, { quoted: msg });
}

module.exports = allMenu;
