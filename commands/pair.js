const { default: makeWASocket, useMultiFileAuthState, delay, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs-extra');
const path = require('path');

async function pairCommand(sock, from, msg, q) {
    if (!q) {
        return sock.sendMessage(
            from,
            { text: '❌ Please provide a phone number with country code!\nExample: .pair 923271054080' },
            { quoted: msg }
        );
    }

    const phoneNumber = q.replace(/[^0-9]/g, '');
    if (phoneNumber.length < 10) {
        return sock.sendMessage(
            from,
            { text: '❌ Invalid phone number. Use at least 10 digits with country code.' },
            { quoted: msg }
        );
    }

    await sock.sendMessage(
        from,
        { text: '╭━━〔 PAIRING REQUEST 〕━━╮\n┃ Generating a temporary code...\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n\nPlease keep WhatsApp open while the code is generated.' },
        { quoted: msg }
    );

    const tempSessionId = `temp_pair_${Date.now()}`;
    const authPath = path.join(__dirname, '../auth_info', tempSessionId);

    try {
        const { state } = await useMultiFileAuthState(authPath);
        const tempSock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: 'fatal' }),
            browser: Browsers.ubuntu('Chrome')
        });

        if (!tempSock.authState.creds.registered) {
            await delay(3000);
            let code = await tempSock.requestPairingCode(phoneNumber);
            code = code?.match(/.{1,4}/g)?.join('-') || code;

            const response =
                `╭━━〔 *PAIRING CODE READY* 〕━━╮\n` +
                `┃ Code: \`${code}\`\n` +
                `╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                `Open WhatsApp → Settings → Linked Devices → Link a Device, then enter this code.\n` +
                `The code is temporary and expires shortly.\n\n` +
                `> POWERED BY ITACHI-UCHIHA`;

            await sock.sendMessage(from, { text: response }, { quoted: msg });

            setTimeout(async () => {
                try {
                    await tempSock.logout();
                } catch (e) {
                    // The temporary socket may already be closed after linking.
                }
                try {
                    await fs.remove(authPath);
                } catch (e) {
                    // Cleanup is best effort.
                }
            }, 60000);
        }
    } catch (err) {
        await sock.sendMessage(from, { text: `❌ Pairing failed: ${err.message}` }, { quoted: msg });
        try {
            await fs.remove(authPath);
        } catch (e) {
            // Cleanup is best effort.
        }
    }
}

module.exports = pairCommand;
