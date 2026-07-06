package com.test.backend.domain.query;

import java.util.Map;

public record RenderedQuerySql(String sql, Map<String, String> resolvedValues) {
}
