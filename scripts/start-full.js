// Railway start script - starts both backend and frontend
const { spawn, execSync } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 3001;
const BACKEND_PORT = PORT;
const FRONTEND_PORT = parseInt(PORT) + 1;

console.log(`🚀 Starting services...`);
console.log(`   Backend: ${BACKEND_PORT}`);
console.log(`   Frontend: ${FRONTEND_PORT}`);

// Run migrations first
console.log(`📦 Running database migrations...`);
try {
  execSync('npx prisma migrate deploy', {
    cwd: path.join(__dirname, '../backend'),
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  console.log(`✅ Migrations completed`);
} catch (error) {
  console.error(`❌ Migration failed:`, error.message);
  process.exit(1);
}

// Start backend
const backend = spawn('npm', ['run', 'start'], {
  cwd: path.join(__dirname, '../backend'),
  env: { ...process.env, PORT: BACKEND_PORT.toString(), NODE_ENV: 'production' },
  stdio: 'inherit',
  shell: true
});

// Start frontend
const frontend = spawn('npm', ['run', 'start'], {
  cwd: path.join(__dirname, '../frontend'),
  env: { ...process.env, PORT: FRONTEND_PORT.toString(), NODE_ENV: 'production' },
  stdio: 'inherit',
  shell: true
});

// Handle process exit
process.on('SIGINT', () => {
  console.log(`\n🛑 Shutting down services...`);
  backend.kill();
  frontend.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  console.log(`\n🛑 Shutting down services...`);
  backend.kill();
  frontend.kill();
  process.exit();
});

backend.on('exit', (code) => {
  console.error(`❌ Backend exited with code ${code}`);
  frontend.kill();
  process.exit(code);
});

frontend.on('exit', (code) => {
  console.error(`❌ Frontend exited with code ${code}`);
  backend.kill();
  process.exit(code);
});

console.log(`✅ Both services started successfully`);


