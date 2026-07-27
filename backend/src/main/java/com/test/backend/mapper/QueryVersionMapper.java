package com.test.backend.mapper;

import com.test.backend.query.DisabledLines;
import com.test.backend.query.QueryVariables;
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
				.sorted(QueryVariables.BY_SORT_ORDER)
				.map(this::toVariableResponse)
				.toList();
	}

	@Named("mapDefaultDisabledLines")
	default List<Integer> mapDefaultDisabledLines(QueryVersion version) {
		return DisabledLines.parse(version.getDefaultDisabledLines()).toList();
	}

	@Mapping(target = "versionId", source = "id")
	@Mapping(target = "query", source = "queryText")
	@Mapping(target = "defaultDisabledLines", source = "version", qualifiedByName = "mapDefaultDisabledLines")
	@Mapping(target = "variables", source = "version", qualifiedByName = "mapVariables")
	QueryVersionResponse toVersionResponse(QueryVersion version);
}
