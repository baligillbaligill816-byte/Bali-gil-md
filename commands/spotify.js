const axios = require('axios');
const { createDownloadProgress } = require('../lib/downloadProgress');

module.exports = async function(sock, chatId, msg, q) {
    if (!q) return await sock.sendMessage(chatId, { text: '\u26A0\uFE0F .spotify <song name/link>' }, { quoted: msg });
    
    let loader;
    try {
        await sock.sendMessage(chatId, { react: { text: '☁️', key: msg.key } });
        loader = await createDownloadProgress(sock, chatId, msg, {
            title: 'Spotify audio',
            detail: 'Resolving the Spotify audio source'
        });

        // Use Siputzx API for Spotify download
        const apiUrl = `https://api.siputzx.my.id/api/d/spotify?url=${encodeURIComponent(q)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (data && data.status && data.data) {
            const track = data.data;
            await loader.update('SOURCE FOUND', 62, track.title || 'Spotify audio source is ready');
            const caption = `*\u1F3B6 Spotify Downloader*\n\n` +
                `🎵 *Title:* ${track.title}\n` +
                `👤 *Artist:* ${track.artist}\n` +
                `💿 *Album:* ${track.album || 'N/A'}\n\n` +
                `> © POWERED BY SHADOW MD BOT`;

            // Send Audio/Document
            await loader.update('SENDING FILE', 94, 'Uploading audio to your chat');
            await sock.sendMessage(chatId, { 
                audio: { url: track.download }, 
                mimetype: 'audio/mpeg',
                fileName: `${track.title}.mp3`,
                caption
            }, { quoted: msg });
            
            await loader.complete('Spotify audio delivered to your chat');
            await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });
        } else {
            await loader.update('SEARCHING FALLBACK', 68, 'Looking up Spotify track information');
            // If not a link, search on Deezer as fallback for info
            const searchResponse = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=1`);
            const tracks = searchResponse.data.data;
            if (!tracks || !tracks.length) {
                await loader.fail('No matching Spotify track was found');
                return;
            }
            
            const track = tracks[0];
            const text = `*\u1F3B6 Spotify Info*\n\n` +
                `🎵 *Title:* ${track.title}\n` +
                `👤 *Artist:* ${track.artist.name}\n` +
                `💿 *Album:* ${track.album.title}\n` +
                `🔗 *Link:* ${track.link}\n\n` +
                `_Tip: Use a Spotify link for direct download._`;
            
            await sock.sendMessage(chatId, { image: { url: track.album.cover_big }, caption: text }, { quoted: msg });
            await loader.complete('Track information delivered to your chat');
            await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });
        }
    } catch (e) {
        console.error('Spotify Error:', e);
        if (loader) await loader.fail(e.message);
        else await sock.sendMessage(chatId, { text: '\u274C Error: ' + e.message }, { quoted: msg });
        await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
    }
};
