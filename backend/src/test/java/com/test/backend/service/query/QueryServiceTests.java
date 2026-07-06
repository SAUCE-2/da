package com.test.backend.service.query;

import com.test.backend.entity.query.QueryVariableType;
import com.test.backend.service.query.QueryService;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.test.backend.dto.query.QueryPreviewRequest;
import com.test.backend.dto.query.QueryPreviewResponse;
import com.test.backend.dto.query.QueryRequest;
import com.test.backend.dto.query.QueryResponse;
import com.test.backend.dto.query.QueryVersionResponse;
import com.test.backend.dto.query.QuerySectionRequest;
import com.test.backend.dto.query.QueryVariableRequest;

@SpringBootTest
@Transactional
class QueryServiceTests {

	@Autowired
	private QueryService queryService;

	@Test
	void createDefaultsOmittedBooleansToEnabled() {
		QueryResponse created = queryService.createQuery(new QueryRequest(
				"Definition Alpha",
				"Default behavior example",
				null,
				List.of(new QuerySectionRequest("Block A", "FRAGMENT_A", 10, null)),
				List.of(),
				List.of()));

		assertTrue(created.active());
		assertEquals(1, created.versionNumber());
		assertTrue(created.sections().getFirst().defaultEnabled());
	}

	@Test
	void updatePreservesOmittedBooleanValuesAndCreatesNewVersion() {
		QueryResponse created = queryService.createQuery(new QueryRequest(
				"Definition Beta",
				"Initial metadata",
				false,
				List.of(
						new QuerySectionRequest("Block A", "FRAGMENT_A", 10, false),
						new QuerySectionRequest("Block B", "FRAGMENT_B", 20, true)),
				List.of(),
				List.of()));

		QueryResponse updated = queryService.updateQuery(created.id(), new QueryRequest(
				"Definition Beta Updated",
				"Updated metadata",
				null,
				List.of(
						new QuerySectionRequest("Block A Updated", "FRAGMENT_A_UPDATED", 10, null),
						new QuerySectionRequest("Block B Updated", "FRAGMENT_B_UPDATED", 20, null)),
				List.of(),
				List.of()));

		assertFalse(updated.active());
		assertEquals(2, updated.versionNumber());
		assertFalse(updated.sections().getFirst().defaultEnabled());
		assertTrue(updated.sections().get(1).defaultEnabled());

		QueryVersionResponse firstVersion = queryService.getVersion(created.id(), created.versionId());
		assertEquals(1, firstVersion.versionNumber());
		assertEquals("Block A", firstVersion.sections().getFirst().name());
	}

	@Test
	void previewConcatenatesEnabledSectionsInSortOrderAndNormalizesBoundaries() {
		QueryResponse created = queryService.createQuery(new QueryRequest(
				"Definition Gamma",
				"Preview ordering example",
				true,
				List.of(
						new QuerySectionRequest("Block C", "FRAGMENT_C\n", 30, false),
						new QuerySectionRequest("Block A", "\nFRAGMENT_A\n  DETAIL_A\n\n", 10, null),
						new QuerySectionRequest("Block B", "\nFRAGMENT_B\n", 20, true)),
				List.of(),
				List.of()));

		QueryPreviewResponse preview = queryService.previewQuery(created.id(), null);

		assertEquals("FRAGMENT_A\n  DETAIL_A\nFRAGMENT_B", preview.sql());
	}

	@Test
	void previewSubstitutesVariablesUsingTypedEmitters() {
		QueryResponse created = queryService.createQuery(new QueryRequest(
				"Definition Delta",
				"Variable preview example",
				true,
				List.of(new QuerySectionRequest(
						"Filter",
						"WHERE status = {{status}}\n  AND created_at >= {{startDate}}",
						10,
						true)),
				List.of(
						new QueryVariableRequest("status", QueryVariableType.STRING, "OPEN", true, 0),
						new QueryVariableRequest("startDate", QueryVariableType.DATE, "2024-01-01", true, 1)),
				List.of()));

		QueryPreviewResponse preview = queryService.previewQuery(
				created.id(),
				new QueryPreviewRequest(null, Map.of("status", "O'Brien")));

		assertEquals("WHERE status = 'O''Brien'\n  AND created_at >= DATE '2024-01-01'", preview.sql());
	}
}
