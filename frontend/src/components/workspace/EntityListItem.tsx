import { Link, useMatchRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EntityListItemProps = {
	to: "/queries/$queryId" | "/plans/$planId" | "/categories/$categoryId";
	params: { queryId: number } | { planId: number } | { categoryId: number };
	title: string;
	description: string;
	badge: ReactNode;
};

export function EntityListItem({
	to,
	params,
	title,
	description,
	badge,
}: EntityListItemProps) {
	const matchRoute = useMatchRoute();
	const isActive = Boolean(matchRoute({ to, params, fuzzy: false }));

	return (
		<li>
			<Link
				to={to}
				params={params}
				className={cn(
					"flex h-auto flex-col items-start gap-1 border-b px-3 py-2 text-sm transition-colors hover:bg-muted/50",
					isActive && "bg-muted",
				)}
			>
				<span className="flex w-full items-start justify-between gap-3">
					<span className="leading-snug font-medium">{title}</span>
					{badge}
				</span>
				<span className="line-clamp-2 text-sm font-normal text-muted-foreground">
					{description}
				</span>
			</Link>
		</li>
	);
}
