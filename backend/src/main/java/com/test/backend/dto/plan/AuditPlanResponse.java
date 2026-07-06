package com.test.backend.dto.plan;

import java.util.List;

public record AuditPlanResponse(
		Long id,
		String name,
		String description,
		boolean active,
		List<PlanItemResponse> items) {
}
