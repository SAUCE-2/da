package com.test.backend.dto.query;

import com.test.backend.dto.category.AuditCategorySummaryResponse;

import java.util.List;

public record AuditQueryResponse(
		Long id,
		String name,
		String description,
		boolean active,
		Long versionId,
		int versionNumber,
		List<QuerySectionResponse> sections,
		List<QueryVariableResponse> variables,
		List<AuditCategorySummaryResponse> categories) {
}
