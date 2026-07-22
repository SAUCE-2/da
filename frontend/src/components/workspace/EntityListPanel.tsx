import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";

type EntityListPanelProps = {
	title: string;
	totalCount: number;
	newLinkTo: "/queries/new" | "/plans/new" | "/categories/new";
	newLinkLabel: string;
	emptyMessage: string;
	children: ReactNode;
};

export function EntityListPanel({
	title,
	totalCount,
	newLinkTo,
	newLinkLabel,
	emptyMessage,
	children,
}: EntityListPanelProps) {
	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="border-b">
				<div className="flex items-center justify-between gap-3 p-2">
					<div className="flex items-baseline gap-2">
						<h2 className="text-sm font-medium">{title}</h2>
						<Badge variant="secondary">{totalCount} total</Badge>
					</div>
					<Button type="button" size="sm" asChild>
						<Link to={newLinkTo}>{newLinkLabel}</Link>
					</Button>
				</div>
			</div>
			<div className="min-h-0 flex-1 overflow-y-auto">
				{totalCount === 0 ? (
					<Empty>
						<EmptyHeader>
							<EmptyTitle>No {title.toLowerCase()} yet</EmptyTitle>
							<EmptyDescription>{emptyMessage}</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<ul className="flex flex-col gap-0 p-0">{children}</ul>
				)}
			</div>
		</div>
	);
}
