import type { FormEventHandler, ReactNode } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";

import { EditorHeader } from "@/components/workspace/EditorHeader";
import { EntityNotFound } from "@/components/workspace/EntityNotFound";

type EntityEditorShellProps = {
	isNotFound: boolean;
	notFoundMessage: string;
	backLabel: string;
	onBack: () => void;
	errorMessage?: string | null;
	title: string;
	/** Header actions (typically `<EditorActions />`, optionally with extra badges). */
	actions: ReactNode;
	onSubmit: FormEventHandler<HTMLFormElement>;
	children: ReactNode;
};

export function EntityEditorShell({
	isNotFound,
	notFoundMessage,
	backLabel,
	onBack,
	errorMessage,
	title,
	actions,
	onSubmit,
	children,
}: EntityEditorShellProps) {
	if (isNotFound) {
		return (
			<EntityNotFound
				message={notFoundMessage}
				backLabel={backLabel}
				onBack={onBack}
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
			<EditorHeader title={title} actions={actions} />
			<div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
		</form>
	);
}
