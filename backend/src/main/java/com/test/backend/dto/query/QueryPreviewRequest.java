package com.test.backend.dto.query;

import java.util.Map;

public record QueryPreviewRequest(Long versionId, Map<String, String> variables) {
}
