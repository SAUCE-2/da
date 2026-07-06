package com.test.backend.dto.environment;

public record ProjectResponse(
		Long id,
		Long environmentId,
		String name,
		String code,
		String schemaName,
		boolean active) {
}
