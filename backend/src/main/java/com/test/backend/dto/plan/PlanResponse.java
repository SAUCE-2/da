package com.test.backend.dto.plan;

import java.util.List;

public record PlanResponse(
		Long id,
		String name,
		String description,
		boolean active,
		List<PlanItemResponse> items) {
}
