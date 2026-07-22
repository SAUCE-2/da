import { createFileRoute } from "@tanstack/react-router";

import { CategoryEditor } from "@/features/categories/CategoryEditor";

export const Route = createFileRoute("/categories/$categoryId")({
	params: {
		parse: (params) => ({
			categoryId: Number(params.categoryId),
		}),
		stringify: (params) => ({
			categoryId: String(params.categoryId),
		}),
	},
	component: EditCategoryPage,
});

function EditCategoryPage() {
	const { categoryId } = Route.useParams();
	return <CategoryEditor key={categoryId} entityId={categoryId} />;
}
