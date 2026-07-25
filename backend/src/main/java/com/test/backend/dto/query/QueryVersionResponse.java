package com.test.backend.dto.query;

import java.time.Instant;
import java.util.List;

public record QueryVersionResponse(
		Long versionId,
		int versionNumber,
		Instant createdAt,
		String name,
		String description,
		String query,
		String queryHash,
		List<Integer> defaultDisabledLines,
		List<QuerySectionOutlineResponse> sections,
		List<QueryVariableResponse> variables) {
}
