package com.test.backend.dto.query;

import com.test.backend.entity.query.QueryVariableType;

public record QueryVariableResponse(
		Long id,
		String name,
		QueryVariableType type,
		String defaultValue,
		boolean required,
		int sortOrder) {
}
