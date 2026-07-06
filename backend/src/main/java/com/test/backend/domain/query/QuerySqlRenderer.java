package com.test.backend.domain.query;

import com.test.backend.entity.query.QueryVersion;
import com.test.backend.entity.query.QueryVariable;
import java.util.List;
import java.util.Map;

/**
 * Renders stored section fragments into executable SQL.
 * <p>
 * Boundary trimming only — no layout formatting. Execution paths should call
 * {@link #renderVersionSql(QueryVersion, boolean, Map)} and execute the returned SQL.
 */
public final class QuerySqlRenderer {

	private QuerySqlRenderer() {
	}

	public static String renderQuerySql(List<com.test.backend.entity.query.QuerySection> sections, boolean defaultEnabledOnly) {
		return sections.stream()
				.sorted(QuerySqlRenderer::compareSections)
				.filter(section -> !defaultEnabledOnly || section.isDefaultEnabled())
				.map(com.test.backend.entity.query.QuerySection::getSqlFragment)
				.map(QuerySqlRenderer::trimFragmentBoundaries)
				.collect(java.util.stream.Collectors.joining("\n"));
	}

	public record RenderedQuerySql(String sql) {
	}

	public record PreviewSql(String sql, List<String> unresolvedVariables) {
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
			return new RenderedQuerySql(concatenated);
		}

		Map<String, String> resolvedValues = QueryVariableSubstitutor.resolveVariableValues(variables, variableValues);
		String sql = QueryVariableSubstitutor.substituteVariables(concatenated, variables, resolvedValues);
		return new RenderedQuerySql(sql);
	}

	public static PreviewSql renderPreviewSql(
			QueryVersion version,
			boolean defaultEnabledOnly,
			Map<String, String> variableValues) {
		String concatenated = renderQuerySql(version.getSections(), defaultEnabledOnly);
		List<QueryVariable> variables = version.getVariables().stream()
				.sorted(QuerySqlRenderer::compareVariables)
				.toList();
		if (variables.isEmpty()) {
			return new PreviewSql(
					concatenated,
					QueryVariableSubstitutor.findUnresolvedPlaceholders(concatenated));
		}

		Map<String, String> resolvedValues = QueryVariableSubstitutor.resolveVariableValues(variables, variableValues);
		String sql = QueryVariableSubstitutor.substituteVariablesPreview(concatenated, variables, resolvedValues);
		return new PreviewSql(sql, QueryVariableSubstitutor.findUnresolvedPlaceholders(sql));
	}

	public static String trimFragmentBoundaries(String sqlFragment) {
		return sqlFragment
				.replace("\r\n", "\n")
				.replace('\r', '\n')
				.replaceAll("\\A(?:[\\t ]*\\n)+", "")
				.replaceAll("\\n[\\t \\n]*\\z", "");
	}

	public static int compareSections(
			com.test.backend.entity.query.QuerySection left,
			com.test.backend.entity.query.QuerySection right) {
		int orderComparison = Integer.compare(left.getSortOrder(), right.getSortOrder());
		if (orderComparison != 0) {
			return orderComparison;
		}
		return Long.compare(idOrMax(left.getId()), idOrMax(right.getId()));
	}

	public static int compareVariables(QueryVariable left, QueryVariable right) {
		int orderComparison = Integer.compare(left.getSortOrder(), right.getSortOrder());
		if (orderComparison != 0) {
			return orderComparison;
		}
		return Long.compare(idOrMax(left.getId()), idOrMax(right.getId()));
	}

	private static long idOrMax(Long id) {
		return id == null ? Long.MAX_VALUE : id;
	}
}
