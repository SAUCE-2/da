import { CodeBlock } from "@/components/ui/code-block";
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

	return (
		<CodeBlock
			value={value}
			readOnly
			showCopy={Boolean(sql.trim())}
			className={cn("max-h-105 min-h-0", className)}
		/>
	);
}
