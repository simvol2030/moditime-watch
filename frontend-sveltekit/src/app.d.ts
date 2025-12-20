// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			csrfToken?: string;
			/** City slug when accessed via subdomain (e.g., "moscow" for moscow.moditimewatch.ru) */
			citySlug?: string;
			/** True if page is accessed via city subdomain */
			isSubdomain?: boolean;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
