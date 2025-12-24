module.exports = {
  apps: [{
    name: 'moditime-backend',
    script: 'dist/index.js',
    cwd: '/opt/websites/moditime-watch.ru/repo/backend-expressjs',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: '3000',
      ADMIN_EMAIL: 'admin@moditime-watch.ru',
      ADMIN_PASSWORD: 'ModitimeAdmin2024!SecurePass',
      COOKIE_SECRET: 'moditime-backend-cookie-secret-key-change-in-production-v1',
      SESSION_SECRET: 'moditime-backend-session-secret-key-change-in-production-v1'
    }
  }]
};
