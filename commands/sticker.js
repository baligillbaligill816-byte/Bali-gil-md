const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

// Command configuration
async function stickerCommand(sock, from, msg, isAdmin, q) {
    try {
        // Find current or quoted message for media
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const messageContent = quotedMessage || msg.message;

        // support direct sticker resend, image -> sticker
        const imageMessage = messageContent?.imageMessage;
        const videoMessage = messageContent?.videoMessage;
        const stickerMessage = messageContent?.stickerMessage;

        if (!imageMessage && !videoMessage && !stickerMessage) {
            return await sock.sendMessage(from, {
                text: '⚠️ Please reply to an image to create a sticker (or reply to a sticker to resend).'
            }, { quoted: msg });
        }

        // If it's already a sticker, download and re-send (useful for re-packaging)
        if (stickerMessage && !imageMessage && !videoMessage) {
            const stream = await downloadContentFromMessage(stickerMessage, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            if (!buffer.length) throw new Error('Failed to download sticker');

            await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
            return;
        }

        // Notify user
        await sock.sendMessage(from, {
            text: '✨ Converting to sticker...'
        }, { quoted: msg });

        // Handle image -> webp (static sticker)
        if (imageMessage) {
            const stream = await downloadContentFromMessage(imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            if (!buffer.length) throw new Error('Failed to download image');

            // Normalize/resize and convert to webp using sharp (in-memory)
            const webpBuffer = await sharp(buffer)
                .resize(512, 512, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .webp({ quality: 80, effort: 6 })
                .toBuffer();

            await sock.sendMessage(from, { sticker: webpBuffer }, { quoted: msg });
            return;
        }

        // Video case: if you want animated stickers, implement ffmpeg -> webp conversion.
        if (videoMessage) {
            return await sock.sendMessage(from, {
                text: '⚠️ Video stickers (animated) are not supported yet. Please use an image.'
            }, { quoted: msg });
        }

    } catch (error) {
        console.error('Sticker Error:', error);
        try {
            await sock.sendMessage(from, {
                text: `❌ Error: ${error.message}`
            }, { quoted: msg });
        } catch (e) {
            console.error('Failed to send error message for sticker command', e);
        }
    }
}

module.exports = stickerCommand;
