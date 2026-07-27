package com.test.backend.dto.plan;

import java.util.List;

public record PlanItemResponse(
		Long id,
		Long queryId,
		int sortOrder,
		boolean enabled,
		List<Integer> disabledLines,
		List<PlanItemVariableBindingResponse> variableBindings) {
}
