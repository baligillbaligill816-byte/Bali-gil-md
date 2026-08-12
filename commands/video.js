const axios = require('axios');
const yts = require('yt-search');
const { createDownloadProgress } = require('../lib/downloadProgress');

const AXIOS_DEFAULTS = {
    timeout: 60000,
    headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json, text/plain, */*'
    }
};

async function tryRequest(getter, attempts = 3) {
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await getter();
        } catch (err) {
            lastError = err;
            if (attempt < attempts) {
                await new Promise(r => setTimeout(r, 1000 * attempt));
            }
        }
    }
    throw lastError;
}

async function getEliteProTechVideoByUrl(youtubeUrl) {
    const apiUrl = `https://eliteprotech-apis.zone.id/ytdown?url=${encodeURIComponent(youtubeUrl)}&format=mp4`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.success && res?.data?.downloadURL) {
        return { download: res.data.downloadURL, title: res.data.title };
    }
    throw new Error('EliteProTech failed');
}

async function getYupraVideoByUrl(youtubeUrl) {
    const apiUrl = `https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.success && res?.data?.data?.download_url) {
        return { download: res.data.data.download_url, title: res.data.data.title };
    }
    throw new Error('Yupra failed');
}

async function getOkatsuVideoByUrl(youtubeUrl) {
    const apiUrl = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.result?.mp4) {
        return { download: res.data.result.mp4, title: res.data.result.title };
    }
    throw new Error('Okatsu failed');
}

// Additional fallback APIs
async function getAlyaVideoByUrl(youtubeUrl) {
    try {
        const res = await axios.get(`https://api.alyachan.pro/api/ytmp4?url=${encodeURIComponent(youtubeUrl)}&apikey=G7I6X7`, AXIOS_DEFAULTS);
        if (res?.data?.status && res?.data?.data?.url) {
            return { download: res.data.data.url, title: res.data.data.title };
        }
        throw new Error('Alya failed');
    } catch (e) {
        throw e;
    }
}

async function getVredenVideoByUrl(youtubeUrl) {
    try {
        const res = await axios.get(`https://api.vreden.my.id/api/ytmp4?url=${encodeURIComponent(youtubeUrl)}`, AXIOS_DEFAULTS);
        if (res?.data?.status && res?.data?.result?.download?.url) {
            return { download: res.data.result.download.url, title: res.data.result.metadata.title };
        }
        throw new Error('Vreden failed');
    } catch (e) {
        throw e;
    }
}

async function videoCommand(sock, from, message) {
    let loader;
    try {
        await sock.sendMessage(from, { react: { text: '☁️', key: message.key } });
        const messageContent = message.message?.ephemeralMessage?.message || message.message?.viewOnceMessage?.message || message.message?.viewOnceMessageV2?.message || message.message;
        const text = (messageContent.conversation || messageContent.extendedTextMessage?.text || messageContent.imageMessage?.caption || messageContent.videoMessage?.caption || '').trim();
        const query = text.replace(/^\.video\s+/i, '').trim();
        
        if (!query || query.toLowerCase() === '.video') {
            await sock.sendMessage(from, { text: 'Usage: .video <name or link>' }, { quoted: message });
            return;
        }

        loader = await createDownloadProgress(sock, from, message, {
            title: query,
            detail: 'Searching the crimson cloud for a video source'
        });

        let videoUrl = '';
        let videoTitle = '';
        let videoThumbnail = '';
        
        if (query.includes('youtube.com') || query.includes('youtu.be')) {
            videoUrl = query;
            videoTitle = 'YouTube Video';
        } else {
            const { videos } = await yts(query);
            if (!videos || videos.length === 0) {
                await loader.fail('No matching video source was found');
                return;
            }
            videoUrl = videos[0].url;
            videoTitle = videos[0].title;
            videoThumbnail = videos[0].thumbnail;
        }

        await loader.update('SOURCE FOUND', 35, videoTitle || 'Reliable video source selected');
        await sock.sendMessage(from, {
            image: { url: videoThumbnail || 'https://i.postimg.cc/y6GV9P3H/file-000000004c307206bc366893b817568c-(1).png' },
            caption: `🎥 Downloading: *${videoTitle}*`
        }, { quoted: message });

        let videoData;
        let downloadSuccess = false;
        const apiMethods = [
            { name: 'EliteProTech', method: () => getEliteProTechVideoByUrl(videoUrl) },
            { name: 'Yupra', method: () => getYupraVideoByUrl(videoUrl) },
            { name: 'Okatsu', method: () => getOkatsuVideoByUrl(videoUrl) },
            { name: 'Alya', method: () => getAlyaVideoByUrl(videoUrl) },
            { name: 'Vreden', method: () => getVredenVideoByUrl(videoUrl) }
        ];
        
        for (let index = 0; index < apiMethods.length; index++) {
            const apiMethod = apiMethods[index];
            try {
                await loader.update('RETRIEVING VIDEO', 50 + (index * 7), `Trying ${apiMethod.name}`);
                videoData = await apiMethod.method();
                if (videoData.download) {
                    downloadSuccess = true;
                    break;
                }
            } catch (err) {
                console.log(`${apiMethod.name} failed:`, err.message);
            }
        }
        
        if (!downloadSuccess) throw new Error('All download sources failed.');

        await loader.update('SENDING FILE', 94, 'Uploading video to your chat');
        await sock.sendMessage(from, {
            video: { url: videoData.download },
            mimetype: 'video/mp4',
            fileName: `${videoData.title.replace(/[^\w\s-]/g, '')}.mp4`,
            caption: `*${videoData.title}*\n\n> *Downloaded by BALI-GIL*`
        }, { quoted: message });
        await loader.complete('Video delivered to your chat');
        await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

    } catch (error) {
        console.error('Video error:', error);
        if (loader) await loader.fail(error.message);
        else await sock.sendMessage(from, { text: `❌ Error: ${error.message}` }, { quoted: message });
        await sock.sendMessage(from, { react: { text: '❌', key: message.key } });
    }
}

module.exports = videoCommand;