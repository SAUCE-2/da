package com.test.backend.dto.category;

public record CategoryResponse(
		Long id,
		String name,
		String description,
		long queryCount) {
}
