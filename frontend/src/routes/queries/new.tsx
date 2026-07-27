import { createFileRoute } from "@tanstack/react-router";

import { QueryEditor } from "@/features/queries/editor";

export const Route = createFileRoute("/queries/new")({
	component: () => <QueryEditor entityId={null} />,
});
