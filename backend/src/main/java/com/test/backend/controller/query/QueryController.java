package com.test.backend.controller.query;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.test.backend.service.query.QueryService;
import com.test.backend.dto.query.QueryPreviewRequest;
import com.test.backend.dto.query.QueryPreviewResponse;
import com.test.backend.dto.query.QueryRequest;
import com.test.backend.dto.query.QueryResponse;
import com.test.backend.dto.query.QueryVersionResponse;
import com.test.backend.dto.query.QueryVersionSummaryResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/queries")
public class QueryController {

	private final QueryService queryService;

	public QueryController(QueryService queryService) {
		this.queryService = queryService;
	}

	@GetMapping
	public List<QueryResponse> listQueries() {
		return queryService.listQueries();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public QueryResponse createQuery(@Valid @RequestBody QueryRequest request) {
		return queryService.createQuery(request);
	}

	@GetMapping("/{id}")
	public QueryResponse getQuery(@PathVariable Long id) {
		return queryService.getQuery(id);
	}

	@PutMapping("/{id}")
	public QueryResponse updateQuery(@PathVariable Long id, @Valid @RequestBody QueryRequest request) {
		return queryService.updateQuery(id, request);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteQuery(@PathVariable Long id) {
		queryService.deleteQuery(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/{id}/versions")
	public List<QueryVersionSummaryResponse> listVersions(@PathVariable Long id) {
		return queryService.listVersions(id);
	}

	@GetMapping("/{id}/versions/{versionId}")
	public QueryVersionResponse getVersion(@PathVariable Long id, @PathVariable Long versionId) {
		return queryService.getVersion(id, versionId);
	}

	@PostMapping("/{id}/preview")
	public QueryPreviewResponse previewQuery(
			@PathVariable Long id,
			@RequestBody(required = false) QueryPreviewRequest request) {
		return queryService.previewQuery(id, request);
	}
}
