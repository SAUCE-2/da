import { CheckIcon, CopyIcon } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	isSectionHeader,
	lineToggleState,
	parseSections,
	splitLines,
} from "@/features/queries/editor/query-document";
import { cn } from "@/lib/utils";

type CodeBlockProps = {
	value: string;
	className?: string;
	readOnly?: boolean;
	showCopy?: boolean;
	onChange?: (value: string) => void;
	disabledLines?: number[];
	onToggleLine?: (lineNumber: number) => void;
	knownVariables?: string[];
};

const monoStyle = {
	fontFamily:
		'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
	fontSize: "0.875rem",
	lineHeight: "1.55",
} as const;

const SECTION_LINE = /^(\s*)(--#{1,6})(\s*)(.*)$/;
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
					unknown
						? "text-(--cm-variable-unknown)"
						: "text-(--cm-variable)",
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
function highlightLine(line: string, known: Set<string> | null): ReactNode {
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
	if (
		commentAt >= 0 &&
		!/[`'"]/.test(line.slice(0, commentAt))
	) {
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

function CodeBlock({
	value,
	className,
	readOnly = true,
	showCopy = false,
	onChange,
	disabledLines = [],
	onToggleLine,
	knownVariables,
}: CodeBlockProps) {
	const [copied, setCopied] = useState(false);

	const lines = useMemo(() => {
		const split = splitLines(value);
		return split.length === 0 ? [""] : split;
	}, [value]);

	const disabled = useMemo(() => new Set(disabledLines), [disabledLines]);
	const known = useMemo(
		() => (knownVariables ? new Set(knownVariables) : null),
		[knownVariables],
	);
	const sections = useMemo(
		() => (onToggleLine ? parseSections(value) : []),
		[onToggleLine, value],
	);

	const gutterWidthCh = Math.max(2, String(lines.length).length);

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1500);
		} catch {
			// Clipboard may be unavailable; ignore.
		}
	}

	const contentLines = (
		<pre
			aria-hidden={!readOnly}
			className={cn(
				"m-0 overflow-visible bg-transparent px-3 whitespace-pre",
				!readOnly && "pointer-events-none",
			)}
			style={monoStyle}
		>
			{lines.map((lineText, index) => {
				const lineNumber = index + 1;
				const isOff = disabled.has(lineNumber);
				return (
					<div
						key={lineNumber}
						className={cn(
							"min-h-[1.35625rem]",
							isOff &&
								"text-muted-foreground/50 line-through opacity-45 **:text-inherit",
						)}
					>
						{highlightLine(lineText, known)}
					</div>
				);
			})}
		</pre>
	);

	return (
		<div
			className={cn(
				"relative flex min-h-70 flex-col overflow-hidden rounded-md border bg-background text-foreground",
				className,
			)}
		>
			{showCopy ? (
				<Button
					type="button"
					variant="ghost"
					size="icon-xs"
					className="absolute top-2 right-2 z-10"
					onClick={handleCopy}
					aria-label={copied ? "Copied" : "Copy"}
				>
					{copied ? <CheckIcon /> : <CopyIcon />}
				</Button>
			) : null}

			<div className="flex min-h-0 flex-1 overflow-auto">
				<div
					aria-hidden={!onToggleLine}
					className="sticky left-0 z-1 flex shrink-0 flex-col border-r border-border bg-background py-3 select-none"
					style={{
						...monoStyle,
						minWidth: `calc(${gutterWidthCh}ch + 1.5rem)`,
					}}
				>
					{lines.map((lineText, index) => {
						const lineNumber = index + 1;
						const section =
							sections.find((candidate) => candidate.startLine === lineNumber) ??
							null;
						const state = onToggleLine
							? lineToggleState(disabled, lineNumber, section)
							: disabled.has(lineNumber)
								? "off"
								: "on";
						const header = isSectionHeader(lineText);
						const clickable = Boolean(onToggleLine);

						const lineClassName = cn(
							"flex h-[1.35625rem] items-center justify-end pr-3 pl-2 tabular-nums",
							state === "off" && "text-muted-foreground/40",
							state === "indeterminate" && "text-muted-foreground",
							state === "on" && "text-muted-foreground",
							header && state !== "off" && "font-semibold text-foreground/80",
							clickable &&
								"cursor-pointer hover:bg-muted hover:text-foreground",
						);

						if (clickable) {
							return (
								<button
									key={lineNumber}
									type="button"
									className={lineClassName}
									title={
										state === "off"
											? "Line disabled — click to enable"
											: state === "indeterminate"
												? "Section partially enabled — click to disable all"
												: "Line enabled — click to disable"
									}
									aria-pressed={state !== "off"}
									onClick={() => onToggleLine?.(lineNumber)}
								>
									{lineNumber}
								</button>
							);
						}

						return (
							<span key={lineNumber} className={lineClassName}>
								{lineNumber}
							</span>
						);
					})}
				</div>

				<div className="relative min-w-0 flex-1 py-3">
					{contentLines}
					{readOnly ? null : (
						<textarea
							value={value}
							onChange={(event) => onChange?.(event.target.value)}
							spellCheck={false}
							wrap="off"
							className="absolute inset-0 size-full resize-none border-0 bg-transparent px-3 py-3 text-transparent caret-foreground outline-none selection:bg-primary/30"
							style={{
								...monoStyle,
								whiteSpace: "pre",
								overflow: "hidden",
							}}
							aria-label="Query document"
						/>
					)}
				</div>
			</div>
		</div>
	);
}

export { CodeBlock };
