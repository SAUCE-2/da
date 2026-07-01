package com.test.backend.audit.dto;

public record AuditCategorySummaryResponse(
		Long id,
		String name,
		String description) {
}
