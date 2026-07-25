package com.test.backend.dto.query;

import java.util.List;
import java.util.Map;

public record QueryPreviewRequest(
		Long versionId,
		Map<String, String> variables,
		List<Integer> disabledLines) {
}
