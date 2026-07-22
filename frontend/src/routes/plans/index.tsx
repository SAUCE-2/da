import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/plans/")({
	beforeLoad: () => {
		throw redirect({ to: "/plans/new" });
	},
});
