const axios = require('axios');

const SEARCH_QUERY = 'boys dp profile picture aesthetic portrait';
const FALLBACK_PROMPT = 'a stylish young man portrait for a WhatsApp display picture, clean background, square composition, tasteful fashion photography, no text, no watermark';

function extractPinterestImages(payload) {
    const images = [];
    const seen = new Set();

    const visit = (value) => {
        if (!value) return;
        if (typeof value === 'string') {
            if (/^https?:\/\//i.test(value) && /\.(?:jpe?g|png|webp)(?:[?#]|$)/i.test(value)) {
                const normalized = value.replace(/\\u002F/g, '/');
                if (!seen.has(normalized)) {
                    seen.add(normalized);
                    images.push(normalized);
                }
            }
            return;
        }
        if (Array.isArray(value)) {
            value.forEach(visit);
            return;
        }
        if (typeof value === 'object') {
            Object.entries(value).forEach(([key, child]) => {
                if (['url', 'orig', 'originals', 'images', 'image'].includes(key)) visit(child);
                else if (typeof child === 'object') visit(child);
            });
        }
    };

    visit(payload);
    return images.filter((url) => !/avatar|logo|icon|profile-pictures\/default/i.test(url)).slice(0, 12);
}

module.exports = async function dpboysCommand(sock, chatId, msg) {
    try {
        await sock.sendMessage(chatId, { react: { text: '🖼️', key: msg.key } });
        await sock.sendMessage(chatId, { text: '🔎 Finding a boys DP for you...' }, { quoted: msg });

        let imageUrl = null;
        try {
            const endpoint = 'https://www.pinterest.com/resource/BaseSearchResource/get/';
            const response = await axios.get(endpoint, {
                timeout: 12000,
                headers: { 'User-Agent': 'Mozilla/5.0' },
                params: {
                    source_url: `/search/pins/?q=${encodeURIComponent(SEARCH_QUERY)}`,
                    data: JSON.stringify({ options: { filters: '', page_size: 25 }, context: {} })
                }
            });
            imageUrl = extractPinterestImages(response.data)[0] || null;
        } catch (error) {
            console.warn('[dpboys] Pinterest lookup failed:', error.message);
        }

        if (!imageUrl) {
            imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(FALLBACK_PROMPT)}?width=768&height=768&nologo=true&safe=true`;
        }

        await sock.sendMessage(chatId, {
            image: { url: imageUrl },
            caption: '🖼️ *Boys DP*\n\nUse `.dpboys` again for another display picture.\n_Powered by BALI GIL_'
        }, { quoted: msg });
    } catch (error) {
        console.error('[dpboys] Command error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ I could not fetch a boys DP right now. Please try `.dpboys` again in a moment.'
        }, { quoted: msg });
    }
};

module.exports.dpboys = module.exports;
