import type { ReactNode } from "react";

type ListDetailLayoutProps = {
	list: ReactNode;
	children: ReactNode;
};

export function ListDetailLayout({ list, children }: ListDetailLayoutProps) {
	return (
		<div className="flex min-h-0 flex-1 flex-col md:flex-row">
			<aside className="flex min-h-0 flex-col border-r md:w-[min(300px,30%)] md:min-w-[260px]">
				{list}
			</aside>
			<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
				{children}
			</div>
		</div>
	);
}
