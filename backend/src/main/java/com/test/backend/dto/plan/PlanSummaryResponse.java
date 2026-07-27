package com.test.backend.dto.plan;

public record PlanSummaryResponse(
		Long id,
		String name,
		String description,
		boolean active,
		int itemCount) {
}
