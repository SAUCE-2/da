package com.test.backend.service.query;

import com.test.backend.domain.query.QuerySqlRenderer;
import com.test.backend.domain.query.QueryVersionMapper;
import com.test.backend.domain.query.RenderedQuerySql;
import com.test.backend.entity.category.Category;
import com.test.backend.entity.query.Query;
import com.test.backend.entity.query.QueryVersion;
import com.test.backend.entity.query.QuerySection;
import com.test.backend.entity.query.QueryVariable;
import com.test.backend.repository.category.CategoryRepository;
import com.test.backend.repository.query.QueryRepository;
import com.test.backend.repository.query.QueryVersionRepository;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.test.backend.dto.category.CategorySummaryResponse;
import com.test.backend.dto.query.QueryPreviewRequest;
import com.test.backend.dto.query.QueryPreviewResponse;
import com.test.backend.dto.query.QueryRequest;
import com.test.backend.dto.query.QueryResponse;
import com.test.backend.dto.query.QueryVersionResponse;
import com.test.backend.dto.query.QueryVersionSummaryResponse;
import com.test.backend.dto.query.QuerySectionRequest;
import com.test.backend.dto.query.QueryVariableRequest;

@Service
public class QueryService {

	private final QueryRepository queryRepository;
	private final QueryVersionRepository queryVersionRepository;
	private final CategoryRepository categoryRepository;
	private final QueryVersionResolver versionResolver;

	public QueryService(
			QueryRepository queryRepository,
			QueryVersionRepository queryVersionRepository,
			CategoryRepository categoryRepository,
			QueryVersionResolver versionResolver) {
		this.queryRepository = queryRepository;
		this.queryVersionRepository = queryVersionRepository;
		this.categoryRepository = categoryRepository;
		this.versionResolver = versionResolver;
	}

	@Transactional(readOnly = true)
	public List<QueryResponse> listQueries() {
		return queryRepository.findAllByOrderByNameAsc().stream()
				.map(this::toResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public QueryResponse getQuery(Long id) {
		return toResponse(getQueryEntity(id));
	}

	@Transactional
	public QueryResponse createQuery(QueryRequest request) {
		Query query = new Query(request.name(), request.description(), activeOrDefault(request.active()));
		QueryVersion version = query.addVersion(1);
		populateVersion(version, request, List.of(), Map.of(), List.of(), Map.of());
		query.replaceCategories(resolveCategories(request.categoryIds()));
		Query saved = queryRepository.saveAndFlush(query);
		saved.setCurrentVersionId(version.getId());
		queryRepository.save(saved);
		return toResponse(getQueryEntity(saved.getId()));
	}

	@Transactional
	public QueryResponse updateQuery(Long id, QueryRequest request) {
		Query query = getQueryEntity(id);
		QueryVersion previousVersion = versionResolver.requireCurrentVersion(query);
		versionResolver.initializeGraph(previousVersion);
		List<QuerySection> previousSections = previousVersion.getSections().stream()
				.sorted(QuerySqlRenderer::compareSections)
				.toList();
		List<QueryVariable> previousVariables = previousVersion.getVariables().stream()
				.sorted(QuerySqlRenderer::compareVariables)
				.toList();
		Map<String, QuerySection> previousSectionsByName = previousSections.stream()
				.collect(Collectors.toMap(QuerySection::getName, Function.identity(), (left, right) -> left, LinkedHashMap::new));
		Map<String, QueryVariable> previousVariablesByName = previousVariables.stream()
				.collect(Collectors.toMap(QueryVariable::getName, Function.identity(), (left, right) -> left, LinkedHashMap::new));

		query.setName(request.name());
		query.setDescription(request.description());
		if (request.active() != null) {
			query.setActive(request.active());
		}
		query.replaceCategories(resolveCategories(request.categoryIds()));

		QueryVersion nextVersion = query.addVersion(previousVersion.getVersionNumber() + 1);
		populateVersion(nextVersion, request, previousSections, previousSectionsByName, previousVariables, previousVariablesByName);

		Query saved = queryRepository.saveAndFlush(query);
		saved.setCurrentVersionId(nextVersion.getId());
		queryRepository.save(saved);
		return toResponse(getQueryEntity(saved.getId()));
	}

	@Transactional
	public void deleteQuery(Long id) {
		if (!queryRepository.existsById(id)) {
			throw notFound("Query not found: " + id);
		}
		queryRepository.deleteById(id);
	}

	@Transactional(readOnly = true)
	public List<QueryVersionSummaryResponse> listVersions(Long id) {
		Query query = getQueryEntity(id);
		return queryVersionRepository.findSummariesByQueryIdOrderByVersionNumberDesc(query.getId()).stream()
				.map(summary -> new QueryVersionSummaryResponse(
						summary.getId(),
						summary.getVersionNumber(),
						summary.getCreatedAt()))
				.toList();
	}

	@Transactional(readOnly = true)
	public QueryVersionResponse getVersion(Long queryId, Long versionId) {
		QueryVersion version = versionResolver.requireVersion(queryId, versionId);
		return toVersionResponse(version);
	}

	@Transactional(readOnly = true)
	public QueryPreviewResponse previewQuery(Long id, QueryPreviewRequest request) {
		Query query = getQueryEntity(id);
		Long versionId = request == null ? null : request.versionId();
		QueryVersion version = versionResolver.requireVersion(query, versionId);
		Map<String, String> variables = request == null || request.variables() == null ? Map.of() : request.variables();
		RenderedQuerySql rendered = QuerySqlRenderer.renderVersionSql(version, true, variables);
		return new QueryPreviewResponse(
				query.getId(),
				version.getId(),
				rendered.sql(),
				List.of());
	}

	private void populateVersion(
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
		return java.util.stream.IntStream.range(0, requests.size())
				.mapToObj(index -> toSectionEntity(
						requests.get(index),
						defaultEnabledForUpdate(
								requests.get(index),
								previousSectionsByName,
								previousSections,
								index)))
				.toList();
	}

	private List<QueryVariable> toReplacementVariables(
			List<QueryVariableRequest> requests,
			List<QueryVariable> previousVariables,
			Map<String, QueryVariable> previousVariablesByName) {
		return java.util.stream.IntStream.range(0, requests.size())
				.mapToObj(index -> toVariableEntity(
						requests.get(index),
						requiredForUpdate(
								requests.get(index),
								previousVariablesByName,
								previousVariables,
								index)))
				.toList();
	}

	private QuerySection toSectionEntity(QuerySectionRequest request, boolean defaultEnabled) {
		return new QuerySection(
				request.name(),
				request.sqlFragment(),
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

	private Set<Category> resolveCategories(List<Long> categoryIds) {
		if (categoryIds == null || categoryIds.isEmpty()) {
			return Set.of();
		}

		LinkedHashSet<Long> requestedIds = new LinkedHashSet<>(categoryIds);
		List<Category> categories = categoryRepository.findAllById(requestedIds);
		if (categories.size() != requestedIds.size()) {
			Set<Long> foundIds = categories.stream()
					.map(Category::getId)
					.collect(Collectors.toSet());
			List<Long> missingIds = requestedIds.stream()
					.filter(id -> !foundIds.contains(id))
					.toList();
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown category ids: " + missingIds);
		}

		return new LinkedHashSet<>(categories);
	}

	private Query getQueryEntity(Long id) {
		Query query = queryRepository.findById(id)
				.orElseThrow(() -> notFound("Query not found: " + id));
		query.getCategories().size();
		versionResolver.initializeGraph(versionResolver.requireCurrentVersion(query));
		return query;
	}

	private QueryResponse toResponse(Query query) {
		QueryVersion currentVersion = versionResolver.requireCurrentVersion(query);
		versionResolver.initializeGraph(currentVersion);
		return new QueryResponse(
				query.getId(),
				query.getName(),
				query.getDescription(),
				query.isActive(),
				currentVersion.getId(),
				currentVersion.getVersionNumber(),
				QueryVersionMapper.mapSections(currentVersion),
				QueryVersionMapper.mapVariables(currentVersion),
				query.getCategories().stream()
						.sorted(Comparator.comparing(Category::getName).thenComparing(Category::getId))
						.map(this::toCategorySummaryResponse)
						.toList());
	}

	private QueryVersionResponse toVersionResponse(QueryVersion version) {
		versionResolver.initializeGraph(version);
		return new QueryVersionResponse(
				version.getId(),
				version.getVersionNumber(),
				version.getCreatedAt(),
				QueryVersionMapper.mapSections(version),
				QueryVersionMapper.mapVariables(version));
	}

	private CategorySummaryResponse toCategorySummaryResponse(Category category) {
		return new CategorySummaryResponse(
				category.getId(),
				category.getName(),
				category.getDescription());
	}

	private static boolean activeOrDefault(Boolean active) {
		return active == null || active;
	}

	private static boolean defaultEnabledForUpdate(
			QuerySectionRequest request,
			Map<String, QuerySection> previousSectionsByName,
			List<QuerySection> previousSections,
			int index) {
		if (request.defaultEnabled() != null) {
			return request.defaultEnabled();
		}
		QuerySection previousByName = previousSectionsByName.get(request.name());
		if (previousByName != null) {
			return previousByName.isDefaultEnabled();
		}
		return findPreviousSection(previousSections, request.name(), index)
				.map(QuerySection::isDefaultEnabled)
				.orElse(true);
	}

	private static boolean requiredForUpdate(
			QueryVariableRequest request,
			Map<String, QueryVariable> previousVariablesByName,
			List<QueryVariable> previousVariables,
			int index) {
		if (request.required() != null) {
			return request.required();
		}
		QueryVariable previousByName = previousVariablesByName.get(request.name());
		if (previousByName != null) {
			return previousByName.isRequired();
		}
		return findPreviousVariable(previousVariables, request.name(), index)
				.map(QueryVariable::isRequired)
				.orElse(false);
	}

	private static Optional<QuerySection> findPreviousSection(
			List<QuerySection> previousSections,
			String name,
			int index) {
		if (index < previousSections.size()) {
			return Optional.of(previousSections.get(index));
		}
		return Optional.empty();
	}

	private static Optional<QueryVariable> findPreviousVariable(
			List<QueryVariable> previousVariables,
			String name,
			int index) {
		if (index < previousVariables.size()) {
			return Optional.of(previousVariables.get(index));
		}
		return Optional.empty();
	}

	private static ResponseStatusException notFound(String message) {
		return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
	}
}
