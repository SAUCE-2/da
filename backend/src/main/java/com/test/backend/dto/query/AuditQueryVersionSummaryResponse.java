package com.test.backend.dto.query;

import java.time.Instant;

public record AuditQueryVersionSummaryResponse(Long versionId, int versionNumber, Instant createdAt) {
}
