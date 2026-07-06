package com.test.backend.mapper;

import com.test.backend.domain.query.QuerySqlRenderer;
import com.test.backend.dto.query.QuerySectionResponse;
import com.test.backend.dto.query.QueryVariableResponse;
import com.test.backend.dto.query.QueryVersionResponse;
import com.test.backend.entity.query.QuerySection;
import com.test.backend.entity.query.QueryVariable;
import com.test.backend.entity.query.QueryVersion;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface QueryVersionMapper {

	QuerySectionResponse toSectionResponse(QuerySection section);

	QueryVariableResponse toVariableResponse(QueryVariable variable);

	@Named("mapSections")
	default List<QuerySectionResponse> mapSections(QueryVersion version) {
		return version.getSections().stream()
				.sorted(QuerySqlRenderer::compareSections)
				.map(this::toSectionResponse)
				.toList();
	}

	@Named("mapVariables")
	default List<QueryVariableResponse> mapVariables(QueryVersion version) {
		return version.getVariables().stream()
				.sorted(QuerySqlRenderer::compareVariables)
				.map(this::toVariableResponse)
				.toList();
	}

	@Mapping(target = "versionId", source = "id")
	@Mapping(target = "sections", source = "version", qualifiedByName = "mapSections")
	@Mapping(target = "variables", source = "version", qualifiedByName = "mapVariables")
	QueryVersionResponse toVersionResponse(QueryVersion version);
}
