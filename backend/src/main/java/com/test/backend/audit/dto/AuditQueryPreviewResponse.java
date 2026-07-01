package com.test.backend.audit.dto;

public record AuditQueryPreviewResponse(
		Long id,
		String sql) {
}
