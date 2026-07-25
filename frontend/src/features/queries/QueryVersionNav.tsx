import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { QueryVersionSummary } from "@/lib/api-types";

type QueryVersionNavProps = {
	versions: QueryVersionSummary[];
	viewingVersionId: number | null;
	viewingVersionNumber: number | null;
	currentVersionId: number | null;
	isViewingHistorical: boolean;
	canGoPrevious: boolean;
	canGoNext: boolean;
	isLoadingVersion: boolean;
	isRestoring: boolean;
	onPrevious: () => void;
	onNext: () => void;
	onSelectVersion: (versionId: number) => void;
	onRestore: () => void;
};

function formatCreatedAt(createdAt: string) {
	const date = new Date(createdAt);
	if (Number.isNaN(date.getTime())) {
		return createdAt;
	}
	return date.toLocaleString(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	});
}

export function QueryVersionNav({
	versions,
	viewingVersionId,
	viewingVersionNumber,
	currentVersionId,
	isViewingHistorical,
	canGoPrevious,
	canGoNext,
	isLoadingVersion,
	isRestoring,
	onPrevious,
	onNext,
	onSelectVersion,
	onRestore,
}: QueryVersionNavProps) {
	if (versions.length === 0 || viewingVersionId === null) {
		return null;
	}

	const versionInList = versions.some(
		(version) => version.versionId === viewingVersionId,
	);
	const selectValue = versionInList ? String(viewingVersionId) : undefined;

	return (
		<div className="flex flex-wrap items-center gap-2">
			<div className="flex items-center gap-1">
				<Button
					type="button"
					variant="outline"
					size="icon-xs"
					disabled={!canGoPrevious || isLoadingVersion}
					onClick={onPrevious}
					aria-label="Previous version"
				>
					<ChevronLeftIcon />
				</Button>
				<Select
					value={selectValue}
					onValueChange={(value) => {
						const versionId = Number(value);
						if (
							!Number.isFinite(versionId) ||
							versionId <= 0 ||
							versionId === viewingVersionId
						) {
							return;
						}
						onSelectVersion(versionId);
					}}
					disabled={isLoadingVersion || versions.length < 2}
				>
					<SelectTrigger size="sm" className="min-w-40">
						<SelectValue
							placeholder={
								viewingVersionNumber !== null
									? `v${viewingVersionNumber}`
									: "Version"
							}
						/>
					</SelectTrigger>
					<SelectContent align="end">
						{versions.map((version) => (
							<SelectItem
								key={version.versionId}
								value={String(version.versionId)}
							>
								v{version.versionNumber}
								{version.versionId === currentVersionId ? " (current)" : ""}
								{" · "}
								{formatCreatedAt(version.createdAt)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button
					type="button"
					variant="outline"
					size="icon-xs"
					disabled={!canGoNext || isLoadingVersion}
					onClick={onNext}
					aria-label="Next version"
				>
					<ChevronRightIcon />
				</Button>
				{isLoadingVersion ? <Spinner className="size-3.5" /> : null}
			</div>

			{isViewingHistorical ? (
				<>
					<span className="text-xs text-muted-foreground">
						Viewing v{viewingVersionNumber} (not current)
					</span>
					<Button
						type="button"
						variant="secondary"
						size="sm"
						disabled={isRestoring || isLoadingVersion}
						onClick={onRestore}
					>
						{isRestoring ? (
							<>
								<Spinner data-icon="inline-start" />
								Restoring...
							</>
						) : (
							"Restore"
						)}
					</Button>
				</>
			) : null}
		</div>
	);
}
