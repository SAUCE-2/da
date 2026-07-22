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
	return (
		<pre
			className={cn(
				"max-h-[420px] overflow-auto border bg-muted/50 p-3 font-mono text-sm whitespace-pre-wrap",
				className,
			)}
		>
			{sql.trim() ? sql : emptyMessage}
		</pre>
	);
}
