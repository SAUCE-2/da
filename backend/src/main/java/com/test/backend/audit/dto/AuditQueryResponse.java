package com.test.backend.audit.dto;

import java.util.List;

public record AuditQueryResponse(
		Long id,
		String name,
		String description,
		boolean active,
		List<QuerySectionResponse> sections,
		List<AuditCategorySummaryResponse> categories) {
}
