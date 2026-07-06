package com.test.backend.repository.query;

import com.test.backend.entity.query.QueryVersion;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface QueryVersionRepository extends JpaRepository<QueryVersion, Long> {

	List<QueryVersionSummary> findSummariesByQueryIdOrderByVersionNumberDesc(Long queryId);

	Optional<QueryVersion> findByIdAndQueryId(Long id, Long queryId);

	interface QueryVersionSummary {
		Long getId();

		int getVersionNumber();

		java.time.Instant getCreatedAt();
	}
}
