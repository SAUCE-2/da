package com.test.backend.audit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.test.backend.audit.dto.AuditQueryPreviewResponse;
import com.test.backend.audit.dto.AuditQueryRequest;
import com.test.backend.audit.dto.AuditQueryResponse;
import com.test.backend.audit.dto.QuerySectionRequest;

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
				List.of()));

		assertTrue(created.active());
		assertTrue(created.sections().getFirst().defaultEnabled());
	}

	@Test
	void updatePreservesOmittedBooleanValues() {
		AuditQueryResponse created = auditQueryService.createQuery(new AuditQueryRequest(
				"Definition Beta",
				"Initial metadata",
				false,
				List.of(
						new QuerySectionRequest("Block A", "FRAGMENT_A", 10, false),
						new QuerySectionRequest("Block B", "FRAGMENT_B", 20, true)),
				List.of()));

		AuditQueryResponse updated = auditQueryService.updateQuery(created.id(), new AuditQueryRequest(
				"Definition Beta Updated",
				"Updated metadata",
				null,
				List.of(
						new QuerySectionRequest("Block A Updated", "FRAGMENT_A_UPDATED", 10, null),
						new QuerySectionRequest("Block B Updated", "FRAGMENT_B_UPDATED", 20, null)),
				List.of()));

		assertFalse(updated.active());
		assertFalse(updated.sections().getFirst().defaultEnabled());
		assertTrue(updated.sections().get(1).defaultEnabled());
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
				List.of()));

		AuditQueryPreviewResponse preview = auditQueryService.previewQuery(created.id());

		assertEquals("FRAGMENT_A\n  DETAIL_A\nFRAGMENT_B", preview.sql());
	}
}
