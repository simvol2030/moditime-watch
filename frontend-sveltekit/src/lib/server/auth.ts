import bcrypt from 'bcrypt';
import { db } from './db/database';

export interface AdminUser {
	id: number;
	email: string;
	name: string;
	role: 'super-admin' | 'editor' | 'viewer';
}

interface AdminRecord {
	id: number;
	email: string;
	password: string;
	name: string;
	role: string;
}

/**
 * Verify admin credentials
 * Returns admin user object if valid, null otherwise
 */
export async function verifyAdmin(email: string, password: string): Promise<AdminUser | null> {
	const stmt = db.prepare('SELECT * FROM admins WHERE email = ?');
	const admin = stmt.get(email) as AdminRecord | undefined;

	if (!admin) {
		return null;
	}

	// Check if password is bcrypt hash or plain text (for migration)
	let isValid = false;
	if (admin.password.startsWith('$2')) {
		// bcrypt hash
		isValid = await bcrypt.compare(password, admin.password);
	} else {
		// Plain text (legacy) - compare directly and migrate
		isValid = admin.password === password;
		if (isValid) {
			// Migrate to bcrypt hash
			const hash = await hashPassword(password);
			db.prepare('UPDATE admins SET password = ? WHERE id = ?').run(hash, admin.id);
			console.log(`Migrated password for admin: ${admin.email}`);
		}
	}

	if (!isValid) {
		return null;
	}

	return {
		id: admin.id,
		email: admin.email,
		name: admin.name,
		role: admin.role as AdminUser['role']
	};
}

/**
 * Hash a password using bcrypt
 */
export function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 10);
}

/**
 * Create session data for admin
 */
export function createSession(admin: AdminUser): string {
	// Simple base64 encoding for MVP - use proper encryption in production
	return Buffer.from(JSON.stringify(admin)).toString('base64');
}

/**
 * Parse session data
 */
export function parseSession(session: string): AdminUser | null {
	try {
		const decoded = Buffer.from(session, 'base64').toString('utf-8');
		return JSON.parse(decoded) as AdminUser;
	} catch {
		return null;
	}
}

/**
 * Permission helpers
 */
export function canModify(role: string): boolean {
	return ['super-admin', 'editor'].includes(role);
}

export function canDelete(role: string): boolean {
	return role === 'super-admin';
}

export function isSuperAdmin(role: string): boolean {
	return role === 'super-admin';
}
