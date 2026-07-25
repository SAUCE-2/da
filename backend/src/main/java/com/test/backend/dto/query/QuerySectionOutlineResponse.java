package com.test.backend.dto.query;

public record QuerySectionOutlineResponse(
		String name,
		int level,
		int startLine,
		int endLine) {
}
