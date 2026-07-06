package com.test.backend.service.query;

import com.test.backend.entity.query.Query;
import com.test.backend.entity.query.QueryVersion;
import com.test.backend.repository.query.QueryVersionRepository;
import java.util.Comparator;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class QueryVersionResolver {

	private final QueryVersionRepository queryVersionRepository;

	public QueryVersionResolver(QueryVersionRepository queryVersionRepository) {
		this.queryVersionRepository = queryVersionRepository;
	}

	public QueryVersion requireCurrentVersion(Query query) {
		Long versionId = query.getCurrentVersionId();
		if (versionId != null) {
			return queryVersionRepository.findById(versionId)
					.orElseGet(() -> latestVersion(query));
		}
		return latestVersion(query);
	}

	public QueryVersion requireVersion(Query query, Long versionId) {
		if (versionId == null) {
			return requireCurrentVersion(query);
		}
		return requireVersion(query.getId(), versionId);
	}

	public QueryVersion requireVersion(Long queryId, Long versionId) {
		QueryVersion version = queryVersionRepository.findByIdAndQueryId(versionId, queryId)
				.orElseThrow(() -> notFound("Query version not found: " + versionId));
		initializeGraph(version);
		return version;
	}

	public void initializeGraph(QueryVersion version) {
		version.getSections().size();
		version.getVariables().size();
	}

	private QueryVersion latestVersion(Query query) {
		query.getVersions().size();
		return query.getVersions().stream()
				.max(Comparator.comparingInt(QueryVersion::getVersionNumber))
				.orElseThrow(() -> new ResponseStatusException(
						HttpStatus.INTERNAL_SERVER_ERROR,
						"Query has no current version: " + query.getId()));
	}

	private static ResponseStatusException notFound(String message) {
		return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
	}
}
