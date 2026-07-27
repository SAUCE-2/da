import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import {
	CodeBlock,
	CodeBlockContent,
	CodeBlockCopyButton,
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

export const Route = createFileRoute("/dev/code-block")({
	component: CodeBlockPlayground,
	staticData: {
		nav: {
			hidden: true,
		},
	},
});

const SAMPLE = `--# Active users
SELECT id, name, {{status}}
FROM users
WHERE active = 1

--## Optional filters
AND created_at > {{since}}
AND region = {{region}}
`;

function CodeBlockPlayground() {
	const [value, setValue] = useState(SAMPLE);
	const [disabledLines, setDisabledLines] = useState<number[]>([]);
	const [readOnly, setReadOnly] = useState(false);
	const [showCopy, setShowCopy] = useState(true);
	const [enableToggle, setEnableToggle] = useState(true);
	const [knownVariables, setKnownVariables] = useState("status, since, region");

	const known = knownVariables
		.split(",")
		.map((part) => part.trim())
		.filter(Boolean);

	const lines = useMemo(() => {
		const split = splitLines(value);
		return split.length === 0 ? [""] : split;
	}, [value]);

	const disabled = useMemo(() => new Set(disabledLines), [disabledLines]);
	const knownSet = useMemo(() => new Set(known), [known]);
	const sections = useMemo(
		() => (enableToggle ? parseSections(value) : []),
		[enableToggle, value],
	);
	const gutterWidthCh = Math.max(2, String(lines.length).length);

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
			<header className="flex flex-col gap-1">
				<h1 className="text-xl font-semibold tracking-tight">
					CodeBlock playground
				</h1>
				<p className="text-sm text-muted-foreground">
					Local-only scratch pad — not linked in the sidebar. Open{" "}
					<code className="bg-muted px-1 py-0.5">/dev/code-block</code>.
				</p>
			</header>

			<div className="flex flex-wrap items-center gap-4 text-sm">
				<label className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={readOnly}
						onChange={(event) => setReadOnly(event.target.checked)}
					/>
					readOnly
				</label>
				<label className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={showCopy}
						onChange={(event) => setShowCopy(event.target.checked)}
					/>
					showCopy
				</label>
				<label className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={enableToggle}
						onChange={(event) => setEnableToggle(event.target.checked)}
					/>
					onToggleLine
				</label>
				<label className="flex items-center gap-2">
					knownVariables
					<input
						className="w-56 border bg-background px-2 py-1"
						value={knownVariables}
						onChange={(event) => setKnownVariables(event.target.value)}
					/>
				</label>
				<button
					type="button"
					className="border px-2 py-1 hover:bg-muted"
					onClick={() => {
						setValue(SAMPLE);
						setDisabledLines([]);
					}}
				>
					Reset sample
				</button>
			</div>

			<CodeBlock className="min-h-96">
				{showCopy ? <CodeBlockCopyButton value={value} /> : null}
				<div className="flex min-h-0 flex-1 overflow-auto">
					<CodeBlockGutter
						aria-hidden={!enableToggle}
						gutterWidthCh={gutterWidthCh}
					>
						{lines.map((_lineText, index) => {
							const lineNumber = index + 1;
							const section =
								sections.find(
									(candidate) => candidate.startLine === lineNumber,
								) ?? null;
							const state = enableToggle
								? lineToggleState(disabled, lineNumber, section)
								: disabled.has(lineNumber)
									? "off"
									: "on";

							return (
								<CodeBlockLineNumber
									key={lineNumber}
									state={state}
									title={
										enableToggle
											? state === "off"
												? "Line disabled — click to enable"
												: state === "indeterminate"
													? "Section partially enabled — click to disable all"
													: "Line enabled — click to disable"
											: undefined
									}
									aria-pressed={enableToggle ? state !== "off" : undefined}
									onClick={
										enableToggle
											? () =>
													setDisabledLines((prev) =>
														toggleLines(value, prev, lineNumber),
													)
											: undefined
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
										{highlightLine(lineText, knownSet)}
									</CodeBlockLine>
								);
							})}
						</CodeBlockContent>
						{readOnly ? null : (
							<CodeBlockInput
								value={value}
								onChange={(event) => setValue(event.target.value)}
								aria-label="Query document"
							/>
						)}
					</div>
				</div>
			</CodeBlock>

			<pre className="overflow-auto border bg-muted/30 p-3 text-xs">
				{JSON.stringify({ disabledLines, knownVariables: known }, null, 2)}
			</pre>
		</div>
	);
}
