package com.test.backend.dto.plan;

import java.util.List;

public record PlanItemResponse(
		Long id,
		Long auditQueryId,
		String auditQueryName,
		Long auditQueryVersionId,
		Integer auditQueryVersionNumber,
		int sortOrder,
		boolean enabled,
		List<PlanItemVariableBindingResponse> variableBindings) {
}
