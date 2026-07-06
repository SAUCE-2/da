package com.test.backend.dto.query;

import java.util.List;

public record AuditQueryPreviewResponse(Long id, Long versionId, String sql, List<String> unresolvedVariables) {
}
