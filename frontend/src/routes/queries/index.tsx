import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/queries/")({
	beforeLoad: () => {
		throw redirect({ to: "/queries/new" });
	},
});
