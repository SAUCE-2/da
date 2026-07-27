import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type ErrorPanelProps = {
	message: string;
	actionLabel: string;
	onAction: () => void;
};

/** Alert + action button. Used for not-found and route load errors. */
export function ErrorPanel({
	message,
	actionLabel,
	onAction,
}: ErrorPanelProps) {
	return (
		<div className="flex flex-col gap-3 p-3">
			<Alert variant="destructive">
				<AlertDescription>{message}</AlertDescription>
			</Alert>
			<Button type="button" size="sm" className="w-fit" onClick={onAction}>
				{actionLabel}
			</Button>
		</div>
	);
}

type RouteErrorPanelProps = {
	error: Error;
	fallbackMessage: string;
};

/** Route errorComponent helper: ErrorPanel + Retry that invalidates the router. */
export function RouteErrorPanel({
	error,
	fallbackMessage,
}: RouteErrorPanelProps) {
	const router = useRouter();
	const queryErrorResetBoundary = useQueryErrorResetBoundary();

	useEffect(() => {
		queryErrorResetBoundary.reset();
	}, [queryErrorResetBoundary]);

	return (
		<ErrorPanel
			message={error.message || fallbackMessage}
			actionLabel="Retry"
			onAction={() => void router.invalidate()}
		/>
	);
}
