package com.test.backend.dto.query;

import com.test.backend.entity.query.QueryVariableType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record QueryVariableRequest(
		@NotBlank
		@Pattern(regexp = "[a-zA-Z][a-zA-Z0-9_]*")
		@Size(max = 100)
		String name,
		@NotNull QueryVariableType type,
		@Size(max = 1000) String defaultValue,
		Boolean required,
		int sortOrder) {
}
