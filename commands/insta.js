const axios = require('axios');
const { createDownloadProgress } = require('../lib/downloadProgress');

async function instaCommand(sock, from, msg, q) {
    if (!q) return await sock.sendMessage(from, { text: "❌ Please provide an Instagram URL." }, { quoted: msg });
    
    let loader;
    try {
        await sock.sendMessage(from, { react: { text: '☁️', key: msg.key } });
        loader = await createDownloadProgress(sock, from, msg, {
            title: 'Instagram media',
            detail: 'Resolving the Instagram media source'
        });

        // Using Siputzx API for Instagram
        const apiUrl = `https://api.siputzx.my.id/api/d/instagram?url=${encodeURIComponent(q)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (data && data.status && data.data && data.data.length > 0) {
            await loader.update('SOURCE FOUND', 52, `${data.data.length} media item(s) ready to download`);
            for (let index = 0; index < data.data.length; index++) {
                const item = data.data[index];
                await loader.update('SENDING MEDIA', 62 + Math.min(30, Math.round((index / data.data.length) * 30)), `Delivering item ${index + 1} of ${data.data.length}`);
                const caption = `*\u1F4F7 Instagram Downloader*\n\n> © POWERED BY ITACHI-UCHIHA`;
                
                if (item.url.includes('.mp4') || item.thumbnail) {
                    // It's likely a video if it has a thumbnail or .mp4
                    await sock.sendMessage(from, { 
                        video: { url: item.url }, 
                        caption,
                        mimetype: 'video/mp4'
                    }, { quoted: msg });
                } else {
                    await sock.sendMessage(from, { 
                        image: { url: item.url }, 
                        caption 
                    }, { quoted: msg });
                }
            }
            await loader.complete('Instagram media delivered to your chat');
            await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
        } else {
            throw new Error("No media found or link is private.");
        }
    } catch (e) {
        console.error('Instagram Error:', e);
        if (loader) await loader.fail(e.message);
        else await sock.sendMessage(from, { text: "❌ Error downloading Instagram content: " + e.message }, { quoted: msg });
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
    }
}

module.exports = instaCommand;
