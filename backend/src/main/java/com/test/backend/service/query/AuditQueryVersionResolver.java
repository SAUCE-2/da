package com.test.backend.service.query;

import com.test.backend.entity.query.AuditQuery;
import com.test.backend.entity.query.AuditQueryVersion;
import com.test.backend.repository.query.AuditQueryVersionRepository;
import java.util.Comparator;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class AuditQueryVersionResolver {

	private final AuditQueryVersionRepository auditQueryVersionRepository;

	public AuditQueryVersionResolver(AuditQueryVersionRepository auditQueryVersionRepository) {
		this.auditQueryVersionRepository = auditQueryVersionRepository;
	}

	public AuditQueryVersion requireCurrentVersion(AuditQuery auditQuery) {
		Long versionId = auditQuery.getCurrentVersionId();
		if (versionId != null) {
			return auditQueryVersionRepository.findById(versionId)
					.orElseGet(() -> latestVersion(auditQuery));
		}
		return latestVersion(auditQuery);
	}

	public AuditQueryVersion requireVersion(AuditQuery auditQuery, Long versionId) {
		if (versionId == null) {
			return requireCurrentVersion(auditQuery);
		}
		return requireVersion(auditQuery.getId(), versionId);
	}

	public AuditQueryVersion requireVersion(Long queryId, Long versionId) {
		AuditQueryVersion version = auditQueryVersionRepository.findByIdAndAuditQueryId(versionId, queryId)
				.orElseThrow(() -> notFound("Audit query version not found: " + versionId));
		initializeGraph(version);
		return version;
	}

	public void initializeGraph(AuditQueryVersion version) {
		version.getSections().size();
		version.getVariables().size();
	}

	private AuditQueryVersion latestVersion(AuditQuery auditQuery) {
		auditQuery.getVersions().size();
		return auditQuery.getVersions().stream()
				.max(Comparator.comparingInt(AuditQueryVersion::getVersionNumber))
				.orElseThrow(() -> new ResponseStatusException(
						HttpStatus.INTERNAL_SERVER_ERROR,
						"Audit query has no current version: " + auditQuery.getId()));
	}

	private static ResponseStatusException notFound(String message) {
		return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
	}
}
