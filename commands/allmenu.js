const settings = require('../settings');
const fonts = require('../lib/fonts');

async function allMenu(sock, from, msg, session = {}, commands = {}) {
    const ownerName = (settings && settings.ownerName) ? settings.ownerName : 'ITACHI';
    const botName = (settings && settings.botName) ? settings.botName : 'BALI GIL MINI BOT';
    const prefix = (settings && settings.prefix) ? settings.prefix : '.';
    const version = (settings && settings.version) ? settings.version : '4.0.1';
    const mode = session.isPublic ? 'public' : 'private';

    const categories = {
        'ADMIN': ['private', 'public', 'owner', 'setname', 'block', 'unblock', 'bcgc', 'bcall', 'restart', 'shutdown', 'mode', 'xrestart', 'xshutdown', 'nuke', 'deleteall', 'backup', 'restore', 'clone'],
        'AI': ['ai', 'chatbot', 'gpt4', 'gemini', 'llama', 'deepseek', 'mistral', 'flux', 'dalle3', 'bingai', 'blackbox', 'copilot', 'perplexity', 'imagine', 'pixart', 'brainly', 'simi', 'animedp'],
        'GROUP': ['kick', 'add', 'promote', 'demote', 'revoke', 'invite', 'mute', 'unmute', 'kickoffline', 'hidetag', 'tagall', 'tagadmin', 'groupinfo', 'grouplink', 'join', 'leave', 'setdesc', 'setppgc', 'getbio', 'getdp', 'accept', 'poll', 'mention', 'tagme', 'everyonemsg', 'listonline'],
        'DOWNLOAD': ['song', 'video', 'insta', 'tiktok', 'facebook', 'youtube', 'pinterest', 'twitter', 'reddit', 'spotify', 'mediafire', 'apk', 'gdrive', 'mf'],
        'TOOLS': ['ping', 'pair', 'dp', 'vv', 'translate', 'base64', 'qr', 'shorturl', 'calc', 'weather', 'github', 'ipinfo', 'tempmail', 'fakeinfo', 'binlookup', 'whois', 'dnslookup', 'portscan', 'screenshot', 'define', 'google', 'wiki', 'yts', 'playstore', 'npm', 'sticker', 'toimg', 'tomp3', 'tts', 'blur', 'invert', 'crop', 'flip', 'grayscale', 'removebg', 'enlarge', 'lyrics', 'ebinary', 'dbinary', 'ehex', 'dhex', 'eoctal', 'doctal', 'url-encode', 'url-decode', 'json-format', 'xml-format', 'mycmd', 'font'],
        'FUN & GAMES': ['joke', 'meme', 'dare', 'truth', 'ascii', 'roast', 'compliment', 'ship', 'emojimix', 'character', 'quote', 'fact', 'trivia', 'coinflip', 'roll', 'riddle', 'wouldyourather', 'advice', 'insult', 'tictactoe', 'hangman', 'chess', '8ball', 'wyr', 'blackjack', 'poker', 'slots', 'roulette', 'mines', 'snake-game', 'tetris', 'sudoku', '2048', 'flappy-bird'],
        'RATINGS': ['gay', 'lesbian', 'stupid', 'handsome', 'beautiful', 'rich', 'poor', 'honest', 'fake', 'cool', 'hot', 'smart', 'dumb', 'kind', 'evil', 'loyal', 'brave', 'scared', 'funny', 'boring', 'weird', 'normal'],
        'ANIME': ['waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'slap', 'kill', 'happy', 'wink', 'poke', 'dance', 'cringe', 'fox_girl', 'maid', 'uniform', 'oppai', 'hentai', 'trap'],
        'LOGO': ['neon', 'glitch', 'gold', 'fire', 'water', 'shadow', 'cloud', 'smoke', 'blood', 'horror', 'scary', 'christmas', 'birthday', 'love', 'heart', 'marvel', 'avengers', 'transformer', 'blackpink', 'gradient', 'luxury', 'royal', 'metal', 'steel', 'chrome', 'glossy', 'magma', 'sand', 'magical', 'toxic', 'circuit', 'matrix', 'thunder', 'ice', 'snow', 'leaf', 'wood', 'stone', 'fabric', 'denim', 'leather', 'carbon', 'fiber', 'paper', 'cardboard', 'old', 'retro', 'vintage', 'sky', 'ocean', 'black', 'white', 'purple', 'green', 'blue', 'red', 'yellow', 'orange', 'pink', 'brown', 'diamond', 'pearl', 'crystal', 'glass', 'mirror', 'liquid', 'fire2', 'water2', 'neon4', 'neon5', 'comic', 'cartoon', 'anime', 'manga', 'sketch', 'pencil', 'oil', 'watercolor', 'ink', 'graffiti', 'cyber', 'punk', 'steam', 'space', 'galaxy2', 'nebula', 'star', 'moon', 'sun', 'planet', 'lion', 'tiger', 'wolf', 'eagle', 'dragon', 'snake', 'spider', 'scorpion', 'shark', 'whale'],
        'ISLAMIC': ['quran', 'hadith', 'prayer', 'qibla', 'asmaulhusna'],
        'NEWS': ['news_tech', 'news_sports', 'news_finance', 'news_world', 'news_health', 'news_science', 'news_business', 'news_crypto', 'news_gaming', 'news_politics'],
        'SYSTEM': ['uptime', 'serverinfo', 'speedtest', 'report', 'device', 'runtime'],
        'PROTECTION': ['antilink', 'anticall', 'antidelete', 'antistatus', 'antibug'],
        'STATUS': ['status', 'autostatus', 'autoreacts', 'autoread', 'ghostmode'],
        'KHATARNAK': ['hack', 'repo', 'spam', 'smsbomb', 'callbomb', 'crash', 'freeze', 'lag', 'bug', 'group-bug', 'mass-bug', 'vcard-bug', 'ios-crash', 'andro-crash', 'number-bug', 'locspam', 'vcardspam', 'buttonspam', 'pollspam', 'contactspam', 'bug_powerful', 'system-lag', 'ui-freeze', 'wa-crash', 'data-drain', 'memory-bug', 'infinity-bug', 'ghost-crash', 'nuke-bug', 'dark-payload', 'void-crash']
    };

    // Apply fonts to metadata
    const styledBotName = fonts.bold_serif(botName);
    const styledOwnerName = fonts.bold_serif(ownerName);
    const styledCommandsCount = fonts.bold_serif('420+');
    const styledRuntime = fonts.bold_serif(process.uptime().toFixed(0) + 's');
    const styledPrefix = fonts.bold_serif(prefix);
    const styledMode = fonts.bold_serif(mode);
    const styledVersion = fonts.bold_serif(version);

    let allMenuText = `╭━━━〔 ${styledBotName} 〕━━━┈⊷\n`;
    allMenuText += `✦ ${fonts.bold_serif('Owner')}: ${styledOwnerName}\n`;
    allMenuText += `✦ ${fonts.bold_serif('Commands')}: ${styledCommandsCount}\n`;
    allMenuText += `✦ ${fonts.bold_serif('Runtime')}: ${styledRuntime}\n`;
    allMenuText += `✦ ${fonts.bold_serif('Prefix')}: ${styledPrefix}\n`;
    allMenuText += `✦ ${fonts.bold_serif('Mode')}: ${styledMode}\n`;
    allMenuText += `✦ ${fonts.bold_serif('Version')}: ${styledVersion}\n`;
    allMenuText += `╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;

    for (const [category, cmds] of Object.entries(categories)) {
        const styledCategory = fonts.bold_serif(category);
        allMenuText += `╭━━┈⊷ 「 ${styledCategory} 」\n`;
        allMenuText += `┃━━━━━━━━━━━━━━━━━━━━━━━\n`;
        cmds.sort().forEach(cmd => {
            // Use typewriter for command names
            const styledCmd = fonts.typewriter(cmd.toUpperCase());
            allMenuText += `┃ ⬡ ${styledCmd}\n`;
        });
        allMenuText += `╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;
    }

    allMenuText += `🚀 ${fonts.bold_serif('POWERED BY')} : ${styledOwnerName} 🚀`;

    try {
        if (settings.startimage) {
            await sock.sendMessage(from, { image: { url: settings.startimage }, caption: allMenuText }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text: allMenuText }, { quoted: msg });
        }
    } catch (e) {
        await sock.sendMessage(from, { text: allMenuText }, { quoted: msg });
    }
}

module.exports = allMenu;
const sendMsg = async (text) => {
        return await sock.sendMessage(chatId, {
            text: text,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363425744388546@newsletter",
                    newsletterName: "ITACHI",
                    serverMessageId: 200
                }
            }
        }, { quoted: msg });
    };
