const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs').promises;
const path = require('path');
const { toAudio } = require('../lib/converter');
const { createDownloadProgress } = require('../lib/downloadProgress');

const AXIOS_DEFAULTS = {
    timeout: 60000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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

// EliteProTech API - Primary
async function getEliteProTechDownloadByUrl(youtubeUrl) {
    const apiUrl = `https://eliteprotech-apis.zone.id/ytdown?url=${encodeURIComponent(youtubeUrl)}&format=mp3`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.success && res?.data?.downloadURL) {
        return {
            download: res.data.downloadURL,
            title: res.data.title
        };
    }
    throw new Error('EliteProTech returned no download');
}

async function getYupraDownloadByUrl(youtubeUrl) {
    const apiUrl = `https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(youtubeUrl)}`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.success && res?.data?.data?.download_url) {
        return {
            download: res.data.data.download_url,
            title: res.data.data.title,
            thumbnail: res.data.data.thumbnail
        };
    }
    throw new Error('Yupra returned no download');
}

async function getOkatsuDownloadByUrl(youtubeUrl) {
    const apiUrl = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(youtubeUrl)}`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.dl) {
        return {
            download: res.data.dl,
            title: res.data.title,
            thumbnail: res.data.thumb
        };
    }
    throw new Error('Okatsu returned no download');
}

// Additional fallback APIs
async function getAlyaDownloadByUrl(youtubeUrl) {
    const apiUrl = `https://api.alyachan.pro/api/ytmp3?url=${encodeURIComponent(youtubeUrl)}&apikey=G7I6X7`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.status && res?.data?.data?.url) {
        return { download: res.data.data.url, title: res.data.data.title };
    }
    throw new Error('Alya failed');
}

async function getVredenDownloadByUrl(youtubeUrl) {
    const apiUrl = `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(youtubeUrl)}`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.status && res?.data?.result?.download?.url) {
        return { download: res.data.result.download.url, title: res.data.result.metadata.title };
    }
    throw new Error('Vreden failed');
}

async function songCommand(sock, from, message) {
    let loader;
    try {
        await sock.sendMessage(from, { react: { text: '☁️', key: message.key } });

        const messageContent = message.message?.ephemeralMessage?.message || message.message?.viewOnceMessage?.message || message.message?.viewOnceMessageV2?.message || message.message;
        const text = (messageContent.conversation || messageContent.extendedTextMessage?.text || messageContent.imageMessage?.caption || messageContent.videoMessage?.caption || '').trim();
        const query = text.replace(/^\.song\s+/i, '').trim();

        if (!query || query.toLowerCase() === '.song') {
            await sock.sendMessage(from, { text: 'Usage: .song <song name or YouTube link>' }, { quoted: message });
            return;
        }

        loader = await createDownloadProgress(sock, from, message, {
            title: query,
            detail: 'Searching the crimson cloud for an audio source'
        });

        let video;
        if (query.includes('youtube.com') || query.includes('youtu.be')) {
            video = { url: query, title: 'YouTube Audio', thumbnail: 'https://i.postimg.cc/y6GV9P3H/file-000000004c307206bc366893b817568c-(1).png' };
        } else {
            const search = await yts(query);
            if (!search || !search.videos.length) {
                await loader.fail('No matching audio source was found');
                return;
            }
            video = search.videos[0];
        }

        await loader.update('SOURCE FOUND', 35, video.title || 'Reliable audio source selected');

        // Inform user
        await sock.sendMessage(from, {
            image: { url: video.thumbnail },
            caption: `🎵 Downloading: *${video.title}*\n⏱ Duration: ${video.timestamp || 'N/A'}`
        }, { quoted: message });

        // Try multiple APIs with fallback chain
        let audioBuffer;
        let downloadSuccess = false;
        let finalTitle = video.title;
        
        const apiMethods = [
            { name: 'EliteProTech', method: () => getEliteProTechDownloadByUrl(video.url) },
            { name: 'Yupra', method: () => getYupraDownloadByUrl(video.url) },
            { name: 'Okatsu', method: () => getOkatsuDownloadByUrl(video.url) },
            { name: 'Alya', method: () => getAlyaDownloadByUrl(video.url) },
            { name: 'Vreden', method: () => getVredenDownloadByUrl(video.url) }
        ];
        
        for (let index = 0; index < apiMethods.length; index++) {
            const apiMethod = apiMethods[index];
            try {
                await loader.update('RETRIEVING AUDIO', 48 + (index * 7), `Trying ${apiMethod.name}`);
                const audioData = await apiMethod.method();
                const audioUrl = audioData.download;
                finalTitle = audioData.title || video.title;
                
                if (!audioUrl) continue;
                await loader.update('DOWNLOADING AUDIO', 76, 'Fetching the media file');

                const audioResponse = await axios.get(audioUrl, {
                    responseType: 'arraybuffer',
                    timeout: 120000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0',
                        'Accept': '*/*'
                    }
                });
                audioBuffer = Buffer.from(audioResponse.data);
                
                if (audioBuffer && audioBuffer.length > 0) {
                    downloadSuccess = true;
                    break;
                }
            } catch (err) {
                console.log(`${apiMethod.name} failed:`, err.message);
            }
        }
        
        if (!downloadSuccess) {
            throw new Error('All download sources failed.');
        }

        // Detect format and convert if needed
        const firstBytes = audioBuffer.slice(0, 4).toString('hex');
        let fileExtension = 'mp3';
        if (firstBytes.startsWith('000000') || audioBuffer.slice(4, 8).toString('ascii') === 'ftyp') fileExtension = 'm4a';
        else if (audioBuffer.toString('ascii', 0, 4) === 'OggS') fileExtension = 'ogg';
        else if (audioBuffer.toString('ascii', 0, 4) === 'RIFF') fileExtension = 'wav';

        await loader.update('PROCESSING AUDIO', 86, 'Preparing a WhatsApp-compatible file');
        let finalBuffer = audioBuffer;
        if (fileExtension !== 'mp3') {
            try {
                finalBuffer = await toAudio(audioBuffer, fileExtension);
            } catch (convErr) {
                console.warn('Conversion failed, sending original:', convErr.message);
            }
        }

        await loader.update('SENDING FILE', 94, 'Uploading audio to your chat');
        await sock.sendMessage(from, {
            audio: finalBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${finalTitle.replace(/[^\w\s-]/g, '')}.mp3`,
            ptt: false
        }, { quoted: message });
        await loader.complete('Audio delivered to your chat');
        await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

    } catch (err) {
        console.error('Song command error:', err);
        if (loader) await loader.fail(err.message);
        else await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: message });
        await sock.sendMessage(from, { react: { text: '❌', key: message.key } });
    }
}

module.exports = songCommand;