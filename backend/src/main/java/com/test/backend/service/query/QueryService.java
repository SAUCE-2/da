package com.test.backend.service.query;

import com.test.backend.query.QueryDocumentParser;
import com.test.backend.query.QueryLineRemapper;
import com.test.backend.query.QuerySqlRenderer;
import com.test.backend.dto.query.QueryPreviewRequest;
import com.test.backend.dto.query.QueryPreviewResponse;
import com.test.backend.dto.query.QueryRequest;
import com.test.backend.dto.query.QueryResponse;
import com.test.backend.dto.query.QueryVersionDiffResponse;
import com.test.backend.dto.query.QueryVersionResponse;
import com.test.backend.dto.query.QueryVersionSummaryResponse;
import com.test.backend.entity.category.Category;
import com.test.backend.entity.query.Query;
import com.test.backend.entity.query.QueryVariable;
import com.test.backend.entity.query.QueryVersion;
import com.test.backend.mapper.QueryMapper;
import com.test.backend.mapper.QueryVersionMapper;
import com.test.backend.repository.category.CategoryRepository;
import com.test.backend.repository.query.QueryRepository;
import com.test.backend.repository.query.QueryVersionRepository;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static com.test.backend.service.ServiceSupport.activeOrDefault;
import static com.test.backend.service.ServiceSupport.notFound;

@Service
@RequiredArgsConstructor
public class QueryService {

	private final QueryRepository queryRepository;
	private final QueryVersionRepository queryVersionRepository;
	private final CategoryRepository categoryRepository;
	private final QueryVersionResolver versionResolver;
	private final QueryVersionUpdater versionUpdater;
	private final QueryMapper queryMapper;
	private final QueryVersionMapper queryVersionMapper;

	@Transactional(readOnly = true)
	public List<QueryResponse> listQueries() {
		return queryRepository.findAllWithCategoriesByOrderByNameAsc().stream()
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
		versionUpdater.populateVersion(version, request, List.of(), Map.of());
		query.replaceCategories(resolveCategories(request.categoryIds()));
		Query saved = queryRepository.saveAndFlush(query);
		QueryVersion persistedVersion = saved.getVersions().stream()
				.filter(candidate -> candidate.getVersionNumber() == 1)
				.findFirst()
				.orElse(version);
		saved.setCurrentVersionId(persistedVersion.getId());
		queryRepository.save(saved);
		return queryMapper.toResponse(saved, persistedVersion);
	}

	@Transactional
	public QueryResponse updateQuery(Long id, QueryRequest request) {
		Query query = getQueryEntity(id);
		QueryVersion previousVersion = versionResolver.requireCurrentVersion(query);
		List<QueryVariable> previousVariables = versionUpdater.sortedVariables(previousVersion);

		query.setName(request.name());
		query.setDescription(request.description());
		if (request.active() != null) {
			query.setActive(request.active());
		}
		query.replaceCategories(resolveCategories(request.categoryIds()));

		int nextNumber = previousVersion.getVersionNumber() + 1;
		QueryVersion nextVersion = query.addVersion(nextNumber);
		versionUpdater.populateVersion(
				nextVersion,
				request,
				previousVariables,
				versionUpdater.indexVariablesByName(previousVariables));

		Query saved = queryRepository.saveAndFlush(query);
		QueryVersion persistedVersion = saved.getVersions().stream()
				.filter(candidate -> candidate.getVersionNumber() == nextNumber)
				.findFirst()
				.orElse(nextVersion);
		saved.setCurrentVersionId(persistedVersion.getId());
		queryRepository.save(saved);
		return queryMapper.toResponse(saved, persistedVersion);
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
		return queryVersionMapper.toVersionResponse(version);
	}

	@Transactional(readOnly = true)
	public QueryVersionDiffResponse diffVersions(Long queryId, Long fromVersionId, Long toVersionId) {
		QueryVersion from = versionResolver.requireVersion(queryId, fromVersionId);
		QueryVersion to = versionResolver.requireVersion(queryId, toVersionId);
		List<QueryVersionDiffResponse.DiffLine> lines = QueryLineRemapper.diffQueries(
						from.getQueryText(),
						to.getQueryText())
				.stream()
				.map(line -> new QueryVersionDiffResponse.DiffLine(
						line.op().name(),
						line.text(),
						line.fromLine(),
						line.toLine()))
				.toList();
		return new QueryVersionDiffResponse(
				from.getId(),
				from.getVersionNumber(),
				to.getId(),
				to.getVersionNumber(),
				from.getQueryText(),
				to.getQueryText(),
				lines);
	}

	@Transactional(readOnly = true)
	public QueryPreviewResponse previewQuery(Long id, QueryPreviewRequest request) {
		Query query = getQueryEntity(id);
		Long versionId = request == null ? null : request.versionId();
		QueryVersion version = versionResolver.requireVersion(query, versionId);
		Map<String, String> variables = request == null || request.variables() == null ? Map.of() : request.variables();
		List<Integer> disabledLines = request == null || request.disabledLines() == null
				? QueryDocumentParser.parseDisabledLines(version.getDefaultDisabledLines())
				: request.disabledLines();
		QuerySqlRenderer.PreviewSql preview = QuerySqlRenderer.renderPreviewSql(version, disabledLines, variables);
		return new QueryPreviewResponse(
				query.getId(),
				version.getId(),
				preview.sql(),
				preview.unresolvedVariables());
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
					.filter(categoryId -> !foundIds.contains(categoryId))
					.toList();
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown category ids: " + missingIds);
		}

		return new LinkedHashSet<>(categories);
	}

	private Query getQueryEntity(Long id) {
		return queryRepository.findWithCategoriesById(id)
				.orElseThrow(() -> notFound("Query not found: " + id));
	}

	private QueryResponse toResponse(Query query) {
		QueryVersion currentVersion = versionResolver.requireCurrentVersion(query);
		return queryMapper.toResponse(query, currentVersion);
	}
}
