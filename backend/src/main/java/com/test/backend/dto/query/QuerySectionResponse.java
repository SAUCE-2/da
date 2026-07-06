package com.test.backend.dto.query;

public record QuerySectionResponse(
		Long id,
		String name,
		String sqlFragment,
		int sortOrder,
		boolean defaultEnabled) {
}
