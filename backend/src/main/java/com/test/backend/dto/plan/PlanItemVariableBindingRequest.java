package com.test.backend.dto.plan;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PlanItemVariableBindingRequest(
		@NotBlank @Size(max = 100) String name,
		@Size(max = 1000) String value) {
}
