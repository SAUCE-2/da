package com.test.backend.repository.query;

import com.test.backend.entity.query.AuditQueryVersion;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditQueryVersionRepository extends JpaRepository<AuditQueryVersion, Long> {

	List<AuditQueryVersionSummary> findSummariesByAuditQueryIdOrderByVersionNumberDesc(Long auditQueryId);

	Optional<AuditQueryVersion> findByIdAndAuditQueryId(Long id, Long auditQueryId);

	interface AuditQueryVersionSummary {
		Long getId();

		int getVersionNumber();

		java.time.Instant getCreatedAt();
	}
}
