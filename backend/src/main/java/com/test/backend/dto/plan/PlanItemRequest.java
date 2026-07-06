package com.test.backend.dto.plan;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record PlanItemRequest(
		@NotNull Long queryId,
		Long queryVersionId,
		int sortOrder,
		Boolean enabled,
		List<@Valid PlanItemVariableBindingRequest> variableBindings) {
}
