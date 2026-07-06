package com.test.backend.domain.query;

import com.test.backend.entity.query.QueryVariable;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class QueryVariableSubstitutor {

	private static final Pattern PLACEHOLDER_PATTERN = Pattern.compile("\\{\\{([a-zA-Z][a-zA-Z0-9_]*)\\}\\}");
	private static final Pattern NUMBER_PATTERN = Pattern.compile("^-?\\d+(?:\\.\\d+)?$");
	private static final Pattern DATE_PATTERN = Pattern.compile("^\\d{4}-\\d{2}-\\d{2}$");

	private QueryVariableSubstitutor() {
	}

	public static Map<String, String> resolveVariableValues(
			List<QueryVariable> variables,
			Map<String, String> providedValues) {
		Map<String, String> resolved = new LinkedHashMap<>();
		Map<String, String> safeProvidedValues = providedValues == null ? Map.of() : providedValues;

		for (QueryVariable variable : variables) {
			String rawValue = safeProvidedValues.get(variable.getName());
			if (rawValue == null || rawValue.isBlank()) {
				rawValue = variable.getDefaultValue();
			}
			if (rawValue == null || rawValue.isBlank()) {
				if (variable.isRequired()) {
					throw new ResponseStatusException(
							HttpStatus.BAD_REQUEST,
							"Missing required variable: " + variable.getName());
				}
				continue;
			}
			resolved.put(variable.getName(), rawValue.trim());
		}

		return resolved;
	}

	public static String substituteVariables(String sql, List<QueryVariable> variables, Map<String, String> values) {
		return substituteVariables(sql, variables, values, false);
	}

	public static String substituteVariablesPreview(
			String sql,
			List<QueryVariable> variables,
			Map<String, String> values) {
		return substituteVariables(sql, variables, values, true);
	}

	private static String substituteVariables(
			String sql,
			List<QueryVariable> variables,
			Map<String, String> values,
			boolean preview) {
		Map<String, QueryVariable> variablesByName = new LinkedHashMap<>();
		for (QueryVariable variable : variables) {
			variablesByName.put(variable.getName(), variable);
		}

		Matcher matcher = PLACEHOLDER_PATTERN.matcher(sql);
		StringBuffer rendered = new StringBuffer();
		while (matcher.find()) {
			String variableName = matcher.group(1);
			QueryVariable variable = variablesByName.get(variableName);
			if (variable == null) {
				throw new ResponseStatusException(
						HttpStatus.BAD_REQUEST,
						"Unknown variable referenced in SQL: " + variableName);
			}
			String rawValue = values.get(variableName);
			if (rawValue == null || rawValue.isBlank()) {
				if (preview) {
					matcher.appendReplacement(rendered, Matcher.quoteReplacement(matcher.group(0)));
					continue;
				}
				throw new ResponseStatusException(
						HttpStatus.BAD_REQUEST,
						"Missing value for variable referenced in SQL: " + variableName);
			}
			matcher.appendReplacement(rendered, Matcher.quoteReplacement(toSqlLiteral(variable, rawValue)));
		}
		matcher.appendTail(rendered);

		String renderedSql = rendered.toString();
		if (!preview) {
			rejectUnresolvedPlaceholders(renderedSql);
		}
		return renderedSql;
	}

	public static List<String> findUnresolvedPlaceholders(String sql) {
		Matcher matcher = PLACEHOLDER_PATTERN.matcher(sql);
		List<String> unresolved = new ArrayList<>();
		while (matcher.find()) {
			unresolved.add(matcher.group(1));
		}
		return unresolved;
	}

	public static void rejectUnresolvedPlaceholders(String sql) {
		List<String> unresolved = findUnresolvedPlaceholders(sql);
		if (!unresolved.isEmpty()) {
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST,
					"Unresolved SQL placeholders: " + unresolved);
		}
	}

	private static String toSqlLiteral(QueryVariable variable, String rawValue) {
		return switch (variable.getType()) {
			case STRING -> "'" + rawValue.replace("'", "''") + "'";
			case NUMBER -> {
				if (!NUMBER_PATTERN.matcher(rawValue).matches()) {
					throw new ResponseStatusException(
							HttpStatus.BAD_REQUEST,
							"Variable " + variable.getName() + " must be a number.");
				}
				yield rawValue;
			}
			case DATE -> {
				if (!DATE_PATTERN.matcher(rawValue).matches()) {
					throw new ResponseStatusException(
							HttpStatus.BAD_REQUEST,
							"Variable " + variable.getName() + " must be a date in YYYY-MM-DD format.");
				}
				yield "DATE '" + rawValue + "'";
			}
		};
	}
}
