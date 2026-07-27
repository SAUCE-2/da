import { useMemo } from "react";

import {
	CodeBlock,
	CodeBlockContent,
	CodeBlockCopyButton,
	CodeBlockGutter,
	CodeBlockLine,
	CodeBlockLineNumber,
} from "@/components/ui/code-block";
import { splitLines } from "@/features/queries/document";
import { highlightLine } from "@/features/queries/sql-highlight";
import { cn } from "@/lib/utils";

type FormattedSqlDisplayProps = {
	sql: string;
	emptyMessage?: string;
	className?: string;
};

/** Displays backend-rendered SQL as-is (no layout formatting). */
export function FormattedSqlDisplay({
	sql,
	emptyMessage = "-- No SQL to display.",
	className,
}: FormattedSqlDisplayProps) {
	const value = sql.trim() ? sql : emptyMessage;
	const showCopy = Boolean(sql.trim());

	const lines = useMemo(() => {
		const split = splitLines(value);
		return split.length === 0 ? [""] : split;
	}, [value]);

	const gutterWidthCh = Math.max(2, String(lines.length).length);

	return (
		<CodeBlock className={cn("max-h-105 min-h-0", className)}>
			{showCopy ? <CodeBlockCopyButton value={value} /> : null}
			<div className="flex min-h-0 flex-1 overflow-auto">
				<CodeBlockGutter aria-hidden gutterWidthCh={gutterWidthCh}>
					{lines.map((_, index) => {
						const lineNumber = index + 1;
						return (
							<CodeBlockLineNumber key={lineNumber} state="on">
								{lineNumber}
							</CodeBlockLineNumber>
						);
					})}
				</CodeBlockGutter>

				<div className="relative min-w-0 flex-1 py-3">
					<CodeBlockContent>
						{lines.map((lineText, index) => {
							const lineNumber = index + 1;
							return (
								<CodeBlockLine key={lineNumber}>
									{highlightLine(lineText, null)}
								</CodeBlockLine>
							);
						})}
					</CodeBlockContent>
				</div>
			</div>
		</CodeBlock>
	);
}
