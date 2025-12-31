import 'dotenv/config';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for correct HTTPS detection behind Nginx
app.set('trust proxy', 1);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check / API info
app.get('/', (req, res) => {
	res.json({
		status: 'ok',
		service: 'moditime-backend',
		version: '1.0.0',
		message: 'Backend API is running. Admin panel moved to SvelteKit at /admin'
	});
});

// API routes placeholder (for future use)
// app.use('/api', apiRouter);

// Start server
app.listen(PORT, () => {
	console.log(`\n✅ Backend API running on http://localhost:${PORT}`);
	console.log(`   Admin panel is now at SvelteKit frontend: /admin\n`);
});
