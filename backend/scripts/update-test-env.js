/**
 * .env.test dosyasını .env'den günceller
 */

const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
const testEnvPath = path.resolve(__dirname, '../.env.test');
const testEnvExamplePath = path.resolve(__dirname, '../.env.test.example');

// .env dosyasını oku
if (!fs.existsSync(envPath)) {
  console.error('❌ .env dosyası bulunamadı!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);

if (!dbUrlMatch) {
  console.error('❌ .env dosyasında DATABASE_URL bulunamadı!');
  process.exit(1);
}

const dbUrl = dbUrlMatch[1];
// Database adını değiştir
const testDbUrl = dbUrl.replace(/\/[^/]+$/, '/mivvo_expertiz_test');

console.log('📝 .env.test dosyası güncelleniyor...');

// .env.test.example'ı oku veya oluştur
let testEnvContent;
if (fs.existsSync(testEnvExamplePath)) {
  testEnvContent = fs.readFileSync(testEnvExamplePath, 'utf8');
} else {
  // Varsayılan içerik
  testEnvContent = `NODE_ENV=test
PORT=3001
DATABASE_URL=""
TEST_DATABASE_URL=""
JWT_SECRET=test-jwt-secret-key-for-testing-only-do-not-use-in-production
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=test-key
GEMINI_API_KEY=test-key
SMTP_HOST=smtp.test.com
SMTP_PORT=587
SMTP_USER=test@test.com
SMTP_PASS=test-password
FROM_EMAIL=test@mivvo.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
LOG_LEVEL=error
BCRYPT_ROUNDS=10
`;
}

// DATABASE_URL'yi güncelle
testEnvContent = testEnvContent.replace(
  /DATABASE_URL=["']?[^"'\n]*["']?/g,
  `DATABASE_URL="${testDbUrl}"`
);
testEnvContent = testEnvContent.replace(
  /TEST_DATABASE_URL=["']?[^"'\n]*["']?/g,
  `TEST_DATABASE_URL="${testDbUrl}"`
);

// .env.test dosyasını yaz
fs.writeFileSync(testEnvPath, testEnvContent, 'utf8');

console.log(`✅ .env.test dosyası güncellendi!`);
console.log(`   DATABASE_URL: ${testDbUrl.replace(/:[^:@]+@/, ':****@')}`);

