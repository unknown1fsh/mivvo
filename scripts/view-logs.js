/**
 * Log Viewer Script
 * 
 * Log dosyalarını görüntüleme ve filtreleme scripti.
 * 
 * Özellikler:
 * - Son logları göster
 * - Filtre seçenekleri (level, date, service)
 * - Tail mode (real-time log viewing)
 * - JSON log parsing
 * - Renkli output
 * 
 * Kullanım:
 * ```bash
 * node scripts/view-logs.js
 * node scripts/view-logs.js --tail
 * node scripts/view-logs.js --level error
 * node scripts/view-logs.js --service backend
 * node scripts/view-logs.js --date 2025-10-21
 * ```
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ===== CONFIGURATION =====

const config = {
  logDir: path.join(__dirname, '..', 'backend', 'logs'),
  maxLines: 100,
  refreshInterval: 1000, // 1 saniye
};

// ===== COLORS =====

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// ===== UTILITY FUNCTIONS =====

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getLogLevelColor(level) {
  switch (level?.toLowerCase()) {
    case 'error': return colors.red;
    case 'warn': return colors.yellow;
    case 'info': return colors.green;
    case 'http': return colors.magenta;
    case 'debug': return colors.white;
    default: return colors.reset;
  }
}

function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('tr-TR');
}

function parseLogLine(line) {
  try {
    return JSON.parse(line);
  } catch (error) {
    return { message: line, level: 'info' };
  }
}

function formatLogEntry(entry) {
  const level = entry.level || 'info';
  const timestamp = formatTimestamp(entry.timestamp);
  const message = entry.message || '';
  const context = entry.context ? JSON.stringify(entry.context, null, 2) : '';
  
  const levelColor = getLogLevelColor(level);
  const formattedLevel = `[${level.toUpperCase()}]`;
  
  let output = `${levelColor}${formattedLevel}${colors.reset} ${colors.cyan}${timestamp}${colors.reset}: ${message}`;
  
  if (context) {
    output += `\n${colors.white}${context}${colors.reset}`;
  }
  
  return output;
}

// ===== LOG FILE FUNCTIONS =====

function getLogFiles() {
  if (!fs.existsSync(config.logDir)) {
    return [];
  }
  
  return fs.readdirSync(config.logDir)
    .filter(file => file.endsWith('.log'))
    .map(file => path.join(config.logDir, file))
    .sort((a, b) => {
      const statA = fs.statSync(a);
      const statB = fs.statSync(b);
      return statB.mtime - statA.mtime;
    });
}

function readLogFile(filePath, maxLines = config.maxLines) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    return lines.slice(-maxLines);
  } catch (error) {
    log(`❌ Log dosyası okunamadı: ${filePath}`, 'red');
    return [];
  }
}

function filterLogs(logs, filters) {
  return logs.filter(logEntry => {
    // Level filtresi
    if (filters.level && logEntry.level?.toLowerCase() !== filters.level.toLowerCase()) {
      return false;
    }
    
    // Service filtresi
    if (filters.service) {
      const service = filters.service.toLowerCase();
      if (logEntry.message && !logEntry.message.toLowerCase().includes(service)) {
        return false;
      }
    }
    
    // Date filtresi
    if (filters.date) {
      const logDate = new Date(logEntry.timestamp).toDateString();
      const filterDate = new Date(filters.date).toDateString();
      if (logDate !== filterDate) {
        return false;
      }
    }
    
    // Search filtresi
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const message = logEntry.message?.toLowerCase() || '';
      const context = JSON.stringify(logEntry.context || {}).toLowerCase();
      
      if (!message.includes(searchTerm) && !context.includes(searchTerm)) {
        return false;
      }
    }
    
    return true;
  });
}

// ===== DISPLAY FUNCTIONS =====

function displayLogs(logs, title = 'Log Entries') {
  console.clear();
  log(`\n${colors.bright}${title}${colors.reset}`, 'bright');
  log('='.repeat(50), 'bright');
  
  if (logs.length === 0) {
    log('📝 Log bulunamadı', 'yellow');
    return;
  }
  
  logs.forEach((logEntry, index) => {
    const formatted = formatLogEntry(logEntry);
    log(`\n${index + 1}. ${formatted}`);
  });
  
  log(`\n${colors.bright}Toplam: ${logs.length} log${colors.reset}`, 'bright');
}

function displayHelp() {
  log('\n📖 Log Viewer Yardım', 'bright');
  log('='.repeat(30), 'bright');
  log('Kullanım: node scripts/view-logs.js [seçenekler]', 'cyan');
  log('\nSeçenekler:', 'yellow');
  log('  --tail              Real-time log viewing', 'white');
  log('  --level <level>     Log seviyesi (error, warn, info, http, debug)', 'white');
  log('  --service <name>    Servis adı (backend, frontend, database)', 'white');
  log('  --date <YYYY-MM-DD> Tarih filtresi', 'white');
  log('  --search <term>     Arama terimi', 'white');
  log('  --lines <number>    Gösterilecek satır sayısı (default: 100)', 'white');
  log('  --help              Bu yardımı göster', 'white');
  log('\nÖrnekler:', 'yellow');
  log('  node scripts/view-logs.js --tail', 'white');
  log('  node scripts/view-logs.js --level error', 'white');
  log('  node scripts/view-logs.js --service backend --level warn', 'white');
  log('  node scripts/view-logs.js --date 2025-10-21', 'white');
}

// ===== TAIL MODE =====

function startTailMode(filters = {}) {
  log('🔄 Tail mode başlatıldı. Çıkmak için Ctrl+C', 'cyan');
  
  const logFiles = getLogFiles();
  if (logFiles.length === 0) {
    log('❌ Log dosyası bulunamadı', 'red');
    return;
  }
  
  const watchedFiles = new Map();
  
  logFiles.forEach(filePath => {
    const stats = fs.statSync(filePath);
    watchedFiles.set(filePath, stats.mtime);
  });
  
  function checkForUpdates() {
    logFiles.forEach(filePath => {
      try {
        const stats = fs.statSync(filePath);
        const lastModified = watchedFiles.get(filePath);
        
        if (stats.mtime > lastModified) {
          const newLines = readLogFile(filePath, 10); // Son 10 satır
          const newLogs = newLines
            .map(parseLogLine)
            .filter(logEntry => logEntry.timestamp > lastModified);
          
          newLogs.forEach(logEntry => {
            const filtered = filterLogs([logEntry], filters);
            if (filtered.length > 0) {
              const formatted = formatLogEntry(logEntry);
              log(`\n🆕 ${formatted}`);
            }
          });
          
          watchedFiles.set(filePath, stats.mtime);
        }
      } catch (error) {
        // Dosya silinmiş olabilir
      }
    });
  }
  
  const interval = setInterval(checkForUpdates, config.refreshInterval);
  
  process.on('SIGINT', () => {
    clearInterval(interval);
    log('\n👋 Tail mode durduruldu', 'yellow');
    process.exit(0);
  });
}

// ===== MAIN FUNCTION =====

function main() {
  const args = process.argv.slice(2);
  const filters = {};
  let tailMode = false;
  
  // Argümanları parse et
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
        displayHelp();
        return;
      
      case '--tail':
        tailMode = true;
        break;
      
      case '--level':
        filters.level = args[++i];
        break;
      
      case '--service':
        filters.service = args[++i];
        break;
      
      case '--date':
        filters.date = args[++i];
        break;
      
      case '--search':
        filters.search = args[++i];
        break;
      
      case '--lines':
        config.maxLines = parseInt(args[++i]) || config.maxLines;
        break;
      
      default:
        if (arg.startsWith('--')) {
          log(`❌ Bilinmeyen seçenek: ${arg}`, 'red');
          displayHelp();
          return;
        }
    }
  }
  
  // Log dosyalarını kontrol et
  const logFiles = getLogFiles();
  if (logFiles.length === 0) {
    log('❌ Log dosyası bulunamadı', 'red');
    log(`📁 Log dizini: ${config.logDir}`, 'yellow');
    return;
  }
  
  log(`📁 Log dosyaları bulundu: ${logFiles.length}`, 'green');
  logFiles.forEach(file => {
    const fileName = path.basename(file);
    log(`  - ${fileName}`, 'cyan');
  });
  
  // Tail mode
  if (tailMode) {
    startTailMode(filters);
    return;
  }
  
  // Normal mode - tüm logları oku
  let allLogs = [];
  
  logFiles.forEach(filePath => {
    const lines = readLogFile(filePath, config.maxLines);
    const logs = lines.map(parseLogLine);
    allLogs = allLogs.concat(logs);
  });
  
  // Tarihe göre sırala
  allLogs.sort((a, b) => {
    const timeA = new Date(a.timestamp || 0);
    const timeB = new Date(b.timestamp || 0);
    return timeB - timeA;
  });
  
  // Filtrele
  const filteredLogs = filterLogs(allLogs, filters);
  
  // Göster
  const title = Object.keys(filters).length > 0 
    ? `Filtrelenmiş Log Entries (${Object.keys(filters).join(', ')})`
    : 'Tüm Log Entries';
  
  displayLogs(filteredLogs, title);
  
  // İstatistikler
  log('\n📊 İstatistikler:', 'bright');
  const levelCounts = {};
  allLogs.forEach(log => {
    const level = log.level || 'info';
    levelCounts[level] = (levelCounts[level] || 0) + 1;
  });
  
  Object.entries(levelCounts).forEach(([level, count]) => {
    const color = getLogLevelColor(level);
    log(`  ${color}[${level.toUpperCase()}]${colors.reset}: ${count}`, 'white');
  });
}

// ===== START =====

if (require.main === module) {
  main();
}

module.exports = {
  getLogFiles,
  readLogFile,
  filterLogs,
  displayLogs,
  startTailMode,
};
