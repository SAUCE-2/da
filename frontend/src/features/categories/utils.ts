import type { Category, QuerySummary } from "@/lib/api-types";

export function buildDerivedQueryCounts(queries: QuerySummary[]) {
	const counts = new Map<number, number>();

	for (const query of queries) {
		for (const category of query.categories) {
			counts.set(category.id, (counts.get(category.id) ?? 0) + 1);
		}
	}

	return counts;
}

export function getCategoryQueryCount(
	category: Category,
	derivedCounts: Map<number, number>,
) {
	return typeof category.queryCount === "number"
		? category.queryCount
		: (derivedCounts.get(category.id) ?? 0);
}
