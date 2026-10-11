import dotenv from 'dotenv';
import app from './src/app.js';
import { assertDbConnection } from './src/db/pool.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function start() {
  // DB is only needed for auth/history (layered features). We warn but still
  // boot so the core AI spine works even before MySQL is configured.
  try {
    await assertDbConnection();
  } catch (err) {
    console.warn('⚠️  MySQL not connected yet:', err.message);
    console.warn('   The AI recommendation spine still works. Configure .env + run `npm run db:init` for auth/history.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 FutureMe API running at http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
  });
}

start();
