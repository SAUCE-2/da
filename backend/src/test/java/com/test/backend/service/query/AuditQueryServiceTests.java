package com.test.backend.service.query;

import com.test.backend.entity.query.QueryVariableType;
import com.test.backend.service.query.AuditQueryService;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.test.backend.dto.query.AuditQueryPreviewRequest;
import com.test.backend.dto.query.AuditQueryPreviewResponse;
import com.test.backend.dto.query.AuditQueryRequest;
import com.test.backend.dto.query.AuditQueryResponse;
import com.test.backend.dto.query.AuditQueryVersionResponse;
import com.test.backend.dto.query.QuerySectionRequest;
import com.test.backend.dto.query.QueryVariableRequest;

@SpringBootTest
@Transactional
class AuditQueryServiceTests {

	@Autowired
	private AuditQueryService auditQueryService;

	@Test
	void createDefaultsOmittedBooleansToEnabled() {
		AuditQueryResponse created = auditQueryService.createQuery(new AuditQueryRequest(
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
		AuditQueryResponse created = auditQueryService.createQuery(new AuditQueryRequest(
				"Definition Beta",
				"Initial metadata",
				false,
				List.of(
						new QuerySectionRequest("Block A", "FRAGMENT_A", 10, false),
						new QuerySectionRequest("Block B", "FRAGMENT_B", 20, true)),
				List.of(),
				List.of()));

		AuditQueryResponse updated = auditQueryService.updateQuery(created.id(), new AuditQueryRequest(
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

		AuditQueryVersionResponse firstVersion = auditQueryService.getVersion(created.id(), created.versionId());
		assertEquals(1, firstVersion.versionNumber());
		assertEquals("Block A", firstVersion.sections().getFirst().name());
	}

	@Test
	void previewConcatenatesEnabledSectionsInSortOrderAndNormalizesBoundaries() {
		AuditQueryResponse created = auditQueryService.createQuery(new AuditQueryRequest(
				"Definition Gamma",
				"Preview ordering example",
				true,
				List.of(
						new QuerySectionRequest("Block C", "FRAGMENT_C\n", 30, false),
						new QuerySectionRequest("Block A", "\nFRAGMENT_A\n  DETAIL_A\n\n", 10, null),
						new QuerySectionRequest("Block B", "\nFRAGMENT_B\n", 20, true)),
				List.of(),
				List.of()));

		AuditQueryPreviewResponse preview = auditQueryService.previewQuery(created.id(), null);

		assertEquals("FRAGMENT_A\n  DETAIL_A\nFRAGMENT_B", preview.sql());
	}

	@Test
	void previewSubstitutesVariablesUsingTypedEmitters() {
		AuditQueryResponse created = auditQueryService.createQuery(new AuditQueryRequest(
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

		AuditQueryPreviewResponse preview = auditQueryService.previewQuery(
				created.id(),
				new AuditQueryPreviewRequest(null, Map.of("status", "O'Brien")));

		assertEquals("WHERE status = 'O''Brien'\n  AND created_at >= DATE '2024-01-01'", preview.sql());
	}
}
