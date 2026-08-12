const crypto = require('crypto');

async function send(sock, chatId, msg, text) {
    await sock.sendMessage(chatId, { text }, { quoted: msg });
}

function requireText(q, usage) {
    const text = String(q || '').trim();
    return text || null;
}

async function upper(sock, chatId, msg, _isAdmin, q) {
    const text = requireText(q);
    if (!text) return send(sock, chatId, msg, 'Usage: .upper <text>');
    return send(sock, chatId, msg, text.toUpperCase());
}

async function lower(sock, chatId, msg, _isAdmin, q) {
    const text = requireText(q);
    if (!text) return send(sock, chatId, msg, 'Usage: .lower <text>');
    return send(sock, chatId, msg, text.toLowerCase());
}

async function reverse(sock, chatId, msg, _isAdmin, q) {
    const text = requireText(q);
    if (!text) return send(sock, chatId, msg, 'Usage: .reverse <text>');
    return send(sock, chatId, msg, Array.from(text).reverse().join(''));
}

async function count(sock, chatId, msg, _isAdmin, q) {
    const text = requireText(q);
    if (!text) return send(sock, chatId, msg, 'Usage: .count <text>');

    const characters = Array.from(text).length;
    const charactersWithoutSpaces = Array.from(text.replace(/\s/g, '')).length;
    const words = text.split(/\s+/).filter(Boolean).length;
    const lines = text.split(/\r?\n/).length;
    return send(sock, chatId, msg, `📊 *TEXT COUNT*\n\nCharacters: ${characters}\nWithout spaces: ${charactersWithoutSpaces}\nWords: ${words}\nLines: ${lines}`);
}

async function slug(sock, chatId, msg, _isAdmin, q) {
    const text = requireText(q);
    if (!text) return send(sock, chatId, msg, 'Usage: .slug <text>');

    const value = text
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    return send(sock, chatId, msg, value || 'Unable to create a slug from that text.');
}

async function uuid(sock, chatId, msg) {
    return send(sock, chatId, msg, `🆔 *UUID*\n\n${crypto.randomUUID()}`);
}

async function timestamp(sock, chatId, msg) {
    const now = new Date();
    return send(sock, chatId, msg, `🕒 *CURRENT TIMESTAMP*\n\nUnix: ${Math.floor(now.getTime() / 1000)}\nISO: ${now.toISOString()}\nLocal: ${now.toLocaleString()}`);
}

module.exports = {
    upper,
    lower,
    reverse,
    count,
    slug,
    uuid,
    timestamp
};
