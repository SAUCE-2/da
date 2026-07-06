package com.test.backend.dto.category;

public record AuditCategoryResponse(
		Long id,
		String name,
		String description,
		long queryCount) {
}
