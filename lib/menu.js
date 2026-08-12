const settings = require('../settings');
const fonts = require('./fonts');

const MENU_CATEGORIES = {
    ADMIN: ['private', 'public', 'owner', 'setname', 'block', 'unblock', 'bcgc', 'bcall', 'restart', 'shutdown', 'mode', 'xrestart', 'xshutdown', 'nuke', 'deleteall', 'backup', 'restore', 'clone'],
    AI: ['ai', 'chatbot', 'gpt4', 'gemini', 'llama', 'deepseek', 'mistral', 'flux', 'dalle3', 'bingai', 'blackbox', 'copilot', 'perplexity', 'imagine', 'pixart', 'brainly', 'simi', 'animedp'],
    GROUP: ['kick', 'add', 'promote', 'demote', 'revoke', 'invite', 'mute', 'unmute', 'kickoffline', 'hidetag', 'tagall', 'tagadmin', 'groupinfo', 'grouplink', 'join', 'leave', 'setdesc', 'setppgc', 'getbio', 'getdp', 'accept', 'poll', 'mention', 'tagme', 'everyonemsg', 'listonline'],
    DOWNLOAD: ['song', 'video', 'insta', 'tiktok', 'facebook', 'youtube', 'pinterest', 'twitter', 'reddit', 'spotify', 'mediafire', 'apk', 'gdrive', 'mf'],
    TOOLS: ['ping', 'pair', 'dp', 'vv', 'translate', 'base64', 'qr', 'shorturl', 'calc', 'weather', 'github', 'ipinfo', 'tempmail', 'fakeinfo', 'binlookup', 'whois', 'dnslookup', 'portscan', 'screenshot', 'define', 'google', 'wiki', 'yts', 'playstore', 'npm', 'sticker', 'toimg', 'tomp3', 'tts', 'blur', 'invert', 'crop', 'flip', 'grayscale', 'removebg', 'enlarge', 'lyrics', 'binary', 'hex', 'morse', 'mycmd', 'font'],
    'FUN & GAMES': ['joke', 'meme', 'dare', 'truth', 'ascii', 'roast', 'compliment', 'ship', 'emojimix', 'character', 'quote', 'fact', 'trivia', 'coinflip', 'roll', 'riddle', 'wouldyourather', 'advice', 'insult', 'tictactoe', 'hangman', 'chess', '8ball', 'wyr', 'blackjack', 'poker', 'slots', 'roulette', 'mines', 'snake-game', 'tetris', 'sudoku', '2048', 'flappy-bird'],
    RATINGS: ['gay', 'lesbian', 'stupid', 'handsome', 'beautiful', 'rich', 'poor', 'honest', 'fake', 'cool', 'hot', 'smart', 'dumb', 'kind', 'evil', 'loyal', 'brave', 'scared', 'funny', 'boring', 'weird', 'normal'],
    ANIME: ['waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'slap', 'kill', 'happy', 'wink', 'poke', 'dance', 'cringe', 'fox_girl', 'maid', 'uniform', 'oppai', 'hentai', 'trap'],
    LOGO: ['neon', 'glitch', 'gold', 'fire', 'water', 'shadow', 'cloud', 'smoke', 'blood', 'horror', 'scary', 'christmas', 'birthday', 'love', 'heart', 'marvel', 'avengers', 'transformer', 'blackpink', 'gradient', 'luxury', 'royal', 'metal', 'steel', 'chrome', 'glossy', 'magma', 'sand', 'magical', 'toxic', 'circuit', 'matrix', 'thunder', 'ice', 'snow', 'leaf', 'wood', 'stone', 'fabric', 'denim', 'leather', 'carbon', 'fiber', 'paper', 'cardboard', 'old', 'retro', 'vintage', 'sky', 'ocean', 'black', 'white', 'purple', 'green', 'blue', 'red', 'yellow', 'orange', 'pink', 'brown', 'diamond', 'pearl', 'crystal', 'glass', 'mirror', 'liquid', 'fire2', 'water2', 'neon4', 'neon5', 'comic', 'cartoon', 'anime', 'manga', 'sketch', 'pencil', 'oil', 'watercolor', 'ink', 'graffiti', 'cyber', 'punk', 'steam', 'space', 'galaxy2', 'nebula', 'star', 'moon', 'sun', 'planet', 'lion', 'tiger', 'wolf', 'eagle', 'dragon', 'snake', 'spider', 'scorpion', 'shark', 'whale'],
    ISLAMIC: ['quran', 'hadith', 'prayer', 'qibla', 'asmaulhusna'],
    NEWS: ['news_tech', 'news_sports', 'news_finance', 'news_world', 'news_health', 'news_science', 'news_business', 'news_crypto', 'news_gaming', 'news_politics'],
    SYSTEM: ['uptime', 'serverinfo', 'speedtest', 'report', 'device', 'runtime'],
    PROTECTION: ['antilink', 'anticall', 'antidelete', 'antistatus', 'antibug'],
    STATUS: ['status', 'autostatus', 'autoreacts', 'autoread', 'ghostmode'],
    KHATARNAK: ['hack', 'repo', 'spam', 'smsbomb', 'callbomb', 'crash', 'freeze', 'lag', 'bug', 'group-bug', 'mass-bug', 'vcard-bug', 'ios-crash', 'andro-crash', 'number-bug', 'locspam', 'vcardspam', 'buttonspam', 'pollspam', 'contactspam', 'bug_powerful', 'system-lag', 'ui-freeze', 'wa-crash', 'data-drain', 'memory-bug', 'infinity-bug', 'ghost-crash', 'nuke-bug', 'dark-payload', 'void-crash']
};

function buildFullMenuText(session = {}, commands = {}) {
    const botName = settings.botName || 'BALI GIL MINI BOT';
    const ownerName = settings.ownerName || 'ITACHI-UCHIHA';
    const prefix = settings.prefix || '.';
    const version = settings.version || '4.0.1';
    const mode = session.isPublic ? 'PUBLIC' : 'PRIVATE';
    const uniqueCommands = new Set(Object.values(MENU_CATEGORIES).flat());
    const loadedCommands = Object.keys(commands || {}).filter((name) => typeof commands[name] === 'function').length;
    const commandCount = Math.max(uniqueCommands.size, loadedCommands);

    let menu = '';
    menu += `╔══════════════════════════════════╗\n`;
    menu += `║   ✨ ${fonts.bold_serif(botName)} ✨   ║\n`;
    menu += `╠══════════════════════════════════╣\n`;
    menu += `┃ 👤 ${fonts.bold_serif('Owner')}: ${ownerName}\n`;
    menu += `┃ 🛠️ ${fonts.bold_serif('Commands')}: ${commandCount}+\n`;
    menu += `┃ ⏱️ ${fonts.bold_serif('Runtime')}: ${process.uptime().toFixed(0)}s\n`;
    menu += `┃ 📍 ${fonts.bold_serif('Prefix')}: ${prefix}\n`;
    menu += `┃ 🔐 ${fonts.bold_serif('Mode')}: ${mode}\n`;
    menu += `┃ 📂 ${fonts.bold_serif('Version')}: ${version}\n`;
    menu += `╚══════════════════════════════════╝\n\n`;
    menu += `📚 ${fonts.bold_serif('ALL SECTIONS ARE BELOW')}\n`;
    menu += `Use any command directly, for example: ${prefix}ping or ${prefix}song.\n\n`;

    for (const [category, categoryCommands] of Object.entries(MENU_CATEGORIES)) {
        const sortedCommands = [...new Set(categoryCommands)].sort((a, b) => a.localeCompare(b));
        menu += `┌──『 ${fonts.bold_serif(category)} 』──┐\n`;
        sortedCommands.forEach((command, index) => {
            const branch = index === sortedCommands.length - 1 ? '└' : '├';
            menu += `${branch}──➤ ${prefix}${fonts.typewriter(command.toUpperCase())}\n`;
        });
        menu += `└──────────────────────────────┘\n\n`;
    }

    menu += `✅ ${fonts.bold_serif('ONE-MESSAGE MENU')} — no section navigation required.\n`;
    menu += `✨ ${fonts.bold_serif('POWERED BY ITACHI-UCHIHA')} ✨`;
    return menu;
}

module.exports = {
    MENU_CATEGORIES,
    buildFullMenuText
};
