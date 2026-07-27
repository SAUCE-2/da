import type { ReactNode, SubmitEventHandler } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { ErrorPanel } from "@/components/workspace/error-panel";

type EditorPageProps = {
	isNotFound: boolean;
	notFoundMessage: string;
	backLabel: string;
	onBack: () => void;
	errorMessage?: string | null;
	title: string;
	/** Header actions (typically `<EditorActions />`, optionally with extra badges). */
	actions: ReactNode;
	onSubmit: SubmitEventHandler<HTMLFormElement>;
	children: ReactNode;
};

export function EditorPage({
	isNotFound,
	notFoundMessage,
	backLabel,
	onBack,
	errorMessage,
	title,
	actions,
	onSubmit,
	children,
}: EditorPageProps) {
	if (isNotFound) {
		return (
			<ErrorPanel
				message={notFoundMessage}
				actionLabel={backLabel}
				onAction={onBack}
			/>
		);
	}

	return (
		<form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
			{errorMessage ? (
				<div className="border-b p-3">
					<Alert variant="destructive">
						<AlertDescription>{errorMessage}</AlertDescription>
					</Alert>
				</div>
			) : null}
			<header className="sticky top-0 z-10 shrink-0 border-b bg-background p-3">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex min-w-0 flex-col gap-0.5">
						<h2 className="text-xl font-medium">{title}</h2>
					</div>
					<div className="shrink-0">{actions}</div>
				</div>
			</header>
			<div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
		</form>
	);
}
