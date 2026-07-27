package com.test.backend.service.query;

import com.test.backend.entity.query.Query;
import com.test.backend.entity.query.QueryVersion;
import com.test.backend.repository.query.QueryVersionRepository;
import java.util.Comparator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import static com.test.backend.service.ServiceSupport.notFound;

@Component
@RequiredArgsConstructor
public class QueryVersionResolver {

	private final QueryVersionRepository queryVersionRepository;

	public QueryVersion requireCurrentVersion(Query query) {
		Long versionId = query.getCurrentVersionId();
		QueryVersion version;
		if (versionId != null) {
			version = query.getVersions().stream()
					.filter(candidate -> versionId.equals(candidate.getId()))
					.findFirst()
					.orElseGet(() -> latestVersion(query));
		} else {
			version = latestVersion(query);
		}
		initializeGraph(version);
		return version;
	}

	public QueryVersion requireVersion(Query query, Long versionId) {
		if (versionId == null) {
			return requireCurrentVersion(query);
		}
		return query.getVersions().stream()
				.filter(version -> versionId.equals(version.getId()))
				.findFirst()
				.orElseGet(() -> requireVersion(query.getId(), versionId));
	}

	public QueryVersion requireVersion(Long queryId, Long versionId) {
		QueryVersion version = queryVersionRepository.findByIdAndQueryId(versionId, queryId)
				.orElseThrow(() -> notFound("Query version not found: " + versionId));
		initializeGraph(version);
		return version;
	}

	private void initializeGraph(QueryVersion version) {
		version.getQueryText();
		version.getVariables().size();
	}

	private QueryVersion latestVersion(Query query) {
		return query.getVersions().stream()
				.max(Comparator.comparingInt(QueryVersion::getVersionNumber))
				.orElseThrow(() -> new ResponseStatusException(
						HttpStatus.INTERNAL_SERVER_ERROR,
						"Query has no current version: " + query.getId()));
	}
}
