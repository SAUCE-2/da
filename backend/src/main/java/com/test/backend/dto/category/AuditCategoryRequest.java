package com.test.backend.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuditCategoryRequest(
		@NotBlank @Size(max = 200) String name,
		@Size(max = 1000) String description) {
}
