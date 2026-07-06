package com.test.backend.dto.plan;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuditPlanRequest(
		@NotBlank @Size(max = 200) String name,
		@Size(max = 1000) String description,
		Boolean active,
		List<@Valid PlanItemRequest> items) {
}
