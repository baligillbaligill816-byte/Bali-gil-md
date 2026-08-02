// autoreact.js - Auto React Command for MD Bot (Final Version)
// This version defaults to using a variety of emojis for different messages.

/**
 * Main command function for managing auto-reaction settings.
 */
async function autoreactsCommand(sock, from, msg, isAdmin, session, args = []) {
    if (!isAdmin) {
        return await sock.sendMessage(from, { 
            text: "❌ Only group admins can use this command." 
        }, { quoted: msg });
    }

    // Initialize session if not exists or if structure is old
    if (!session.autoReact || typeof session.autoReact.mode === 'undefined') {
        session.autoReact = {
            enabled: false,
            mode: 'random', // Default to random for variety
            emojis: ['✅', '❤️', '👏', '🔥', '🎉', '💕', '💯', '😡', '✨', '🚀', '😂', '👀', '👍', '🌟', '💎', '🎈'],
            reactions: {}, // Keyword specific
            rotatingIndex: 0
        };
    }

    const action = args[0]?.toLowerCase();

    if (action === 'on') {
        session.autoReact.enabled = true;
        // If user provides a specific emoji, use that as default, otherwise stay in random mode
        if (args[1] && !['random', 'rotating'].includes(args[1].toLowerCase())) {
            session.autoReact.mode = 'default';
            session.autoReact.defaultEmoji = args[1];
            await sock.sendMessage(from, { 
                text: `✅ Auto-React Enabled!\nMode: Fixed Emoji (${args[1]})` 
            }, { quoted: msg });
        } else {
            session.autoReact.mode = args[1]?.toLowerCase() === 'rotating' ? 'rotating' : 'random';
            await sock.sendMessage(from, { 
                text: `✅ Auto-React Enabled!\nMode: ${session.autoReact.mode.toUpperCase()} (Using all emojis for variety)` 
            }, { quoted: msg });
        }
    } 
    else if (action === 'off') {
        session.autoReact.enabled = false;
        await sock.sendMessage(from, { text: "❌ Auto-React Disabled!" }, { quoted: msg });
    } 
    else if (action === 'add') {
        // Add a new emoji to the pool
        const newEmoji = args[1];
        if (!newEmoji) return await sock.sendMessage(from, { text: "❌ Usage: .autoreact add [emoji]" }, { quoted: msg });
        session.autoReact.emojis.push(newEmoji);
        await sock.sendMessage(from, { text: `✅ Added ${newEmoji} to the emoji pool.` }, { quoted: msg });
    }
    else if (action === 'reset') {
        // Reset emoji pool
        session.autoReact.emojis = ['✅', '❤️', '👏', '🔥', '🎉', '💕', '💯', '😡', '✨', '🚀', '😂', '👀', '👍', '🌟', '💎', '🎈'];
        await sock.sendMessage(from, { text: "✅ Emoji pool reset to default list." }, { quoted: msg });
    }
    else if (action === 'status') {
        const status = session.autoReact.enabled ? '✅ Enabled' : '❌ Disabled';
        const mode = session.autoReact.mode;
        const count = session.autoReact.emojis.length;
        await sock.sendMessage(from, { 
            text: `📊 *Auto-React Status*\nStatus: ${status}\nMode: ${mode}\nEmoji Pool Size: ${count} emojis` 
        }, { quoted: msg });
    }
    else {
        await sock.sendMessage(from, { 
            text: `❌ *Usage:* .autoreact [on/off/add/reset/status]\n\n` +
                  `• *on* - Enable auto-react with random emojis (Variety mode)\n` +
                  `• *on [emoji]* - Enable with one specific emoji\n` +
                  `• *off* - Disable auto-react\n` +
                  `• *add [emoji]* - Add an emoji to the random pool\n` +
                  `• *reset* - Reset the emoji pool\n` +
                  `• *status* - Show current settings`
        }, { quoted: msg });
    }
}

/**
 * Message handler to process auto-reactions.
 */
async function handleAutoReact(sock, from, msg, session) {
    if (!session || !session.autoReact || !session.autoReact.enabled) return;
    
    const config = session.autoReact;
    let reaction = null;

    // 1. Check for keyword-based reactions first (if any)
    const text = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || "").toLowerCase();
    if (text && config.reactions) {
        for (const [kw, emo] of Object.entries(config.reactions)) {
            if (text.includes(kw.toLowerCase())) {
                reaction = emo;
                break;
            }
        }
    }

    // 2. If no keyword match, use the emoji pool for variety
    if (!reaction) {
        const pool = config.emojis || [];
        if (pool.length === 0) return;

        if (config.mode === 'rotating') {
            reaction = pool[config.rotatingIndex % pool.length];
            config.rotatingIndex = (config.rotatingIndex + 1) % pool.length;
        } else if (config.mode === 'random' || !config.mode) {
            // Default to random for "different emojis on different messages"
            reaction = pool[Math.floor(Math.random() * pool.length)];
        } else {
            reaction = config.defaultEmoji || pool[0];
        }
    }

    // Send reaction
    if (reaction) {
        try {
            await sock.sendMessage(from, { 
                react: { text: reaction, key: msg.key } 
            });
        } catch (e) {
            console.error('AutoReact Error:', e);
        }
    }
}

autoreactsCommand.handleAutoReact = handleAutoReact;
module.exports = autoreactsCommand;
