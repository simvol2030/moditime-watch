module.exports = {
	apps: [
		{
			name: 'moditime-watch',
			script: 'build/index.js',
			cwd: './frontend-sveltekit',
			env: {
				NODE_ENV: 'production',
				PORT: 4173,
				BODY_SIZE_LIMIT: '52428800' // 50MB for ZIP uploads
			}
		}
	]
};
