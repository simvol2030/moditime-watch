import 'dotenv/config';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for correct HTTPS detection behind Nginx
app.set('trust proxy', 1);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
	res.json({
		status: 'ok',
		service: 'moditime-backend',
		version: '2.0.0',
		message: 'Admin panel moved to SvelteKit. Use /admin on main site.'
	});
});

// API routes placeholder for future use
app.get('/api/health', (req, res) => {
	res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
	console.log(`\n✅ Backend API running on http://localhost:${PORT}`);
	console.log(`ℹ️  Admin panel is now part of SvelteKit frontend\n`);
});
