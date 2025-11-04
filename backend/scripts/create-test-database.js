/**
 * Test Database Creation Script
 * 
 * PostgreSQL'de test veritabanını oluşturur
 */

const { Client } = require('pg');
const readline = require('readline');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// .env dosyasından DATABASE_URL'yi parse et
function getDbConfigFromEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  let dbUrl = process.env.DATABASE_URL;
  
  // .env dosyasını oku
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const dbUrlMatch = envContent.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
    if (dbUrlMatch) {
      dbUrl = dbUrlMatch[1];
    }
  }
  
  if (dbUrl) {
    // postgresql://user:password@host:port/database formatını parse et
    const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (match) {
      return {
        user: match[1],
        password: match[2],
        host: match[3],
        port: parseInt(match[4]),
        database: match[5]
      };
    }
  }
  
  return null;
}

async function createTestDatabase() {
  console.log('🧪 Test Veritabanı Oluşturma');
  console.log('============================\n');

  // Önce .env'den config'i al
  const envConfig = getDbConfigFromEnv();
  
  // Database bilgilerini al
  const host = process.env.DB_HOST || envConfig?.host || 'localhost';
  const port = process.env.DB_PORT || envConfig?.port || 5432;
  const user = process.env.DB_USER || envConfig?.user || 'postgres';
  let password = process.env.DB_PASSWORD || envConfig?.password;
  
  if (!password) {
    password = await askQuestion(`PostgreSQL şifresi (${user}): `);
  }
  
  const databaseName = 'mivvo_expertiz_test';

  console.log(`\n📊 Bağlantı Bilgileri:`);
  console.log(`   Host: ${host}`);
  console.log(`   Port: ${port}`);
  console.log(`   User: ${user}`);
  console.log(`   Database: ${databaseName}`);

  // Postgres (default) veritabanına bağlan
  const adminClient = new Client({
    host,
    port,
    user,
    password,
    database: 'postgres', // Default database
  });

  try {
    console.log('\n🔌 PostgreSQL\'e bağlanılıyor...');
    await adminClient.connect();
    console.log('✅ Bağlantı başarılı!');

    // Veritabanının var olup olmadığını kontrol et
    const checkResult = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [databaseName]
    );

    if (checkResult.rows.length > 0) {
      console.log(`\n⚠️  Veritabanı '${databaseName}' zaten mevcut.`);
      const recreate = await askQuestion('Yeniden oluşturmak ister misiniz? (y/N): ');
      
      if (recreate.toLowerCase() === 'y') {
        console.log(`\n🗑️  Eski veritabanı siliniyor...`);
        // Aktif bağlantıları kes
        await adminClient.query(
          `SELECT pg_terminate_backend(pg_stat_activity.pid)
           FROM pg_stat_activity
           WHERE pg_stat_activity.datname = $1
           AND pid <> pg_backend_pid()`,
          [databaseName]
        );
        await adminClient.query(`DROP DATABASE ${databaseName}`);
        console.log('✅ Eski veritabanı silindi');
      } else {
        console.log('✅ Mevcut veritabanı kullanılacak');
        await adminClient.end();
        return;
      }
    }

    // Veritabanını oluştur
    console.log(`\n📦 Veritabanı '${databaseName}' oluşturuluyor...`);
    await adminClient.query(`CREATE DATABASE ${databaseName}`);
    console.log(`✅ Veritabanı '${databaseName}' başarıyla oluşturuldu!`);

    await adminClient.end();

    // Test veritabanına bağlan ve basit bir test yap
    const testClient = new Client({
      host,
      port,
      user,
      password,
      database: databaseName,
    });

    console.log(`\n🔍 Test veritabanı bağlantısı test ediliyor...`);
    await testClient.connect();
    const result = await testClient.query('SELECT NOW()');
    console.log(`✅ Test veritabanı çalışıyor! (${result.rows[0].now})`);
    await testClient.end();

    console.log('\n✅ Test veritabanı kurulumu tamamlandı!');
    console.log('\n📝 Sonraki adımlar:');
    console.log('   1. .env.test dosyasını oluşturun (veya .env.test.example\'ı kopyalayın)');
    console.log('   2. DATABASE_URL\'yi güncelleyin:');
    console.log(`      DATABASE_URL="postgresql://${user}:${password}@${host}:${port}/${databaseName}"`);
    console.log('   3. npm run test:setup komutunu çalıştırın');
    console.log('   4. npm test komutunu çalıştırın\n');

  } catch (error) {
    console.error('\n❌ Hata:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.error('\n💡 Çözüm:');
      console.error('   PostgreSQL kullanıcı adı veya şifresi yanlış.');
      console.error('   Lütfen doğru bilgileri girin veya .env dosyasında DB_PASSWORD\'u ayarlayın.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Çözüm:');
      console.error('   PostgreSQL sunucusu çalışmıyor veya erişilemiyor.');
      console.error('   PostgreSQL servisinin başlatıldığından emin olun.');
    } else if (error.message.includes('permission denied')) {
      console.error('\n💡 Çözüm:');
      console.error('   Veritabanı oluşturma yetkisi yok.');
      console.error('   PostgreSQL superuser (postgres) ile bağlanmayı deneyin.');
    }
    
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Script'i çalıştır
createTestDatabase();

