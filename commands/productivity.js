const fs = require('fs-extra');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/productivity.json');
const MAX_ITEMS_PER_USER = 50;

function loadStore() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const store = fs.readJsonSync(DATA_FILE);
            return store && typeof store === 'object' ? store : {};
        }
    } catch (error) {
        console.error('Unable to load productivity data:', error.message);
    }
    return {};
}

function saveStore(store) {
    fs.ensureDirSync(path.dirname(DATA_FILE));
    fs.writeJsonSync(DATA_FILE, store, { spaces: 2 });
}

function getUserKey(chatId, msg) {
    return msg?.key?.participant || msg?.key?.remoteJid || chatId;
}

function getUserStore(store, userKey) {
    if (!store[userKey]) store[userKey] = { notes: [], todos: [] };
    if (!Array.isArray(store[userKey].notes)) store[userKey].notes = [];
    if (!Array.isArray(store[userKey].todos)) store[userKey].todos = [];
    return store[userKey];
}

function itemNumber(input) {
    const number = Number.parseInt(String(input || '').trim(), 10);
    return Number.isInteger(number) && number > 0 ? number - 1 : -1;
}

async function send(sock, chatId, msg, text) {
    await sock.sendMessage(chatId, { text }, { quoted: msg });
}

async function note(sock, chatId, msg, _isAdmin, q) {
    const content = String(q || '').trim();
    if (!content) return send(sock, chatId, msg, 'Usage: .note <text>');

    const store = loadStore();
    const user = getUserStore(store, getUserKey(chatId, msg));
    if (user.notes.length >= MAX_ITEMS_PER_USER) {
        return send(sock, chatId, msg, `You can keep up to ${MAX_ITEMS_PER_USER} notes. Delete one with .delnote <number>.`);
    }

    user.notes.push({ text: content, createdAt: new Date().toISOString() });
    saveStore(store);
    return send(sock, chatId, msg, `📝 Note ${user.notes.length} saved. Use .notes to view your notes.`);
}

async function notes(sock, chatId, msg) {
    const store = loadStore();
    const user = getUserStore(store, getUserKey(chatId, msg));
    if (!user.notes.length) return send(sock, chatId, msg, '📝 You do not have any saved notes. Add one with .note <text>.');

    const text = user.notes
        .map((entry, index) => `${index + 1}. ${entry.text}`)
        .join('\n');
    return send(sock, chatId, msg, `📝 *YOUR NOTES*\n\n${text}\n\nDelete a note with .delnote <number>.`);
}

async function delnote(sock, chatId, msg, _isAdmin, q) {
    const store = loadStore();
    const user = getUserStore(store, getUserKey(chatId, msg));
    const index = itemNumber(q);
    if (index < 0 || index >= user.notes.length) return send(sock, chatId, msg, 'Usage: .delnote <number>\nUse .notes to see note numbers.');

    const [removed] = user.notes.splice(index, 1);
    saveStore(store);
    return send(sock, chatId, msg, `🗑️ Deleted note: ${removed.text}`);
}

async function clearnotes(sock, chatId, msg) {
    const store = loadStore();
    const user = getUserStore(store, getUserKey(chatId, msg));
    if (!user.notes.length) return send(sock, chatId, msg, '📝 You do not have any saved notes.');

    user.notes = [];
    saveStore(store);
    return send(sock, chatId, msg, '🗑️ All of your notes have been deleted.');
}

async function todo(sock, chatId, msg, _isAdmin, q) {
    const content = String(q || '').trim();
    if (!content) return send(sock, chatId, msg, 'Usage: .todo <task>');

    const store = loadStore();
    const user = getUserStore(store, getUserKey(chatId, msg));
    if (user.todos.length >= MAX_ITEMS_PER_USER) {
        return send(sock, chatId, msg, `You can keep up to ${MAX_ITEMS_PER_USER} tasks. Delete one with .deltodo <number>.`);
    }

    user.todos.push({ text: content, done: false, createdAt: new Date().toISOString() });
    saveStore(store);
    return send(sock, chatId, msg, `✅ Task ${user.todos.length} added. Use .todos to view your task list.`);
}

async function todos(sock, chatId, msg) {
    const store = loadStore();
    const user = getUserStore(store, getUserKey(chatId, msg));
    if (!user.todos.length) return send(sock, chatId, msg, '✅ Your task list is empty. Add a task with .todo <task>.');

    const completed = user.todos.filter((entry) => entry.done).length;
    const text = user.todos
        .map((entry, index) => `${entry.done ? '☑' : '☐'} ${index + 1}. ${entry.text}`)
        .join('\n');
    return send(sock, chatId, msg, `✅ *YOUR TASKS* (${completed}/${user.todos.length} complete)\n\n${text}\n\nComplete: .done <number>\nDelete: .deltodo <number>`);
}

async function done(sock, chatId, msg, _isAdmin, q) {
    const store = loadStore();
    const user = getUserStore(store, getUserKey(chatId, msg));
    const index = itemNumber(q);
    if (index < 0 || index >= user.todos.length) return send(sock, chatId, msg, 'Usage: .done <number>\nUse .todos to see task numbers.');

    user.todos[index].done = true;
    user.todos[index].completedAt = new Date().toISOString();
    saveStore(store);
    return send(sock, chatId, msg, `☑ Task ${index + 1} marked complete: ${user.todos[index].text}`);
}

async function deltodo(sock, chatId, msg, _isAdmin, q) {
    const store = loadStore();
    const user = getUserStore(store, getUserKey(chatId, msg));
    const index = itemNumber(q);
    if (index < 0 || index >= user.todos.length) return send(sock, chatId, msg, 'Usage: .deltodo <number>\nUse .todos to see task numbers.');

    const [removed] = user.todos.splice(index, 1);
    saveStore(store);
    return send(sock, chatId, msg, `🗑️ Deleted task: ${removed.text}`);
}

async function cleartodos(sock, chatId, msg) {
    const store = loadStore();
    const user = getUserStore(store, getUserKey(chatId, msg));
    if (!user.todos.length) return send(sock, chatId, msg, '✅ Your task list is already empty.');

    user.todos = [];
    saveStore(store);
    return send(sock, chatId, msg, '🗑️ All of your tasks have been deleted.');
}

module.exports = {
    note,
    notes,
    delnote,
    clearnotes,
    todo,
    todos,
    done,
    deltodo,
    cleartodos
};
