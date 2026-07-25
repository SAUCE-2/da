import { CodeBlock } from "@/components/ui/code-block";
import { toggleLines } from "./query-document";

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
	return (
		<CodeBlock
			value={value}
			readOnly={readOnly}
			disabledLines={disabledLines}
			knownVariables={knownVariables}
			className={className}
			onChange={onChange}
			onToggleLine={
				readOnly
					? undefined
					: (lineNumber) => {
							onDisabledLinesChange(
								toggleLines(value, disabledLines, lineNumber),
							);
						}
			}
		/>
	);
}
