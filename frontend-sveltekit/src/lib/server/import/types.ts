export interface ImportError {
	row: number;
	field: string;
	message: string;
}

export interface ImportResult {
	added: number;
	updated: number;
	errors: ImportError[];
}
