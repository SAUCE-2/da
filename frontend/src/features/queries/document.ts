export type SectionOutline = {
	name: string;
	level: number;
	startLine: number;
	endLine: number;
};

/** Captures lead whitespace, `--###` marker, gap, and name for section headers. */
export const SECTION_LINE = /^(\s*)(--#{1,6})(\s*)(.*)$/;

function normalizeNewlines(text: string): string {
	return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function splitLines(text: string): string[] {
	const normalized = normalizeNewlines(text);
	if (normalized.length === 0) {
		return [];
	}
	return normalized.split("\n");
}

function isSectionHeader(line: string): boolean {
	return SECTION_LINE.test(line);
}

function parseSectionHeader(
	line: string,
): { level: number; name: string } | null {
	const match = SECTION_LINE.exec(line);
	if (!match) {
		return null;
	}
	const marker = match[2] ?? "";
	const hashes = marker.slice(2); // drop leading `--`
	return {
		level: hashes.length,
		name: (match[4] ?? "").trim() || "Section",
	};
}

export function parseSections(body: string): SectionOutline[] {
	const lines = splitLines(body);
	const headers: { name: string; level: number; line: number }[] = [];

	for (let i = 0; i < lines.length; i++) {
		const header = parseSectionHeader(lines[i] ?? "");
		if (header) {
			headers.push({ ...header, line: i + 1 });
		}
	}

	return headers.map((header, index) => {
		let endLine = lines.length;
		for (let j = index + 1; j < headers.length; j++) {
			const next = headers[j];
			if (next && next.level <= header.level) {
				endLine = next.line - 1;
				break;
			}
		}
		return {
			name: header.name,
			level: header.level,
			startLine: header.line,
			endLine,
		};
	});
}

function sectionForHeaderLine(
	body: string,
	lineNumber: number,
): SectionOutline | null {
	return (
		parseSections(body).find((section) => section.startLine === lineNumber) ??
		null
	);
}

export function renderBody(body: string, disabledLines: number[]): string {
	const lines = splitLines(body);
	const disabled = new Set(disabledLines);
	const kept: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const lineNumber = i + 1;
		if (disabled.has(lineNumber)) {
			continue;
		}
		const line = lines[i] ?? "";
		if (isSectionHeader(line)) {
			continue;
		}
		kept.push(line);
	}

	return trimFragmentBoundaries(kept.join("\n"));
}

function trimFragmentBoundaries(sql: string): string {
	return sql
		.replace(/\r\n/g, "\n")
		.replace(/\r/g, "\n")
		.replace(/^(?:[\t ]*\n)+/, "")
		.replace(/\n[\t \n]*$/, "");
}

export type LineToggleState = "on" | "off" | "indeterminate";

export function lineToggleState(
	disabledLines: Set<number>,
	lineNumber: number,
	section: SectionOutline | null,
): LineToggleState {
	if (!section || section.startLine !== lineNumber) {
		return disabledLines.has(lineNumber) ? "off" : "on";
	}

	let onCount = 0;
	let offCount = 0;
	for (let line = section.startLine; line <= section.endLine; line++) {
		if (disabledLines.has(line)) {
			offCount++;
		} else {
			onCount++;
		}
	}

	if (offCount === 0) {
		return "on";
	}
	if (onCount === 0) {
		return "off";
	}
	return "indeterminate";
}

/** Toggle a normal line, or the whole section range when clicking a header. */
export function toggleLines(
	body: string,
	disabledLines: number[],
	lineNumber: number,
): number[] {
	const disabled = new Set(disabledLines);
	const section = sectionForHeaderLine(body, lineNumber);

	if (!section) {
		if (disabled.has(lineNumber)) {
			disabled.delete(lineNumber);
		} else {
			disabled.add(lineNumber);
		}
		return [...disabled].sort((a, b) => a - b);
	}

	const headerState = lineToggleState(disabled, lineNumber, section);
	const turnOff = headerState === "on" || headerState === "indeterminate";

	for (let line = section.startLine; line <= section.endLine; line++) {
		if (turnOff) {
			disabled.add(line);
		} else {
			disabled.delete(line);
		}
	}

	return [...disabled].sort((a, b) => a - b);
}

const VARIABLE_PATTERN = /\{\{([a-zA-Z][a-zA-Z0-9_]*)\}\}/g;

export function substitutePreviewVariables(
	sql: string,
	values: Record<string, string>,
): string {
	return sql.replace(VARIABLE_PATTERN, (_match, name: string) => {
		const value = values[name];
		if (value === undefined || value === "") {
			return `{{${name}}}`;
		}
		return value;
	});
}
