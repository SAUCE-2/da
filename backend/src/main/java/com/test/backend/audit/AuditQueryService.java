package com.test.backend.audit;

import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.test.backend.audit.dto.AuditCategorySummaryResponse;
import com.test.backend.audit.dto.AuditQueryPreviewResponse;
import com.test.backend.audit.dto.AuditQueryRequest;
import com.test.backend.audit.dto.AuditQueryResponse;
import com.test.backend.audit.dto.QuerySectionRequest;
import com.test.backend.audit.dto.QuerySectionResponse;

@Service
public class AuditQueryService {

	private final AuditQueryRepository auditQueryRepository;
	private final AuditCategoryRepository auditCategoryRepository;

	public AuditQueryService(AuditQueryRepository auditQueryRepository, AuditCategoryRepository auditCategoryRepository) {
		this.auditQueryRepository = auditQueryRepository;
		this.auditCategoryRepository = auditCategoryRepository;
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
		applyRequest(auditQuery, request, List.of());
		return toResponse(auditQueryRepository.save(auditQuery));
	}

	@Transactional
	public AuditQueryResponse updateQuery(Long id, AuditQueryRequest request) {
		AuditQuery auditQuery = getQueryEntity(id);
		List<QuerySection> previousSections = auditQuery.getSections().stream()
				.sorted(AuditQuerySqlRenderer::compareSections)
				.toList();
		applyRequest(auditQuery, request, previousSections);
		return toResponse(auditQuery);
	}

	@Transactional
	public void deleteQuery(Long id) {
		if (!auditQueryRepository.existsById(id)) {
			throw notFound("Audit query not found: " + id);
		}
		auditQueryRepository.deleteById(id);
	}

	@Transactional(readOnly = true)
	public AuditQueryPreviewResponse previewQuery(Long id) {
		AuditQuery auditQuery = getQueryEntity(id);
		String sql = AuditQuerySqlRenderer.renderQuerySql(auditQuery.getSections(), true);
		return new AuditQueryPreviewResponse(auditQuery.getId(), sql);
	}

	private void applyRequest(AuditQuery auditQuery, AuditQueryRequest request, List<QuerySection> previousSections) {
		auditQuery.setName(request.name());
		auditQuery.setDescription(request.description());
		if (request.active() != null) {
			auditQuery.setActive(request.active());
		}
		auditQuery.replaceSections(toReplacementSections(request.sections(), previousSections));
		auditQuery.replaceCategories(resolveCategories(request.categoryIds()));
	}

	private List<QuerySection> toReplacementSections(
			List<QuerySectionRequest> requests,
			List<QuerySection> previousSections) {
		return java.util.stream.IntStream.range(0, requests.size())
				.mapToObj(index -> toEntity(
						requests.get(index),
						defaultEnabledForUpdate(requests.get(index), previousSections, index)))
				.toList();
	}

	private QuerySection toEntity(QuerySectionRequest request, boolean defaultEnabled) {
		return new QuerySection(
				request.name(),
				request.sqlFragment(),
				request.sortOrder(),
				defaultEnabled);
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
					.collect(java.util.stream.Collectors.toSet());
			List<Long> missingIds = requestedIds.stream()
					.filter(id -> !foundIds.contains(id))
					.toList();
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown audit category ids: " + missingIds);
		}

		return new LinkedHashSet<>(categories);
	}

	private AuditQuery getQueryEntity(Long id) {
		return auditQueryRepository.findById(id)
				.orElseThrow(() -> notFound("Audit query not found: " + id));
	}

	private AuditQueryResponse toResponse(AuditQuery auditQuery) {
		return new AuditQueryResponse(
				auditQuery.getId(),
				auditQuery.getName(),
				auditQuery.getDescription(),
				auditQuery.isActive(),
				auditQuery.getSections().stream()
						.sorted(AuditQuerySqlRenderer::compareSections)
						.map(this::toSectionResponse)
						.toList(),
				auditQuery.getCategories().stream()
						.sorted(Comparator.comparing(AuditCategory::getName).thenComparing(AuditCategory::getId))
						.map(this::toCategorySummaryResponse)
						.toList());
	}

	private QuerySectionResponse toSectionResponse(QuerySection section) {
		return new QuerySectionResponse(
				section.getId(),
				section.getName(),
				section.getSqlFragment(),
				section.getSortOrder(),
				section.isDefaultEnabled());
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
			List<QuerySection> previousSections,
			int index) {
		if (request.defaultEnabled() != null) {
			return request.defaultEnabled();
		}
		if (index < previousSections.size()) {
			return previousSections.get(index).isDefaultEnabled();
		}
		return true;
	}

	private static ResponseStatusException notFound(String message) {
		return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
	}
}
