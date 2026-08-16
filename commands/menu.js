// commands/menu.js
// Sends the menu text and also sends the repository's song.mp3 with the menu.
// Assumes song.mp3 is at the repository root (../song.mp3 relative to commands/).
// Compatible with Baileys-like clients (client.sendMessage).

const fs = require('fs');
const path = require('path');

const buildMenuText = (prefix = '.') => {
  let menuText = '';
  menuText += '📜 *Bot Menu*\n\n';
  menuText += `• ${prefix}welcome - Send the Akatsuki welcome message\n`;
  menuText += `• ${prefix}goodbye - Send the Exile notice goodbye message\n`;
  menuText += `• ${prefix}song <title> - Search for a song (or use the .song command)\n`;
  menuText += `• ${prefix}help - Show help and commands\n\n`;
  menuText += 'Use the commands with the prefix shown.\n';
  return menuText;
};

const sendAudioThenMenu = async (client, chatId, menuText) => {
  // Adjust path if your song.mp3 lives elsewhere.
  const songPath = path.join(__dirname, '..', 'song.mp3');

  try {
    if (fs.existsSync(songPath)) {
      // Prefer streaming for large files
      const stream = fs.createReadStream(songPath);
      if (client && typeof client.sendMessage === 'function') {
        await client.sendMessage(chatId, {
          audio: stream,
          mimetype: 'audio/mpeg',
          fileName: 'song.mp3'
        });
      } else if (client && typeof client.send === 'function') {
        // fallback generic send
        await client.send(chatId, fs.readFileSync(songPath));
      } else {
        console.warn('No known send method on client; skipping audio send.');
      }
    } else {
      console.warn(`song.mp3 not found at ${songPath}; skipping audio send.`);
    }
  } catch (err) {
    console.error('Failed to send audio with menu:', err);
  }

  // Send the textual menu (always do this even if audio failed)
  try {
    if (client && typeof client.sendMessage === 'function') {
      await client.sendMessage(chatId, { text: menuText });
      return;
    }
    if (client && typeof client.send === 'function') {
      await client.send(chatId, menuText);
      return;
    }
    console.warn('No known send method on client to send menu text.');
  } catch (err) {
    console.error('Failed to send menu text', err);
  }
};

const handle = async (client, message, args) => {
  const chatId = message.chat || message.from || message.key?.remoteJid;
  const prefix = '.'; // change if your bot uses a different prefix
  const menuText = buildMenuText(prefix);
  await sendAudioThenMenu(client, chatId, menuText);
};

module.exports = {
  name: 'menu',
  aliases: ['help', 'commands'],
  description: 'Show the bot menu and send song.mp3 along with it',
  async run(client, m, args) { await handle(client, m, args); },
  async execute({ client, msg, args }) { await handle(client, msg, args); }
};
