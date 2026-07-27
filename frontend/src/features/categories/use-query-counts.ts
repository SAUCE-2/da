import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { queriesListOptions } from "@/features/queries/server-state";
import type { Category } from "@/lib/api-types";
import { buildDerivedQueryCounts, getCategoryQueryCount } from "./utils";

export function useCategoryQueryCounts() {
	const { data: queries = [] } = useQuery(queriesListOptions());
	const counts = useMemo(() => buildDerivedQueryCounts(queries), [queries]);

	return useCallback(
		(category: Category) => getCategoryQueryCount(category, counts),
		[counts],
	);
}
