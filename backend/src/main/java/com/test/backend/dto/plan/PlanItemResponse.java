package com.test.backend.dto.plan;

import java.util.List;

public record PlanItemResponse(
		Long id,
		Long queryId,
		String queryName,
		Long queryVersionId,
		Integer queryVersionNumber,
		int sortOrder,
		boolean enabled,
		List<PlanItemVariableBindingResponse> variableBindings) {
}
