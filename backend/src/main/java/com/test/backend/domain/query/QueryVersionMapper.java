package com.test.backend.domain.query;

import com.test.backend.entity.query.QueryVersion;
import com.test.backend.entity.query.QuerySection;
import com.test.backend.entity.query.QueryVariable;
import java.util.List;

import com.test.backend.dto.query.QuerySectionResponse;
import com.test.backend.dto.query.QueryVariableResponse;

public final class QueryVersionMapper {

	private QueryVersionMapper() {
	}

	public static List<QuerySectionResponse> mapSections(QueryVersion version) {
		return version.getSections().stream()
				.sorted(QuerySqlRenderer::compareSections)
				.map(QueryVersionMapper::toSectionResponse)
				.toList();
	}

	public static List<QueryVariableResponse> mapVariables(QueryVersion version) {
		return version.getVariables().stream()
				.sorted(QuerySqlRenderer::compareVariables)
				.map(QueryVersionMapper::toVariableResponse)
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
