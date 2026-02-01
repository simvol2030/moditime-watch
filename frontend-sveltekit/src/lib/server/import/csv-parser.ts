// CSV Parser with RFC 4180 compliance
// Handles: quoted fields, commas inside quotes, unicode, BOM, CRLF/LF

export interface ParseResult {
	rows: Record<string, string>[];
	headers: string[];
	totalLines: number;
}

export function parseCSV(text: string): ParseResult {
	// Remove BOM if present
	if (text.charCodeAt(0) === 0xfeff) {
		text = text.slice(1);
	}

	// Normalize line endings
	text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

	const lines = parseLines(text);

	if (lines.length === 0) {
		return { rows: [], headers: [], totalLines: 0 };
	}

	const headers = lines[0].map((h) => h.trim());
	const rows: Record<string, string>[] = [];

	for (let i = 1; i < lines.length; i++) {
		const fields = lines[i];

		// Skip empty lines
		if (fields.length === 1 && fields[0].trim() === '') continue;

		const row: Record<string, string> = {};
		for (let j = 0; j < headers.length; j++) {
			row[headers[j]] = (fields[j] ?? '').trim();
		}
		rows.push(row);
	}

	return { rows, headers, totalLines: lines.length - 1 };
}

function parseLines(text: string): string[][] {
	const result: string[][] = [];
	let i = 0;

	while (i < text.length) {
		const { fields, nextIndex } = parseLine(text, i);
		result.push(fields);
		i = nextIndex;
	}

	return result;
}

function parseLine(text: string, start: number): { fields: string[]; nextIndex: number } {
	const fields: string[] = [];
	let i = start;

	while (i < text.length) {
		if (text[i] === '"') {
			// Quoted field
			const { value, nextIndex } = parseQuotedField(text, i);
			fields.push(value);
			i = nextIndex;

			// Skip comma or end of line
			if (i < text.length && text[i] === ',') {
				i++;
			} else if (i < text.length && text[i] === '\n') {
				i++;
				break;
			} else {
				break;
			}
		} else if (text[i] === '\n') {
			// End of line — push empty if we just had a comma
			if (fields.length > 0 && i > start && text[i - 1] === ',') {
				fields.push('');
			} else if (fields.length === 0) {
				fields.push('');
			}
			i++;
			break;
		} else {
			// Unquoted field
			const commaIdx = text.indexOf(',', i);
			const nlIdx = text.indexOf('\n', i);

			let end: number;
			let isEol = false;

			if (commaIdx === -1 && nlIdx === -1) {
				end = text.length;
			} else if (commaIdx === -1) {
				end = nlIdx;
				isEol = true;
			} else if (nlIdx === -1) {
				end = commaIdx;
			} else if (commaIdx < nlIdx) {
				end = commaIdx;
			} else {
				end = nlIdx;
				isEol = true;
			}

			fields.push(text.slice(i, end));
			i = end;

			if (isEol) {
				i++; // skip \n
				break;
			} else if (i < text.length && text[i] === ',') {
				i++;
				// If comma is right before newline or end, add empty field
				if (i >= text.length || text[i] === '\n') {
					fields.push('');
					if (i < text.length) i++;
					break;
				}
			} else {
				break;
			}
		}
	}

	return { fields, nextIndex: i };
}

function parseQuotedField(text: string, start: number): { value: string; nextIndex: number } {
	let i = start + 1; // skip opening quote
	let value = '';

	while (i < text.length) {
		if (text[i] === '"') {
			if (i + 1 < text.length && text[i + 1] === '"') {
				// Escaped quote
				value += '"';
				i += 2;
			} else {
				// End of quoted field
				i++; // skip closing quote
				return { value, nextIndex: i };
			}
		} else {
			value += text[i];
			i++;
		}
	}

	// Unterminated quote — return what we have
	return { value, nextIndex: i };
}

// Generate CSV string from data
export function generateCSV(headers: string[], rows: Record<string, string>[]): string {
	const bom = '\ufeff';
	const lines: string[] = [];

	lines.push(headers.map(escapeCSVField).join(','));

	for (const row of rows) {
		const fields = headers.map((h) => escapeCSVField(row[h] ?? ''));
		lines.push(fields.join(','));
	}

	return bom + lines.join('\r\n') + '\r\n';
}

function escapeCSVField(value: string): string {
	if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
		return '"' + value.replace(/"/g, '""') + '"';
	}
	return value;
}
