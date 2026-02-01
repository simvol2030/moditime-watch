import bcrypt from 'bcrypt';
import { queries } from './db/database';

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
 */
export async function verifyAdmin(email: string, password: string): Promise<AdminUser | null> {
	const admin = queries.getAdminByEmail.get(email) as AdminRecord | undefined;
	if (!admin) return null;

	// Check if password is already hashed (bcrypt hashes start with $2)
	const isHashed = admin.password.startsWith('$2');

	let valid: boolean;
	if (isHashed) {
		valid = await bcrypt.compare(password, admin.password);
	} else {
		// Plain text comparison for legacy passwords (will be migrated)
		valid = admin.password === password;
	}

	if (!valid) return null;

	return {
		id: admin.id,
		email: admin.email,
		name: admin.name,
		role: admin.role as AdminUser['role']
	};
}

/**
 * Hash a password with bcrypt
 */
export function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 10);
}

/**
 * Check if user can modify resources
 */
export function canModify(role: string): boolean {
	return ['super-admin', 'editor'].includes(role);
}

/**
 * Check if user can delete resources
 */
export function canDelete(role: string): boolean {
	return role === 'super-admin';
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(role: string): boolean {
	return role === 'super-admin';
}

/**
 * Encode session data (simple base64 for MVP, use proper encryption in production)
 */
export function encodeSession(admin: AdminUser): string {
	return Buffer.from(JSON.stringify(admin)).toString('base64');
}

/**
 * Decode session data
 */
export function decodeSession(sessionData: string): AdminUser | null {
	try {
		return JSON.parse(Buffer.from(sessionData, 'base64').toString('utf-8'));
	} catch {
		return null;
	}
}
