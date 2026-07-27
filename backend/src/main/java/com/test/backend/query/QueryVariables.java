package com.test.backend.query;

import com.test.backend.entity.query.QueryVariable;
import java.util.Comparator;

/**
 * Shared ordering for {@link QueryVariable} lists.
 */
public final class QueryVariables {

	public static final Comparator<QueryVariable> BY_SORT_ORDER = (left, right) -> {
		int orderComparison = Integer.compare(left.getSortOrder(), right.getSortOrder());
		if (orderComparison != 0) {
			return orderComparison;
		}
		return Long.compare(idOrMax(left.getId()), idOrMax(right.getId()));
	};

	private QueryVariables() {
	}

	private static long idOrMax(Long id) {
		return id == null ? Long.MAX_VALUE : id;
	}
}
