module.exports = {
	apps: [
		{
			name: 'moditime-watch',
			script: 'build/index.js',
			cwd: './frontend-sveltekit',
			env: {
				PORT: 4173,
				BODY_SIZE_LIMIT: '52428800' // 50MB for ZIP uploads
				// NOTE: NODE_ENV=production not set — CSRF hook doesn't support multipart/form-data yet
			}
		}
	]
};
