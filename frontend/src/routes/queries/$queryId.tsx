import { createFileRoute } from "@tanstack/react-router";

import { QueryEditor } from "@/features/queries/editor";
import { queryDetailOptions } from "@/features/queries/server-state";

export const Route = createFileRoute("/queries/$queryId")({
	params: {
		parse: (params) => ({
			queryId: Number(params.queryId),
		}),
		stringify: (params) => ({
			queryId: String(params.queryId),
		}),
	},
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(queryDetailOptions(params.queryId)),
	component: EditQueryPage,
});

function EditQueryPage() {
	const { queryId } = Route.useParams();
	return <QueryEditor key={queryId} entityId={queryId} />;
}
