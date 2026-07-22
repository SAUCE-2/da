import "@tanstack/react-router";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react/lib";

type VisibleRouteNavMetadata = {
	id: string;
	label: string;
	icon: PhosphorIcon;
	subsectionId?: string;
	parentId?: string;
	order: number;
	hidden?: false;
};

type HiddenRouteNavMetadata = {
	hidden: true;
};

export type RouteNavMetadata = VisibleRouteNavMetadata | HiddenRouteNavMetadata;

declare module "@tanstack/react-router" {
	interface StaticDataRouteOption {
		nav?: RouteNavMetadata;
	}
}
