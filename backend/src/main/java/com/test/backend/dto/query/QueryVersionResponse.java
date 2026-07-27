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
		List<Integer> defaultDisabledLines,
		List<QueryVariableResponse> variables) {
}
