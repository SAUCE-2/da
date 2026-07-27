import { useMemo } from "react";

import {
	CodeBlock,
	CodeBlockContent,
	CodeBlockGutter,
	CodeBlockInput,
	CodeBlockLine,
	CodeBlockLineNumber,
} from "@/components/ui/code-block";
import {
	lineToggleState,
	parseSections,
	splitLines,
	toggleLines,
} from "@/features/queries/document";
import { highlightLine } from "@/features/queries/sql-highlight";
import { cn } from "@/lib/utils";

type SqlDocumentEditorProps = {
	value: string;
	disabledLines: number[];
	knownVariables: string[];
	onChange: (value: string) => void;
	onDisabledLinesChange: (disabledLines: number[]) => void;
	readOnly?: boolean;
	className?: string;
};

export function SqlDocumentEditor({
	value,
	disabledLines,
	knownVariables,
	onChange,
	onDisabledLinesChange,
	readOnly = false,
	className,
}: SqlDocumentEditorProps) {
	const lines = useMemo(() => {
		const split = splitLines(value);
		return split.length === 0 ? [""] : split;
	}, [value]);

	const disabled = useMemo(() => new Set(disabledLines), [disabledLines]);
	const known = useMemo(() => new Set(knownVariables), [knownVariables]);
	const sections = useMemo(
		() => (readOnly ? [] : parseSections(value)),
		[readOnly, value],
	);
	const gutterWidthCh = Math.max(2, String(lines.length).length);

	return (
		<CodeBlock className={className}>
			<div className="flex min-h-0 flex-1 overflow-auto">
				<CodeBlockGutter aria-hidden={readOnly} gutterWidthCh={gutterWidthCh}>
					{lines.map((_lineText, index) => {
						const lineNumber = index + 1;
						const section =
							sections.find(
								(candidate) => candidate.startLine === lineNumber,
							) ?? null;
						const state = readOnly
							? disabled.has(lineNumber)
								? "off"
								: "on"
							: lineToggleState(disabled, lineNumber, section);

						return (
							<CodeBlockLineNumber
								key={lineNumber}
								state={state}
								title={
									readOnly
										? undefined
										: state === "off"
											? "Line disabled — click to enable"
											: state === "indeterminate"
												? "Section partially enabled — click to disable all"
												: "Line enabled — click to disable"
								}
								aria-pressed={readOnly ? undefined : state !== "off"}
								onClick={
									readOnly
										? undefined
										: () => {
												onDisabledLinesChange(
													toggleLines(value, disabledLines, lineNumber),
												);
											}
								}
							>
								{lineNumber}
							</CodeBlockLineNumber>
						);
					})}
				</CodeBlockGutter>

				<div className="relative min-w-0 flex-1 py-3">
					<CodeBlockContent
						aria-hidden={!readOnly}
						className={cn(!readOnly && "pointer-events-none")}
					>
						{lines.map((lineText, index) => {
							const lineNumber = index + 1;
							return (
								<CodeBlockLine
									key={lineNumber}
									disabled={disabled.has(lineNumber)}
								>
									{highlightLine(lineText, known)}
								</CodeBlockLine>
							);
						})}
					</CodeBlockContent>
					{readOnly ? null : (
						<CodeBlockInput
							value={value}
							onChange={(event) => onChange(event.target.value)}
							aria-label="Query document"
						/>
					)}
				</div>
			</div>
		</CodeBlock>
	);
}
