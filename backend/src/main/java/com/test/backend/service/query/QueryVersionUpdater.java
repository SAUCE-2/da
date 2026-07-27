package com.test.backend.service.query;

import com.test.backend.query.DisabledLines;
import com.test.backend.query.SqlText;
import com.test.backend.query.QueryVariables;
import com.test.backend.dto.query.QueryRequest;
import com.test.backend.dto.query.QueryVariableRequest;
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
			List<QueryVariable> previousVariables,
			Map<String, QueryVariable> previousVariablesByName) {
		String query = SqlText.normalize(request.query() == null ? "" : request.query());
		version.setName(request.name());
		version.setDescription(request.description());
		version.setQueryText(query);
		version.setDefaultDisabledLines(DisabledLines.of(request.defaultDisabledLines()).format());
		version.replaceVariables(toReplacementVariables(
				variableRequestsOrEmpty(request),
				previousVariables,
				previousVariablesByName));
	}

	private List<QueryVariable> toReplacementVariables(
			List<QueryVariableRequest> requests,
			List<QueryVariable> previousVariables,
			Map<String, QueryVariable> previousVariablesByName) {
		return java.util.stream.IntStream.range(0, requests.size())
				.mapToObj(index -> {
					QueryVariableRequest request = requests.get(index);
					boolean required = resolveInheritedBoolean(
							request.required(),
							request.name(),
							previousVariablesByName,
							previousVariables,
							index,
							QueryVariable::isRequired,
							false);
					return toVariableEntity(request, required);
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

	public Map<String, QueryVariable> indexVariablesByName(List<QueryVariable> variables) {
		return variables.stream()
				.collect(java.util.stream.Collectors.toMap(
						QueryVariable::getName,
						Function.identity(),
						(left, right) -> left,
						LinkedHashMap::new));
	}

	public List<QueryVariable> sortedVariables(QueryVersion version) {
		return version.getVariables().stream()
				.sorted(QueryVariables.BY_SORT_ORDER)
				.toList();
	}
}
