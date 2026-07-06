package com.test.backend.domain.query;

import com.test.backend.entity.query.QueryVersion;
import com.test.backend.entity.query.QuerySection;
import com.test.backend.entity.query.QueryVariable;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Renders stored section fragments into executable SQL.
 * <p>
 * Boundary trimming only — no layout formatting. Execution paths should call
 * {@link #renderVersionSql(QueryVersion, boolean, Map)} and execute the returned SQL.
 */
public final class QuerySqlRenderer {

	private QuerySqlRenderer() {
	}

	public static String renderQuerySql(List<QuerySection> sections, boolean defaultEnabledOnly) {
		return sections.stream()
				.sorted(QuerySqlRenderer::compareSections)
				.filter(section -> !defaultEnabledOnly || section.isDefaultEnabled())
				.map(QuerySection::getSqlFragment)
				.map(QuerySqlRenderer::trimFragmentBoundaries)
				.collect(Collectors.joining("\n"));
	}

	public static RenderedQuerySql renderVersionSql(
			QueryVersion version,
			boolean defaultEnabledOnly,
			Map<String, String> variableValues) {
		String concatenated = renderQuerySql(version.getSections(), defaultEnabledOnly);
		List<QueryVariable> variables = version.getVariables().stream()
				.sorted(QuerySqlRenderer::compareVariables)
				.toList();
		if (variables.isEmpty()) {
			QueryVariableSubstitutor.rejectUnresolvedPlaceholders(concatenated);
			return new RenderedQuerySql(concatenated, Map.of());
		}

		Map<String, String> resolvedValues = QueryVariableSubstitutor.resolveVariableValues(variables, variableValues);
		String sql = QueryVariableSubstitutor.substituteVariables(concatenated, variables, resolvedValues);
		return new RenderedQuerySql(sql, resolvedValues);
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

	public static int compareVariables(QueryVariable left, QueryVariable right) {
		int orderComparison = Integer.compare(left.getSortOrder(), right.getSortOrder());
		if (orderComparison != 0) {
			return orderComparison;
		}
		return Long.compare(idOrMax(left), idOrMax(right));
	}

	private static long idOrMax(QuerySection section) {
		return section.getId() == null ? Long.MAX_VALUE : section.getId();
	}

	private static long idOrMax(QueryVariable variable) {
		return variable.getId() == null ? Long.MAX_VALUE : variable.getId();
	}
}
