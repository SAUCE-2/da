import { createFileRoute } from "@tanstack/react-router";

import { QueryEditor } from "@/features/queries/QueryEditor";

export const Route = createFileRoute("/queries/$queryId")({
	params: {
		parse: (params) => ({
			queryId: Number(params.queryId),
		}),
		stringify: (params) => ({
			queryId: String(params.queryId),
		}),
	},
	component: EditQueryPage,
});

function EditQueryPage() {
	const { queryId } = Route.useParams();
	return <QueryEditor key={queryId} entityId={queryId} />;
}
