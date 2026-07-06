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

import com.test.backend.service.query.AuditQueryService;
import com.test.backend.dto.query.AuditQueryPreviewRequest;
import com.test.backend.dto.query.AuditQueryPreviewResponse;
import com.test.backend.dto.query.AuditQueryRequest;
import com.test.backend.dto.query.AuditQueryResponse;
import com.test.backend.dto.query.AuditQueryVersionResponse;
import com.test.backend.dto.query.AuditQueryVersionSummaryResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/audit-queries")
public class AuditQueryController {

	private final AuditQueryService auditQueryService;

	public AuditQueryController(AuditQueryService auditQueryService) {
		this.auditQueryService = auditQueryService;
	}

	@GetMapping
	public List<AuditQueryResponse> listQueries() {
		return auditQueryService.listQueries();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public AuditQueryResponse createQuery(@Valid @RequestBody AuditQueryRequest request) {
		return auditQueryService.createQuery(request);
	}

	@GetMapping("/{id}")
	public AuditQueryResponse getQuery(@PathVariable Long id) {
		return auditQueryService.getQuery(id);
	}

	@PutMapping("/{id}")
	public AuditQueryResponse updateQuery(@PathVariable Long id, @Valid @RequestBody AuditQueryRequest request) {
		return auditQueryService.updateQuery(id, request);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteQuery(@PathVariable Long id) {
		auditQueryService.deleteQuery(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/{id}/versions")
	public List<AuditQueryVersionSummaryResponse> listVersions(@PathVariable Long id) {
		return auditQueryService.listVersions(id);
	}

	@GetMapping("/{id}/versions/{versionId}")
	public AuditQueryVersionResponse getVersion(@PathVariable Long id, @PathVariable Long versionId) {
		return auditQueryService.getVersion(id, versionId);
	}

	@PostMapping("/{id}/preview")
	public AuditQueryPreviewResponse previewQuery(
			@PathVariable Long id,
			@RequestBody(required = false) AuditQueryPreviewRequest request) {
		return auditQueryService.previewQuery(id, request);
	}
}
