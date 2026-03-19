const REQUIRED = [
  'MONGO_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRES',
  'JWT_REFRESH_EXPIRES',
  'CLIENT_ORIGIN',
];

export function validateEnv() {
  const missing = REQUIRED.filter(key => !process.env[key]);
  if (missing.length) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach(k => console.error(`   - ${k}`));
    console.error('\nAdd them to your .env file and restart.\n');
    process.exit(1);
  }

  // Warn about weak secrets in production
  if (process.env.NODE_ENV === 'production') {
    const weak = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'].filter(
      k => process.env[k] && process.env[k].length < 32
    );
    if (weak.length) {
      console.error('\n❌ Secrets too short for production (minimum 32 chars):');
      weak.forEach(k => console.error(`   - ${k}`));
      process.exit(1);
    }
  }

  console.log('✅ Environment variables validated');
}
