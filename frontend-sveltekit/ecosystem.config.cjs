module.exports = {
  apps: [{
    name: 'moditime-watch',
    script: 'build/index.js',
    cwd: '/opt/websites/moditime-watch.ru/repo/frontend-sveltekit',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: '4173',
      HOST: '0.0.0.0',
      // Use request headers for URL construction (required for subdomains)
      PROTOCOL_HEADER: 'x-forwarded-proto',
      HOST_HEADER: 'host',
      DATABASE_URL: '/opt/websites/moditime-watch.ru/repo/data/db/sqlite/app.db',
      SESSION_SECRET: 'moditime-super-secret-key-change-me-in-production-32chars',
      PUBLIC_GTM_ID: '',
      PUBLIC_GA_ID: '',
      PUBLIC_YM_ID: ''
    }
  }]
};
