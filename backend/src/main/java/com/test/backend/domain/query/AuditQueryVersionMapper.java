package com.test.backend.domain.query;

import com.test.backend.entity.query.AuditQueryVersion;
import com.test.backend.entity.query.QuerySection;
import com.test.backend.entity.query.QueryVariable;
import java.util.List;

import com.test.backend.dto.query.QuerySectionResponse;
import com.test.backend.dto.query.QueryVariableResponse;

public final class AuditQueryVersionMapper {

	private AuditQueryVersionMapper() {
	}

	public static List<QuerySectionResponse> mapSections(AuditQueryVersion version) {
		return version.getSections().stream()
				.sorted(AuditQuerySqlRenderer::compareSections)
				.map(AuditQueryVersionMapper::toSectionResponse)
				.toList();
	}

	public static List<QueryVariableResponse> mapVariables(AuditQueryVersion version) {
		return version.getVariables().stream()
				.sorted(AuditQuerySqlRenderer::compareVariables)
				.map(AuditQueryVersionMapper::toVariableResponse)
				.toList();
	}

	private static QuerySectionResponse toSectionResponse(QuerySection section) {
		return new QuerySectionResponse(
				section.getId(),
				section.getName(),
				section.getSqlFragment(),
				section.getSortOrder(),
				section.isDefaultEnabled());
	}

	private static QueryVariableResponse toVariableResponse(QueryVariable variable) {
		return new QueryVariableResponse(
				variable.getId(),
				variable.getName(),
				variable.getType(),
				variable.getDefaultValue(),
				variable.isRequired(),
				variable.getSortOrder());
	}
}
