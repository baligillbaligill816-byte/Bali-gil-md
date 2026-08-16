// commands/welcome.js
// Sends the Akatsuki welcome message. Exports both common handler shapes so it should work
// with most WhatsApp bot loaders (run(client,m,args) or execute({client,msg,args})).

const buildWelcomeText = ({ userMention, gname, count, desc }) => {
  return `🩸 *━───── 🔴 AKATSUKI MD 🔴 ─────━* 🩸\n\n*Welcome to the Shroud,* ${userMention} 👋\n\n You have entered: *${gname}*\n 👥 *Ranks Count:* *${count}* members\n\n📜 *ORGANIZATION LAWS:*\n${desc}\n\n> _\"Those who do not understand true pain can never understand true peace.\"_\n\n⚔️ Put on the cloak, wear your ring, and obey the dynamic. Weakness will not be tolerated.`;
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
    console.warn('No known send method on client; please adapt the welcome command to your client library.');
  } catch (err) {
    console.error('Failed to send welcome message', err);
  }
};

const handle = async (client, message, args) => {
  const chatId = message.chat || message.from || message.key?.remoteJid;
  // determine sender mention
  const senderId = message.sender || message.key?.participant || message.from;
  const userMention = senderId ? `@${String(senderId).split('@')[0]}` : '@user';

  // try to read group metadata if available
  const gname = (message.groupMetadata && (message.groupMetadata.subject || message.groupMetadata.name)) || message.gname || '@gname';
  const count = (message.groupMetadata && (message.groupMetadata.participants && message.groupMetadata.participants.length)) || message.count || '@count';
  const desc = (message.groupMetadata && (message.groupMetadata.desc || message.groupMetadata.description)) || message.desc || '@desc';

  const text = buildWelcomeText({ userMention, gname, count, desc });
  const mentions = senderId ? [senderId] : [];
  await send(client, chatId, text, mentions);
};

module.exports = {
  name: 'welcome',
  aliases: ['wel', 'hi'],
  description: 'Send the Akatsuki welcome message to the chat',
  async run(client, m, args) { await handle(client, m, args); },
  async execute({ client, msg, args }) { await handle(client, msg, args); }
};
