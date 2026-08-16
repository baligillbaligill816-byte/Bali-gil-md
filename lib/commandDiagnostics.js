/**
 * COMMAND DIAGNOSTIC & FIX REPORT
 * This file identifies and documents all issues found in the commands folder
 */

const fs = require('fs-extra');
const path = require('path');

const ISSUES = {
  MISSING_EXPORT: 'Missing module.exports',
  INCONSISTENT_PARAMS: 'Inconsistent parameter handling',
  MISSING_DEPENDENCY: 'Missing required dependency',
  WRONG_EXPORT_FORMAT: 'Wrong export format (object vs function)',
  MISSING_ERROR_HANDLING: 'Missing try-catch or error handling',
  API_FAILURE_NO_FALLBACK: 'API calls without fallback',
  BROKEN_IMPORT: 'Importing non-existent modules',
  ASYNC_ISSUES: 'Not properly handling async/await'
};

const COMMAND_ISSUES = {
  // ===== CRITICAL ISSUES (Commands Won't Work) =====
  'commands/sticker.js': {
    severity: 'HIGH',
    issues: [
      {
        type: ISSUES.WRONG_EXPORT_FORMAT,
        description: 'Exports object with execute function, but index.js expects direct function',
        line: 7,
        fix: 'Export the execute function directly: module.exports = async function(sock, chatId, msg) { ... }'
      }
    ]
  },

  'commands/translate.js': {
    severity: 'HIGH',
    issues: [
      {
        type: ISSUES.WRONG_EXPORT_FORMAT,
        description: 'Exports { handleTranslateCommand } but index.js calls it as commands.translate()',
        line: 112,
        fix: 'Change to: module.exports = handleTranslateCommand;'
      }
    ]
  },

  'commands/song.js': {
    severity: 'MEDIUM',
    issues: [
      {
        type: ISSUES.BROKEN_IMPORT,
        description: 'Requires ../lib/converter module which may not export toAudio correctly',
        line: 5,
        fix: 'Verify lib/converter.js exports toAudio. Currently it does, but add error handling.'
      },
      {
        type: ISSUES.API_FAILURE_NO_FALLBACK,
        description: 'All 5 APIs may fail, leaving no fallback',
        line: 109,
        fix: 'Add backup MP3 download method or use web scraper'
      }
    ]
  },

  'commands/video.js': {
    severity: 'MEDIUM',
    issues: [
      {
        type: ISSUES.API_FAILURE_NO_FALLBACK,
        description: 'Only 3 APIs with no fallback if all fail',
        line: 95,
        fix: 'Add more video download APIs or web scraper'
      }
    ]
  },

  'commands/crash.js': {
    severity: 'HIGH',
    issues: [
      {
        type: ISSUES.INCONSISTENT_PARAMS,
        description: 'Function signature differs from other commands (sock, chatId, msg, isOwner, q)',
        line: 5,
        fix: 'Change to: async function(sock, from, msg, isOwner, q) for consistency'
      }
    ]
  },

  'commands/accept.js': {
    severity: 'LOW',
    issues: [
      {
        type: ISSUES.MISSING_ERROR_HANDLING,
        description: 'groupRequestParticipantsList may not exist in all Baileys versions',
        line: 12,
        fix: 'Add fallback error message for older Baileys versions'
      }
    ]
  }
};

/**
 * Generate fixes for all issues
 */
const FIXES = {
  'commands/sticker.js': `
// FIX: Change export format
// BEFORE:
module.exports = {
    name: 'sticker',
    execute: async function(sock, chatId, msg, args) { ... }
};

// AFTER:
async function stickerCommand(sock, chatId, msg, isAdmin, q) {
    // ... rest of code
}
module.exports = stickerCommand;
`,

  'commands/translate.js': `
// FIX: Change export format
// BEFORE:
module.exports = {
    handleTranslateCommand
};

// AFTER:
module.exports = handleTranslateCommand;
`,

  'commands/crash.js': `
// FIX: Normalize parameter names
// BEFORE:
module.exports = async function(sock, chatId, msg, isOwner, q)

// AFTER:
module.exports = async function(sock, from, msg, isOwner, q)
`,
};

module.exports = {
  ISSUES,
  COMMAND_ISSUES,
  FIXES,

  /**
   * Generate a detailed report
   */
  generateReport() {
    let report = `
╔════════════════════════════════════════════════════════════════════╗
║           BALI-GIL MD - COMMAND DIAGNOSTIC REPORT                  ║
║                    Auto-Generated Issues Found                      ║
╚════════════════════════════════════════════════════════════════════╝

📊 SUMMARY:
├─ Total Issues Found: ${Object.keys(COMMAND_ISSUES).length}
├─ Critical (HIGH): ${Object.values(COMMAND_ISSUES).filter(c => c.severity === 'HIGH').length}
├─ Important (MEDIUM): ${Object.values(COMMAND_ISSUES).filter(c => c.severity === 'MEDIUM').length}
└─ Minor (LOW): ${Object.values(COMMAND_ISSUES).filter(c => c.severity === 'LOW').length}

═══════════════════════════════════════════════════════════════════════

`;

    for (const [file, data] of Object.entries(COMMAND_ISSUES)) {
      const icon = data.severity === 'HIGH' ? '🔴' : data.severity === 'MEDIUM' ? '🟡' : '🟢';
      report += `\n${icon} ${file} [${data.severity}]\n`;
      report += '─'.repeat(70) + '\n';

      for (const issue of data.issues) {
        report += `
  Issue Type: ${issue.type}
  Description: ${issue.description}
  Line: ${issue.line}
  Fix: ${issue.fix}
`;
      }
    }

    return report;
  },

  /**
   * Get specific command fixes
   */
  getCommandFix(commandFile) {
    return FIXES[commandFile] || 'No specific fix available';
  }
};
