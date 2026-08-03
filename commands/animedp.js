const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

async function animedpCommand(sock, from, msg) {
    try {
        // Try multiple APIs
        let imageUrl = "";
        const apis = [
            "https://nekos.best/api/v2/waifu",
            "https://api.waifu.im/search?included_tags=waifu&is_nsfw=false"
        ];

        for (const api of apis) {
            try {
                const res = await axios.get(api, {
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                imageUrl = api.includes("nekos.best") ? res.data.results[0].url : res.data.images[0].url;
                if (imageUrl) break;
            } catch (err) {
                console.log(`API ${api} failed, trying next...`);
            }
        }

        if (!imageUrl) {
            return await sock.sendMessage(from, { text: "❌ All anime image APIs are currently unavailable." }, { quoted: msg });
        }

        const inputPath = path.join(__dirname, "..", `in_${Date.now()}.jpg`);
        const outputPath = path.join(__dirname, "..", `out_${Date.now()}.jpg`);

        // Download image in Node.js
        const response = await axios({
            method: 'get',
            url: imageUrl,
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const writer = fs.createWriteStream(inputPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const watermarkScript = path.join(__dirname, "..", "lib", "watermark.py");

        // Process with Python
        exec(`python3 ${watermarkScript} "${inputPath}" "${outputPath}"`, async (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                await sock.sendMessage(from, { text: "❌ Failed to process the image." }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { 
                    image: fs.readFileSync(outputPath), 
                    caption: "BALI GIL MD powered by ITACHI UCHIHA" 
                }, { quoted: msg });
            }

            // Clean up
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        });

    } catch (e) {
        console.error("Error in animedp command:", e);
        await sock.sendMessage(from, { text: "❌ An error occurred while generating the anime DP." }, { quoted: msg });
    }
}

module.exports = {
    animedp: animedpCommand
};
