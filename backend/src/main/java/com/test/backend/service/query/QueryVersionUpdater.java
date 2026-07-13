package com.test.backend.service.query;

import com.test.backend.query.QuerySqlRenderer;
import com.test.backend.dto.query.QueryRequest;
import com.test.backend.dto.query.QuerySectionRequest;
import com.test.backend.dto.query.QueryVariableRequest;
import com.test.backend.entity.query.QuerySection;
import com.test.backend.entity.query.QueryVariable;
import com.test.backend.entity.query.QueryVersion;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import org.springframework.stereotype.Component;

@Component
public class QueryVersionUpdater {

	public void populateVersion(
			QueryVersion version,
			QueryRequest request,
			List<QuerySection> previousSections,
			Map<String, QuerySection> previousSectionsByName,
			List<QueryVariable> previousVariables,
			Map<String, QueryVariable> previousVariablesByName) {
		version.replaceSections(toReplacementSections(request.sections(), previousSections, previousSectionsByName));
		version.replaceVariables(toReplacementVariables(
				variableRequestsOrEmpty(request),
				previousVariables,
				previousVariablesByName));
	}

	private List<QuerySection> toReplacementSections(
			List<QuerySectionRequest> requests,
			List<QuerySection> previousSections,
			Map<String, QuerySection> previousSectionsByName) {
		return mapReplacementEntities(
				requests,
				previousSections,
				previousSectionsByName,
				QuerySectionRequest::name,
				QuerySectionRequest::defaultEnabled,
				QuerySection::isDefaultEnabled,
				true,
				this::toSectionEntity);
	}

	private List<QueryVariable> toReplacementVariables(
			List<QueryVariableRequest> requests,
			List<QueryVariable> previousVariables,
			Map<String, QueryVariable> previousVariablesByName) {
		return mapReplacementEntities(
				requests,
				previousVariables,
				previousVariablesByName,
				QueryVariableRequest::name,
				QueryVariableRequest::required,
				QueryVariable::isRequired,
				false,
				this::toVariableEntity);
	}

	private <TRequest, TEntity> List<TEntity> mapReplacementEntities(
			List<TRequest> requests,
			List<TEntity> previousEntities,
			Map<String, TEntity> previousEntitiesByName,
			Function<TRequest, String> nameExtractor,
			Function<TRequest, Boolean> explicitValueExtractor,
			Function<TEntity, Boolean> previousValueExtractor,
			boolean defaultWhenMissing,
			BiEntityMapper<TRequest, TEntity> mapper) {
		return java.util.stream.IntStream.range(0, requests.size())
				.mapToObj(index -> {
					TRequest request = requests.get(index);
					boolean resolvedValue = resolveInheritedBoolean(
							explicitValueExtractor.apply(request),
							nameExtractor.apply(request),
							previousEntitiesByName,
							previousEntities,
							index,
							previousValueExtractor,
							defaultWhenMissing);
					return mapper.map(request, resolvedValue);
				})
				.toList();
	}

	private static <TEntity> boolean resolveInheritedBoolean(
			Boolean explicitValue,
			String name,
			Map<String, TEntity> previousEntitiesByName,
			List<TEntity> previousEntities,
			int index,
			Function<TEntity, Boolean> previousValueExtractor,
			boolean defaultWhenMissing) {
		if (explicitValue != null) {
			return explicitValue;
		}
		TEntity previousByName = previousEntitiesByName.get(name);
		if (previousByName != null) {
			return previousValueExtractor.apply(previousByName);
		}
		return findPreviousByIndex(previousEntities, index)
				.map(previousValueExtractor)
				.orElse(defaultWhenMissing);
	}

	private static <TEntity> Optional<TEntity> findPreviousByIndex(
			List<TEntity> previousEntities,
			int index) {
		if (index < previousEntities.size()) {
			return Optional.of(previousEntities.get(index));
		}
		return Optional.empty();
	}

	private QuerySection toSectionEntity(QuerySectionRequest request, boolean defaultEnabled) {
		return new QuerySection(
				request.name(),
				QuerySqlRenderer.trimFragmentBoundaries(request.sqlFragment()),
				request.sortOrder(),
				defaultEnabled);
	}

	private QueryVariable toVariableEntity(QueryVariableRequest request, boolean required) {
		return new QueryVariable(
				request.name(),
				request.type(),
				request.defaultValue(),
				required,
				request.sortOrder());
	}

	private List<QueryVariableRequest> variableRequestsOrEmpty(QueryRequest request) {
		return request.variables() == null ? List.of() : request.variables();
	}

	public Map<String, QuerySection> indexSectionsByName(List<QuerySection> sections) {
		return sections.stream()
				.collect(java.util.stream.Collectors.toMap(
						QuerySection::getName,
						Function.identity(),
						(left, right) -> left,
						LinkedHashMap::new));
	}

	public Map<String, QueryVariable> indexVariablesByName(List<QueryVariable> variables) {
		return variables.stream()
				.collect(java.util.stream.Collectors.toMap(
						QueryVariable::getName,
						Function.identity(),
						(left, right) -> left,
						LinkedHashMap::new));
	}

	public List<QuerySection> sortedSections(QueryVersion version) {
		return version.getSections().stream()
				.sorted(QuerySqlRenderer::compareSections)
				.toList();
	}

	public List<QueryVariable> sortedVariables(QueryVersion version) {
		return version.getVariables().stream()
				.sorted(QuerySqlRenderer::compareVariables)
				.toList();
	}

	@FunctionalInterface
	private interface BiEntityMapper<TRequest, TEntity> {
		TEntity map(TRequest request, boolean resolvedValue);
	}
}
