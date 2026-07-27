package com.test.backend.dto.query;

import com.test.backend.dto.category.CategorySummaryResponse;

import java.util.List;

public record QuerySummaryResponse(
		Long id,
		String name,
		String description,
		boolean active,
		Long versionId,
		int versionNumber,
		List<CategorySummaryResponse> categories) {
}
