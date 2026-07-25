package com.test.backend.query;

import com.test.backend.entity.query.QueryVersion;
import com.test.backend.entity.query.QueryVariable;
import java.util.List;
import java.util.Map;

/**
 * Renders a query version into executable SQL by dropping disabled lines,
 * stripping {@code --#} section markers, then substituting variables.
 */
public final class QuerySqlRenderer {

	private QuerySqlRenderer() {
	}

	public record RenderedQuerySql(String sql) {
	}

	public record PreviewSql(String sql, List<String> unresolvedVariables) {
	}

	public static String renderQuerySql(String query, List<Integer> disabledLines) {
		return QueryDocumentParser.renderQuery(query, disabledLines);
	}

	public static RenderedQuerySql renderVersionSql(
			QueryVersion version,
			List<Integer> disabledLines,
			Map<String, String> variableValues) {
		String rendered = renderQuerySql(version.getQueryText(), resolveDisabledLines(version, disabledLines));
		List<QueryVariable> variables = version.getVariables().stream()
				.sorted(QuerySqlRenderer::compareVariables)
				.toList();
		if (variables.isEmpty()) {
			QueryVariableSubstitutor.rejectUnresolvedPlaceholders(rendered);
			return new RenderedQuerySql(rendered);
		}

		Map<String, String> resolvedValues = QueryVariableSubstitutor.resolveVariableValues(variables, variableValues);
		String sql = QueryVariableSubstitutor.substituteVariables(rendered, variables, resolvedValues);
		return new RenderedQuerySql(sql);
	}

	public static PreviewSql renderPreviewSql(
			QueryVersion version,
			List<Integer> disabledLines,
			Map<String, String> variableValues) {
		String rendered = renderQuerySql(version.getQueryText(), resolveDisabledLines(version, disabledLines));
		List<QueryVariable> variables = version.getVariables().stream()
				.sorted(QuerySqlRenderer::compareVariables)
				.toList();
		if (variables.isEmpty()) {
			return new PreviewSql(
					rendered,
					QueryVariableSubstitutor.findUnresolvedPlaceholders(rendered));
		}

		Map<String, String> resolvedValues = QueryVariableSubstitutor.resolveVariableValues(variables, variableValues);
		String sql = QueryVariableSubstitutor.substituteVariablesPreview(rendered, variables, resolvedValues);
		return new PreviewSql(sql, QueryVariableSubstitutor.findUnresolvedPlaceholders(sql));
	}

	public static String trimFragmentBoundaries(String sqlFragment) {
		return QueryDocumentParser.trimFragmentBoundaries(sqlFragment);
	}

	public static int compareVariables(QueryVariable left, QueryVariable right) {
		int orderComparison = Integer.compare(left.getSortOrder(), right.getSortOrder());
		if (orderComparison != 0) {
			return orderComparison;
		}
		return Long.compare(idOrMax(left.getId()), idOrMax(right.getId()));
	}

	private static List<Integer> resolveDisabledLines(QueryVersion version, List<Integer> disabledLines) {
		if (disabledLines != null) {
			return disabledLines;
		}
		return QueryDocumentParser.parseDisabledLines(version.getDefaultDisabledLines());
	}

	private static long idOrMax(Long id) {
		return id == null ? Long.MAX_VALUE : id;
	}
}
