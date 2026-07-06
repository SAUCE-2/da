package com.test.backend.dto.query;

import java.time.Instant;

public record QueryVersionSummaryResponse(Long versionId, int versionNumber, Instant createdAt) {
}
