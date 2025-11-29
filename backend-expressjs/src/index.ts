import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { setupAdmin } from './admin';

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for correct HTTPS detection behind Nginx
app.set('trust proxy', 1);

// ============================================
// RATE LIMITING
// ============================================

// General API rate limiter: 100 requests per minute per IP
const generalLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: 'Too many requests, please try again later' },
	skip: (req) => req.path.startsWith('/admin/frontend-assets') // Skip static assets
});

// Stricter rate limiter for authentication: 5 attempts per 15 minutes
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: 'Too many login attempts, please try again after 15 minutes' },
	skipSuccessfulRequests: true // Only count failed attempts
});

// Apply rate limiting
app.use(generalLimiter);
app.use('/admin/login', authLimiter);

// Basic API route (before AdminJS middleware)
app.get('/', (req, res) => {
	res.json({
		message: 'Project Box Backend API',
		endpoints: {
			admin: '/admin',
			api: '/api'
		}
	});
});

// Setup and start server
async function start() {
	try {
		// Setup AdminJS
		const { admin, adminRouter } = await setupAdmin();

		// Mount AdminJS router - it has its own body parsing middleware
		app.use(admin.options.rootPath, adminRouter);

		// Body parsing middleware for your own API routes (after AdminJS)
		app.use(express.json());
		app.use(express.urlencoded({ extended: true }));

		// Start server
		app.listen(PORT, () => {
			console.log(`\n✅ Server running on http://localhost:${PORT}`);
			console.log(`✅ AdminJS available at http://localhost:${PORT}/admin\n`);
		});
	} catch (error) {
		console.error('Failed to start server:', error);
		process.exit(1);
	}
}

start();
