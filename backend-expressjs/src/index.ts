import 'dotenv/config';
import express from 'express';
import { setupAdmin } from './admin';

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for correct HTTPS detection behind Nginx
app.set('trust proxy', 1);

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
