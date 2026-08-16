// commands/song.js
// Minimal .song placeholder: returns a YouTube search link for the given title.
// Replace with actual search / audio logic as needed.

const send = async (client, chatId, text) => {
  try {
    if (client && typeof client.sendMessage === 'function') {
      await client.sendMessage(chatId, { text });
      return;
    }
    if (client && typeof client.send === 'function') {
      await client.send(chatId, text);
      return;
    }
    console.warn('No known send method on client; please adapt the song command to your client library.');
  } catch (err) {
    console.error('Failed to send song message', err);
  }
};

const handle = async (client, message, args) => {
  const chatId = message.chat || message.from || message.key?.remoteJid;
  if (!args || args.length === 0) {
    return await send(client, chatId, 'Usage: .song <song name>');
  }
  const query = args.join(' ');
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const text = `🔎 Searching for: ${query}\nOpen this link to choose a result:\n${searchUrl}`;
  await send(client, chatId, text);
};

module.exports = {
  name: 'song',
  aliases: ['play', 'music'],
  description: 'Search for a song and return a link. Usage: .song <title>',
  async run(client, m, args) { await handle(client, m, args); },
  async execute({ client, msg, args }) { await handle(client, msg, args); }
};
