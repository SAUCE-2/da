package com.test.backend.dto.query;

import java.time.Instant;
import java.util.List;

public record AuditQueryVersionResponse(
		Long versionId,
		int versionNumber,
		Instant createdAt,
		List<QuerySectionResponse> sections,
		List<QueryVariableResponse> variables) {
}
