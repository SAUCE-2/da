package com.test.backend.mapper;

import com.test.backend.query.QueryDocumentParser;
import com.test.backend.query.QuerySqlRenderer;
import com.test.backend.dto.query.QuerySectionOutlineResponse;
import com.test.backend.dto.query.QueryVariableResponse;
import com.test.backend.dto.query.QueryVersionResponse;
import com.test.backend.entity.query.QueryVariable;
import com.test.backend.entity.query.QueryVersion;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface QueryVersionMapper {

	QueryVariableResponse toVariableResponse(QueryVariable variable);

	@Named("mapVariables")
	default List<QueryVariableResponse> mapVariables(QueryVersion version) {
		return version.getVariables().stream()
				.sorted(QuerySqlRenderer::compareVariables)
				.map(this::toVariableResponse)
				.toList();
	}

	@Named("mapSections")
	default List<QuerySectionOutlineResponse> mapSections(QueryVersion version) {
		return QueryDocumentParser.parse(version.getQueryText()).sections().stream()
				.map(section -> new QuerySectionOutlineResponse(
						section.name(),
						section.level(),
						section.startLine(),
						section.endLine()))
				.toList();
	}

	@Named("mapDefaultDisabledLines")
	default List<Integer> mapDefaultDisabledLines(QueryVersion version) {
		return QueryDocumentParser.parseDisabledLines(version.getDefaultDisabledLines());
	}

	@Mapping(target = "versionId", source = "id")
	@Mapping(target = "query", source = "queryText")
	@Mapping(target = "queryHash", source = "queryHash")
	@Mapping(target = "defaultDisabledLines", source = "version", qualifiedByName = "mapDefaultDisabledLines")
	@Mapping(target = "sections", source = "version", qualifiedByName = "mapSections")
	@Mapping(target = "variables", source = "version", qualifiedByName = "mapVariables")
	QueryVersionResponse toVersionResponse(QueryVersion version);
}
