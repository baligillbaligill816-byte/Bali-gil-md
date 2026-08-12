const axios = require('axios');
const { createDownloadProgress } = require('../lib/downloadProgress');

async function tiktokCommand(sock, from, msg, q) {
    if (!q) return await sock.sendMessage(from, { text: "❌ Please provide a TikTok URL." }, { quoted: msg });
    
    let loader;
    try {
        await sock.sendMessage(from, { react: { text: '☁️', key: msg.key } });
        loader = await createDownloadProgress(sock, from, msg, {
            title: 'TikTok media',
            detail: 'Resolving the TikTok media source'
        });

        // Using TikWM API as it's generally reliable
        const res = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(q)}`);
        
        if (res.data && res.data.data) {
            const videoData = res.data.data;
            await loader.update('SOURCE FOUND', 55, 'TikTok media source is ready');
            const videoUrl = videoData.play; // This is the direct MP4 URL
            const musicUrl = videoData.music;
            const author = videoData.author.nickname;
            const title = videoData.title || "TikTok Video";

            const caption = `*\u1F3A5 TikTok Downloader*\n\n` +
                `📝 *Title:* ${title}\n` +
                `👤 *Author:* ${author}\n\n` +
                `> © POWERED BY SHADOW MD BOT`;

            // Send Video
            await loader.update('SENDING FILE', 94, 'Uploading TikTok video to your chat');
            await sock.sendMessage(from, { 
                video: { url: videoUrl }, 
                caption,
                mimetype: 'video/mp4'
            }, { quoted: msg });
            
            await loader.complete('TikTok video delivered to your chat');
            await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
        } else {
            throw new Error('Failed to fetch TikTok video.');
        }
    } catch (e) {
        console.error('TikTok Error:', e);
        if (loader) await loader.fail(e.message);
        else await sock.sendMessage(from, { text: "❌ Error downloading TikTok: " + e.message }, { quoted: msg });
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
    }
}

module.exports = tiktokCommand;
