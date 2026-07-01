package com.test.backend.audit.dto;

public record QuerySectionResponse(
		Long id,
		String name,
		String sqlFragment,
		int sortOrder,
		boolean defaultEnabled) {
}
