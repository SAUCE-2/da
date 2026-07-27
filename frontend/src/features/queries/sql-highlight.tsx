import type { ReactNode } from "react";

import { SECTION_LINE } from "@/features/queries/document";
import { cn } from "@/lib/utils";

const VARIABLE_TOKEN = /\{\{([a-zA-Z][a-zA-Z0-9_]*)\}\}/;

function highlightPlainWithVariables(
	text: string,
	known: Set<string> | null,
	keyPrefix: string,
): ReactNode[] {
	const nodes: ReactNode[] = [];
	let remaining = text;
	let key = 0;

	while (remaining.length > 0) {
		const match = remaining.match(VARIABLE_TOKEN);
		if (!match || match.index === undefined) {
			nodes.push(remaining);
			break;
		}

		if (match.index > 0) {
			nodes.push(remaining.slice(0, match.index));
		}

		const name = match[1] ?? "";
		const unknown = known !== null && !known.has(name);
		nodes.push(
			<span
				key={`${keyPrefix}-var-${key++}`}
				className={cn(
					"font-semibold",
					unknown ? "text-(--cm-variable-unknown)" : "text-(--cm-variable)",
				)}
			>
				{match[0]}
			</span>,
		);

		remaining = remaining.slice(match.index + match[0].length);
	}

	return nodes;
}

/** Simple paint for section headers, `--` comments, and `{{variables}}`. */
export function highlightLine(
	line: string,
	known: Set<string> | null,
): ReactNode {
	if (line.length === 0) {
		return "\u00a0";
	}

	const section = SECTION_LINE.exec(line);
	if (section) {
		const [, lead = "", marker = "", gap = "", name = ""] = section;
		return (
			<>
				{lead}
				<span className="font-semibold text-(--cm-section)">{marker}</span>
				{gap}
				<span className="font-semibold text-(--cm-section)">
					{name.length > 0 ? name : "\u00a0"}
				</span>
			</>
		);
	}

	const commentAt = line.indexOf("--");
	if (commentAt >= 0 && !/[`'"]/.test(line.slice(0, commentAt))) {
		const before = line.slice(0, commentAt);
		const comment = line.slice(commentAt);
		return (
			<>
				{before.length > 0
					? highlightPlainWithVariables(before, known, "pre")
					: null}
				<span className="text-muted-foreground">{comment}</span>
			</>
		);
	}

	return highlightPlainWithVariables(line, known, "line");
}
