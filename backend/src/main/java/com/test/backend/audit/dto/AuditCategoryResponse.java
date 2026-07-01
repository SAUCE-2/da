package com.test.backend.audit.dto;

public record AuditCategoryResponse(
		Long id,
		String name,
		String description,
		long queryCount) {
}
