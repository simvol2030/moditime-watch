// UI state management using Svelte 5 runes

// Mobile menu state
let isMobileMenuOpen = $state(false);

export function toggleMobileMenu() {
	isMobileMenuOpen = !isMobileMenuOpen;

	// Prevent body scroll when menu is open
	if (typeof document !== 'undefined') {
		if (isMobileMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
	}
}

export function closeMobileMenu() {
	isMobileMenuOpen = false;
	if (typeof document !== 'undefined') {
		document.body.style.overflow = '';
	}
}

export function getMobileMenuState() {
	return isMobileMenuOpen;
}

// Theme management
let currentTheme = $state<'light' | 'dark'>('light');

export function toggleTheme() {
	const newTheme = currentTheme === 'light' ? 'dark' : 'light';
	currentTheme = newTheme;

	if (typeof document !== 'undefined') {
		document.body.setAttribute('data-theme', newTheme);
		// Save to localStorage
		localStorage.setItem('theme', newTheme);
	}
}

export function initializeTheme() {
	if (typeof document !== 'undefined') {
		// Check localStorage or system preference
		const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
		const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

		const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
		currentTheme = theme;
		document.body.setAttribute('data-theme', theme);
	}
}

export function getTheme() {
	return currentTheme;
}
