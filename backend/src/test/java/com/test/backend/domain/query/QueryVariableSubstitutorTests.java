package com.test.backend.domain.query;

import com.test.backend.domain.query.QueryVariableSubstitutor;
import com.test.backend.entity.query.QueryVariable;
import com.test.backend.entity.query.QueryVariableType;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class QueryVariableSubstitutorTests {

	@Test
	void substitutesStringNumberAndDateVariables() {
		List<QueryVariable> variables = List.of(
				new QueryVariable("status", QueryVariableType.STRING, null, true, 0),
				new QueryVariable("regionId", QueryVariableType.NUMBER, null, true, 1),
				new QueryVariable("startDate", QueryVariableType.DATE, null, true, 2));

		String rendered = QueryVariableSubstitutor.substituteVariables(
				"WHERE status = {{status}} AND region_id = {{regionId}} AND created_at >= {{startDate}}",
				variables,
				Map.of("status", "ACTIVE", "regionId", "42", "startDate", "2024-06-01"));

		assertEquals(
				"WHERE status = 'ACTIVE' AND region_id = 42 AND created_at >= DATE '2024-06-01'",
				rendered);
	}

	@Test
	void rejectsMissingRequiredVariables() {
		List<QueryVariable> variables = List.of(
				new QueryVariable("status", QueryVariableType.STRING, null, true, 0));

		ResponseStatusException exception = assertThrows(
				ResponseStatusException.class,
				() -> QueryVariableSubstitutor.resolveVariableValues(variables, Map.of()));

		assertEquals(400, exception.getStatusCode().value());
		assertEquals("Missing required variable: status", exception.getReason());
	}

	@Test
	void rejectsUnresolvedPlaceholders() {
		ResponseStatusException exception = assertThrows(
				ResponseStatusException.class,
				() -> QueryVariableSubstitutor.rejectUnresolvedPlaceholders("WHERE id = {{missing}}"));

		assertEquals(400, exception.getStatusCode().value());
		assertEquals("Unresolved SQL placeholders: [missing]", exception.getReason());
	}
}
