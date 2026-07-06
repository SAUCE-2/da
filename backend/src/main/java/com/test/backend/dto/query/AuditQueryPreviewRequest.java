package com.test.backend.dto.query;

import java.util.Map;

public record AuditQueryPreviewRequest(Long versionId, Map<String, String> variables) {
}
