const { MENU_CATEGORIES, buildFullMenuText } = require('../lib/menu');
const settings = require('../settings');

async function allmenuCommand(sock, from, msg, session, commands) {
    const prefix = settings.prefix || '.';

    // Build a comprehensive alphabetical command list
    const allCommands = [...new Set(Object.values(MENU_CATEGORIES).flat())].sort((a, b) => a.localeCompare(b));

    const totalLoaded = commands ? Object.keys(commands).filter(k => typeof commands[k] === 'function').length : allCommands.length;

    let text = `╔══════════════════════════════════╗\n`;
    text += `║   📋 ALL COMMANDS LIST 📋        ║\n`;
    text += `╠══════════════════════════════════╣\n`;
    text += `┃ 🤖 Bot: BALI GIL MINI BOT\n`;
    text += `┃ 📦 Total Commands: ${allCommands.length}+\n`;
    text += `┃ ✅ Loaded: ${totalLoaded}\n`;
    text += `┃ 📍 Prefix: ${prefix}\n`;
    text += `╚══════════════════════════════════╝\n\n`;
    text += `📌 *USE:* ${prefix}<command>\n`;
    text += `📌 *EXAMPLE:* ${prefix}ping | ${prefix}song | ${prefix}ai\n\n`;

    for (const [category, cmds] of Object.entries(MENU_CATEGORIES)) {
        const sorted = [...new Set(cmds)].sort((a, b) => a.localeCompare(b));
        text += `━━━━━『 ${category} 』━━━━━\n`;
        const chunks = [];
        for (let i = 0; i < sorted.length; i += 3) {
            chunks.push(sorted.slice(i, i + 3).map(c => `${prefix}${c}`).join('  '));
        }
        text += chunks.join('\n') + '\n\n';
    }

    text += `✨ *POWERED BY ITACHI-UCHIHA* ✨\n`;
    text += `🔗 ${settings.whatsappChannel}`;

    await sock.sendMessage(from, { text }, { quoted: msg });
}

module.exports = allmenuCommand;
