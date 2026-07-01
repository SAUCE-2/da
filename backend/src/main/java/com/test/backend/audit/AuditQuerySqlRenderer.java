package com.test.backend.audit;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Renders stored section fragments into executable SQL.
 * <p>
 * Boundary trimming only — no layout formatting. Formatting for display belongs
 * on the frontend (Prettier). Execution paths in Plan 04 should call
 * {@link #renderQuerySql(List, boolean)} and execute the returned raw SQL.
 */
public final class AuditQuerySqlRenderer {

	private AuditQuerySqlRenderer() {
	}

	public static String renderQuerySql(List<QuerySection> sections, boolean defaultEnabledOnly) {
		return sections.stream()
				.sorted(AuditQuerySqlRenderer::compareSections)
				.filter(section -> !defaultEnabledOnly || section.isDefaultEnabled())
				.map(QuerySection::getSqlFragment)
				.map(AuditQuerySqlRenderer::trimFragmentBoundaries)
				.collect(Collectors.joining("\n"));
	}

	public static String trimFragmentBoundaries(String sqlFragment) {
		return sqlFragment
				.replace("\r\n", "\n")
				.replace('\r', '\n')
				.replaceAll("\\A(?:[\\t ]*\\n)+", "")
				.replaceAll("\\n[\\t \\n]*\\z", "");
	}

	public static int compareSections(QuerySection left, QuerySection right) {
		int orderComparison = Integer.compare(left.getSortOrder(), right.getSortOrder());
		if (orderComparison != 0) {
			return orderComparison;
		}
		return Long.compare(idOrMax(left), idOrMax(right));
	}

	private static long idOrMax(QuerySection section) {
		return section.getId() == null ? Long.MAX_VALUE : section.getId();
	}
}
