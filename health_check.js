const fs = require("fs");
const path = require("path");
const axios = require("axios");

const commandsDir = path.join(__dirname, "commands");
const results = [];

async function checkCommand(file) {
    const name = path.basename(file, path.extname(file));
    const fullPath = path.join(commandsDir, file);
    let status = "OK";
    let message = "";

    try {
        let mod = require(fullPath);
        if (mod && typeof mod === "object" && "default" in mod) mod = mod.default;

        let commandFunction = null;
        if (typeof mod === "function") {
            commandFunction = mod;
        } else if (mod && typeof mod === "object") {
            const preferredHandlers = ["handler", "handle", "execute", "run", name];
            commandFunction = preferredHandlers.map(k => mod[k]).find(f => typeof f === "function");
            if (!commandFunction) {
                const fnKeys = Object.keys(mod).filter(k => typeof mod[k] === "function");
                if (fnKeys.length === 1) {
                    commandFunction = mod[fnKeys[0]];
                } else if (fnKeys.length > 1) {
                    // If multiple functions, assume the command itself is one of them
                    commandFunction = mod[name] || mod[Object.keys(mod)[0]]; // Fallback to first if name not found
                }
            }
        }

        if (!commandFunction) {
            status = "FAIL";
            message = "No callable command function found in module.";
        }

        // Basic API check for known API-dependent commands
        if (name === "ai" || name === "extra") {
            try {
                await axios.get("https://api.siputzx.my.id/api/ai/duckai?message=test&model=gpt-4o-mini", { timeout: 5000 });
            } catch (apiError) {
                status = "WARN";
                message += ` (AI API check failed: ${apiError.message})`;
            }
        } else if (name === "lyrics") {
            try {
                await axios.get("https://api.siputzx.my.id/api/tools/lyrics?s=test", { timeout: 5000 });
            } catch (apiError) {
                status = "WARN";
                message += ` (Lyrics API check failed: ${apiError.message})`;
            }
        } else if (name === "song" || name === "video") {
            try {
                // This is a placeholder, actual video/song download is complex
                await axios.get("https://api.siputzx.my.id/api/d/youtube?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ", { timeout: 5000 });
            } catch (apiError) {
                status = "WARN";
                message += ` (Downloader API check failed: ${apiError.message})`;
            }
        } else if (name === "fact") {
            try {
                await axios.get("https://uselessfacts.jsph.pl/api/v2/facts/random", { timeout: 5000 });
            } catch (apiError) {
                status = "WARN";
                message += ` (Fact API check failed: ${apiError.message})`;
            }
        }

    } catch (e) {
        status = "ERROR";
        message = e.message;
    }
    results.push({ command: name, status, message });
}

async function runHealthCheck() {
    const files = fs.readdirSync(commandsDir).filter(f => f.endsWith(".js") && f !== "index.js");
    for (const file of files) {
        await checkCommand(file);
    }

    console.log("--- Command Health Check Results ---");
    results.forEach(r => {
        console.log(`${r.command}: ${r.status} ${r.message ? `- ${r.message}` : ""}`);
    });

    const failed = results.filter(r => r.status === "FAIL" || r.status === "ERROR");
    const warnings = results.filter(r => r.status === "WARN");

    if (failed.length > 0) {
        console.error(`\n❌ ${failed.length} commands failed to load or are broken.`);
    }
    if (warnings.length > 0) {
        console.warn(`\n⚠️ ${warnings.length} commands have warnings (e.g., API issues).`);
    }
    if (failed.length === 0 && warnings.length === 0) {
        console.log("\n✅ All commands passed health checks.");
    }
}

runHealthCheck();
