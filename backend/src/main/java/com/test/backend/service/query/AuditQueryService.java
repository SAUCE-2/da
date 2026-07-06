package com.test.backend.service.query;

import com.test.backend.domain.query.AuditQuerySqlRenderer;
import com.test.backend.domain.query.AuditQueryVersionMapper;
import com.test.backend.domain.query.RenderedQuerySql;
import com.test.backend.entity.category.AuditCategory;
import com.test.backend.entity.query.AuditQuery;
import com.test.backend.entity.query.AuditQueryVersion;
import com.test.backend.entity.query.QuerySection;
import com.test.backend.entity.query.QueryVariable;
import com.test.backend.repository.category.AuditCategoryRepository;
import com.test.backend.repository.query.AuditQueryRepository;
import com.test.backend.repository.query.AuditQueryVersionRepository;
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

import com.test.backend.dto.category.AuditCategorySummaryResponse;
import com.test.backend.dto.query.AuditQueryPreviewRequest;
import com.test.backend.dto.query.AuditQueryPreviewResponse;
import com.test.backend.dto.query.AuditQueryRequest;
import com.test.backend.dto.query.AuditQueryResponse;
import com.test.backend.dto.query.AuditQueryVersionResponse;
import com.test.backend.dto.query.AuditQueryVersionSummaryResponse;
import com.test.backend.dto.query.QuerySectionRequest;
import com.test.backend.dto.query.QueryVariableRequest;

@Service
public class AuditQueryService {

	private final AuditQueryRepository auditQueryRepository;
	private final AuditQueryVersionRepository auditQueryVersionRepository;
	private final AuditCategoryRepository auditCategoryRepository;
	private final AuditQueryVersionResolver versionResolver;

	public AuditQueryService(
			AuditQueryRepository auditQueryRepository,
			AuditQueryVersionRepository auditQueryVersionRepository,
			AuditCategoryRepository auditCategoryRepository,
			AuditQueryVersionResolver versionResolver) {
		this.auditQueryRepository = auditQueryRepository;
		this.auditQueryVersionRepository = auditQueryVersionRepository;
		this.auditCategoryRepository = auditCategoryRepository;
		this.versionResolver = versionResolver;
	}

	@Transactional(readOnly = true)
	public List<AuditQueryResponse> listQueries() {
		return auditQueryRepository.findAllByOrderByNameAsc().stream()
				.map(this::toResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public AuditQueryResponse getQuery(Long id) {
		return toResponse(getQueryEntity(id));
	}

	@Transactional
	public AuditQueryResponse createQuery(AuditQueryRequest request) {
		AuditQuery auditQuery = new AuditQuery(request.name(), request.description(), activeOrDefault(request.active()));
		AuditQueryVersion version = auditQuery.addVersion(1);
		populateVersion(version, request, List.of(), Map.of(), List.of(), Map.of());
		auditQuery.replaceCategories(resolveCategories(request.categoryIds()));
		AuditQuery saved = auditQueryRepository.saveAndFlush(auditQuery);
		saved.setCurrentVersionId(version.getId());
		auditQueryRepository.save(saved);
		return toResponse(getQueryEntity(saved.getId()));
	}

	@Transactional
	public AuditQueryResponse updateQuery(Long id, AuditQueryRequest request) {
		AuditQuery auditQuery = getQueryEntity(id);
		AuditQueryVersion previousVersion = versionResolver.requireCurrentVersion(auditQuery);
		versionResolver.initializeGraph(previousVersion);
		List<QuerySection> previousSections = previousVersion.getSections().stream()
				.sorted(AuditQuerySqlRenderer::compareSections)
				.toList();
		List<QueryVariable> previousVariables = previousVersion.getVariables().stream()
				.sorted(AuditQuerySqlRenderer::compareVariables)
				.toList();
		Map<String, QuerySection> previousSectionsByName = previousSections.stream()
				.collect(Collectors.toMap(QuerySection::getName, Function.identity(), (left, right) -> left, LinkedHashMap::new));
		Map<String, QueryVariable> previousVariablesByName = previousVariables.stream()
				.collect(Collectors.toMap(QueryVariable::getName, Function.identity(), (left, right) -> left, LinkedHashMap::new));

		auditQuery.setName(request.name());
		auditQuery.setDescription(request.description());
		if (request.active() != null) {
			auditQuery.setActive(request.active());
		}
		auditQuery.replaceCategories(resolveCategories(request.categoryIds()));

		AuditQueryVersion nextVersion = auditQuery.addVersion(previousVersion.getVersionNumber() + 1);
		populateVersion(nextVersion, request, previousSections, previousSectionsByName, previousVariables, previousVariablesByName);

		AuditQuery saved = auditQueryRepository.saveAndFlush(auditQuery);
		saved.setCurrentVersionId(nextVersion.getId());
		auditQueryRepository.save(saved);
		return toResponse(getQueryEntity(saved.getId()));
	}

	@Transactional
	public void deleteQuery(Long id) {
		if (!auditQueryRepository.existsById(id)) {
			throw notFound("Audit query not found: " + id);
		}
		auditQueryRepository.deleteById(id);
	}

	@Transactional(readOnly = true)
	public List<AuditQueryVersionSummaryResponse> listVersions(Long id) {
		AuditQuery auditQuery = getQueryEntity(id);
		return auditQueryVersionRepository.findSummariesByAuditQueryIdOrderByVersionNumberDesc(auditQuery.getId()).stream()
				.map(summary -> new AuditQueryVersionSummaryResponse(
						summary.getId(),
						summary.getVersionNumber(),
						summary.getCreatedAt()))
				.toList();
	}

	@Transactional(readOnly = true)
	public AuditQueryVersionResponse getVersion(Long queryId, Long versionId) {
		AuditQueryVersion version = versionResolver.requireVersion(queryId, versionId);
		return toVersionResponse(version);
	}

	@Transactional(readOnly = true)
	public AuditQueryPreviewResponse previewQuery(Long id, AuditQueryPreviewRequest request) {
		AuditQuery auditQuery = getQueryEntity(id);
		Long versionId = request == null ? null : request.versionId();
		AuditQueryVersion version = versionResolver.requireVersion(auditQuery, versionId);
		Map<String, String> variables = request == null || request.variables() == null ? Map.of() : request.variables();
		RenderedQuerySql rendered = AuditQuerySqlRenderer.renderVersionSql(version, true, variables);
		return new AuditQueryPreviewResponse(
				auditQuery.getId(),
				version.getId(),
				rendered.sql(),
				List.of());
	}

	private void populateVersion(
			AuditQueryVersion version,
			AuditQueryRequest request,
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

	private List<QueryVariableRequest> variableRequestsOrEmpty(AuditQueryRequest request) {
		return request.variables() == null ? List.of() : request.variables();
	}

	private Set<AuditCategory> resolveCategories(List<Long> categoryIds) {
		if (categoryIds == null || categoryIds.isEmpty()) {
			return Set.of();
		}

		LinkedHashSet<Long> requestedIds = new LinkedHashSet<>(categoryIds);
		List<AuditCategory> categories = auditCategoryRepository.findAllById(requestedIds);
		if (categories.size() != requestedIds.size()) {
			Set<Long> foundIds = categories.stream()
					.map(AuditCategory::getId)
					.collect(Collectors.toSet());
			List<Long> missingIds = requestedIds.stream()
					.filter(id -> !foundIds.contains(id))
					.toList();
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown audit category ids: " + missingIds);
		}

		return new LinkedHashSet<>(categories);
	}

	private AuditQuery getQueryEntity(Long id) {
		AuditQuery auditQuery = auditQueryRepository.findById(id)
				.orElseThrow(() -> notFound("Audit query not found: " + id));
		auditQuery.getCategories().size();
		versionResolver.initializeGraph(versionResolver.requireCurrentVersion(auditQuery));
		return auditQuery;
	}

	private AuditQueryResponse toResponse(AuditQuery auditQuery) {
		AuditQueryVersion currentVersion = versionResolver.requireCurrentVersion(auditQuery);
		versionResolver.initializeGraph(currentVersion);
		return new AuditQueryResponse(
				auditQuery.getId(),
				auditQuery.getName(),
				auditQuery.getDescription(),
				auditQuery.isActive(),
				currentVersion.getId(),
				currentVersion.getVersionNumber(),
				AuditQueryVersionMapper.mapSections(currentVersion),
				AuditQueryVersionMapper.mapVariables(currentVersion),
				auditQuery.getCategories().stream()
						.sorted(Comparator.comparing(AuditCategory::getName).thenComparing(AuditCategory::getId))
						.map(this::toCategorySummaryResponse)
						.toList());
	}

	private AuditQueryVersionResponse toVersionResponse(AuditQueryVersion version) {
		versionResolver.initializeGraph(version);
		return new AuditQueryVersionResponse(
				version.getId(),
				version.getVersionNumber(),
				version.getCreatedAt(),
				AuditQueryVersionMapper.mapSections(version),
				AuditQueryVersionMapper.mapVariables(version));
	}

	private AuditCategorySummaryResponse toCategorySummaryResponse(AuditCategory category) {
		return new AuditCategorySummaryResponse(
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
