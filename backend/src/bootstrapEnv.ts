/**
 * Environment bootstrapper
 *
 * .env dosyasının tüm backend modüllerinden önce yüklenmesini sağlar.
 * Bu sayede controller/servis modülleri import edildiğinde environment
 * değişkenleri hazır olur ve Prisma client yanlışlıkla undefined almaz.
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Test ortamlarında setup dosyası kendisi yüklediği için burada atla
if (process.env.NODE_ENV !== 'test') {
  const envPath = path.resolve(__dirname, '../.env');
  console.log('[bootstrapEnv] envPath=', envPath, 'exists=', fs.existsSync(envPath));
  const result = dotenv.config({ path: envPath });
  console.log('[bootstrapEnv] dotenv result:', {
    error: result.error ? (result.error as NodeJS.ErrnoException).code : null,
    parsedKeys: result.parsed ? Object.keys(result.parsed) : [],
  });

  const dbUrlLoaded = Boolean(process.env.DATABASE_URL || result.parsed?.DATABASE_URL);

  if (dbUrlLoaded) {
    console.log('[bootstrapEnv] DATABASE_URL yüklendi ve hazır');
  } else if (result.error && (result.error as NodeJS.ErrnoException).code !== 'ENOENT') {
    console.warn('[bootstrapEnv] .env yüklemesi beklenmedik şekilde başarısız oldu:', result.error);
  } else {
    console.warn('[bootstrapEnv] DATABASE_URL hala tanımlı değil. .env dosyasını kontrol et.');
  }
}

