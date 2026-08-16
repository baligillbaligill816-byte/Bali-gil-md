// commands/goodbye.js
// Sends the Exile notice goodbye message.

const buildGoodbyeText = ({ userMention, gname, count }) => {
  return `☁️ *━───── 🗡️ EXILE NOTICE 🗡️ ─────━* ☁️\n\n*An exile has departed...* \n\n👋 ${userMention} has deserted *${gname}*.\n👥 *Remaining Ranks:* *${count}*\n\n> _"True art is an explosion... and your presence here just burned out."_ 💥\n\nCross their name off the scroll. The shadows move forward without hesitation.`;
};

const send = async (client, chatId, text, mentions) => {
  try {
    if (client && typeof client.sendMessage === 'function') {
      await client.sendMessage(chatId, { text, mentions: mentions || [] });
      return;
    }
    if (client && typeof client.send === 'function') {
      await client.send(chatId, text);
      return;
    }
    console.warn('No known send method on client; please adapt the goodbye command to your client library.');
  } catch (err) {
    console.error('Failed to send goodbye message', err);
  }
};

const handle = async (client, message, args) => {
  const chatId = message.chat || message.from || message.key?.remoteJid;
  const senderId = message.sender || message.key?.participant || message.from || '@user';
  const userMention = senderId ? `@${String(senderId).split('@')[0]}` : '@user';
  const gname = (message.groupMetadata && (message.groupMetadata.subject || message.groupMetadata.name)) || message.gname || '@gname';
  const count = (message.groupMetadata && (message.groupMetadata.participants && message.groupMetadata.participants.length)) || message.count || '@count';

  const text = buildGoodbyeText({ userMention, gname, count });
  const mentions = senderId ? [senderId] : [];
  await send(client, chatId, text, mentions);
};

module.exports = {
  name: 'goodbye',
  aliases: ['bye', 'exile'],
  description: 'Send the Exile notice goodbye message',
  async run(client, m, args) { await handle(client, m, args); },
  async execute({ client, msg, args }) { await handle(client, msg, args); }
};
