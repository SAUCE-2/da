package com.test.backend.dto.query;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record QuerySectionRequest(
		@NotBlank @Size(max = 200) String name,
		@NotBlank String sqlFragment,
		int sortOrder,
		Boolean defaultEnabled) {
}
