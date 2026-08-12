const axios = require('axios');
const { createDownloadProgress } = require('../lib/downloadProgress');

async function gdriveCommand(sock, from, msg, q) {
    if (!q) return await sock.sendMessage(from, { text: "❌ Please provide a Google Drive link." }, { quoted: msg });

    let loader;
    try {
        await sock.sendMessage(from, { react: { text: '☁️', key: msg.key } });
        loader = await createDownloadProgress(sock, from, msg, {
            title: 'Google Drive file',
            detail: 'Analyzing the shared file link'
        });
        let fileId = "";
        const patterns = [
            /\/file\/d\/([a-zA-Z0-9_-]{25,})/,
            /id=([a-zA-Z0-9_-]{25,})/,
            /([a-zA-Z0-9_-]{33,})/
        ];

        for (let pattern of patterns) {
            const match = q.match(pattern);
            if (match) {
                fileId = match[1];
                break;
            }
        }

        if (fileId) {
            await loader.update('FILE FOUND', 40, 'Google Drive file identifier confirmed');
            const downloadUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
            
            // Try to fetch headers to get real filename and size
            let fileName = `gdrive_file_${fileId}`;
            let fileSize = "Unknown";
            
            try {
                await loader.update('FETCHING METADATA', 62, 'Reading filename and file size');
                const response = await axios.get(downloadUrl, { 
                    headers: { 'User-Agent': 'Mozilla/5.0' },
                    maxRedirects: 5 
                });
                
                const contentDisp = response.headers['content-disposition'];
                if (contentDisp) {
                    const fnameMatch = contentDisp.match(/filename="(.+)"/);
                    if (fnameMatch) fileName = fnameMatch[1];
                }
                
                const contentLen = response.headers['content-length'];
                if (contentLen) {
                    const bytes = parseInt(contentLen);
                    if (bytes < 1024) fileSize = bytes + " B";
                    else if (bytes < 1024 * 1024) fileSize = (bytes / 1024).toFixed(2) + " KB";
                    else if (bytes < 1024 * 1024 * 1024) fileSize = (bytes / (1024 * 1024)).toFixed(2) + " MB";
                    else fileSize = (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
                }
            } catch (headErr) {
                console.log("Could not fetch metadata, using defaults.");
            }

            const caption = `╭━━━〔 𝗚𝗗𝗥𝗜𝗩𝗘 𝗗𝗟 〕━━━┈⊷\n` +
                          `┃ 📝 *FILE NAME:* ${fileName}\n` +
                          `┃ ⚖️ *FILE SIZE:* ${fileSize}\n` +
                          `╰━━━━━━━━━━━━━━━━━━┈⊷`;
            
            await loader.update('SENDING FILE', 94, 'Uploading the Google Drive file to your chat');
            await sock.sendMessage(from, { 
                document: { url: downloadUrl }, 
                mimetype: 'application/octet-stream',
                fileName: fileName,
                caption: caption
            }, { quoted: msg });
            await loader.complete('Google Drive file delivered to your chat');
            await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
        } else {
            await loader.fail('Could not extract a valid Google Drive file identifier');
        }
    } catch (e) {
        console.error("GDrive Error:", e);
        if (loader) await loader.fail(e.message);
        else await sock.sendMessage(from, { text: "❌ Error downloading from GDrive: " + e.message }, { quoted: msg });
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
    }
}

module.exports = gdriveCommand;
