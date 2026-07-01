package com.test.backend.audit.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record AuditQueryRequest(
		@NotBlank @Size(max = 200) String name,
		@Size(max = 1000) String description,
		Boolean active,
		@NotEmpty List<@Valid QuerySectionRequest> sections,
		List<Long> categoryIds) {
}
