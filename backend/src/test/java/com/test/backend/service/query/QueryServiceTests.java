package com.test.backend.service.query;

import com.test.backend.entity.query.QueryVariableType;
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
import com.test.backend.dto.query.QueryVersionDiffResponse;
import com.test.backend.dto.query.QueryVersionResponse;
import com.test.backend.dto.query.QueryVariableRequest;

@SpringBootTest
@Transactional
class QueryServiceTests {

	@Autowired
	private QueryService queryService;

	@Test
	void createStoresQueryAndDerivedSections() {
		QueryResponse created = queryService.createQuery(new QueryRequest(
				"Definition Alpha",
				"Default behavior example",
				null,
				"""
						--# Block A
						FRAGMENT_A
						""",
				List.of(),
				List.of(),
				List.of()));

		assertTrue(created.active());
		assertEquals(1, created.versionNumber());
		assertTrue(created.query().contains("--# Block A"));
		assertEquals(1, created.sections().size());
		assertEquals("Block A", created.sections().getFirst().name());
		assertEquals(64, created.queryHash().length());
	}

	@Test
	void updateCreatesNewVersionWithQueryAndDisabledLines() {
		QueryResponse created = queryService.createQuery(new QueryRequest(
				"Definition Beta",
				"Initial metadata",
				false,
				"""
						--# Block A
						FRAGMENT_A
						--# Block B
						FRAGMENT_B
						""",
				List.of(1, 2),
				List.of(),
				List.of()));

		QueryResponse updated = queryService.updateQuery(created.id(), new QueryRequest(
				"Definition Beta Updated",
				"Updated metadata",
				null,
				"""
						--# Block A Updated
						FRAGMENT_A_UPDATED
						--# Block B Updated
						FRAGMENT_B_UPDATED
						""",
				List.of(3, 4),
				List.of(),
				List.of()));

		assertFalse(updated.active());
		assertEquals(2, updated.versionNumber());
		assertEquals(List.of(3, 4), updated.defaultDisabledLines());

		QueryVersionResponse firstVersion = queryService.getVersion(created.id(), created.versionId());
		assertEquals(1, firstVersion.versionNumber());
		assertTrue(firstVersion.query().contains("Block A"));
		assertEquals(List.of(1, 2), firstVersion.defaultDisabledLines());
	}

	@Test
	void previewDropsDisabledLinesAndStripsHeaders() {
		QueryResponse created = queryService.createQuery(new QueryRequest(
				"Definition Gamma",
				"Preview ordering example",
				true,
				"""
						--# Block A
						FRAGMENT_A
						  DETAIL_A
						--# Block B
						FRAGMENT_B
						--# Block C
						FRAGMENT_C
						""",
				List.of(6, 7),
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
				"""
						--# Filter
						WHERE status = {{status}}
						  AND created_at >= {{startDate}}
						""",
				List.of(),
				List.of(
						new QueryVariableRequest("status", QueryVariableType.STRING, "OPEN", true, 0),
						new QueryVariableRequest("startDate", QueryVariableType.DATE, "2024-01-01", true, 1)),
				List.of()));

		QueryPreviewResponse preview = queryService.previewQuery(
				created.id(),
				new QueryPreviewRequest(null, Map.of("status", "O'Brien"), null));

		assertEquals("WHERE status = 'O''Brien'\n  AND created_at >= DATE '2024-01-01'", preview.sql());
	}

	@Test
	void diffVersionsReturnsLineOps() {
		QueryResponse created = queryService.createQuery(new QueryRequest(
				"Definition Epsilon",
				"Diff example",
				true,
				"select 1",
				List.of(),
				List.of(),
				List.of()));

		QueryResponse updated = queryService.updateQuery(created.id(), new QueryRequest(
				"Definition Epsilon",
				"Diff example",
				true,
				"select 1\nfrom dual",
				List.of(),
				List.of(),
				List.of()));

		Long fromVersionId = created.versionId();
		Long toVersionId = updated.versionId();
		assertTrue(fromVersionId != null);
		assertTrue(toVersionId != null);

		QueryVersionDiffResponse diff = queryService.diffVersions(
				created.id(),
				fromVersionId,
				toVersionId);

		assertEquals(fromVersionId, diff.fromVersionId());
		assertEquals(toVersionId, diff.toVersionId());
		assertTrue(diff.lines().stream().anyMatch(line -> "INSERT".equals(line.op())));
	}

	@Test
	void restoreOlderVersionCreatesNewCurrentVersion() {
		QueryResponse created = queryService.createQuery(new QueryRequest(
				"Definition Zeta",
				"Restore example",
				true,
				"""
						--# Original
						select 1
						""",
				List.of(),
				List.of(),
				List.of()));

		QueryResponse updated = queryService.updateQuery(created.id(), new QueryRequest(
				"Definition Zeta",
				"Restore example",
				true,
				"""
						--# Changed
						select 2
						""",
				List.of(),
				List.of(),
				List.of()));

		QueryVersionResponse firstVersion = queryService.getVersion(created.id(), created.versionId());
		QueryResponse restored = queryService.updateQuery(created.id(), new QueryRequest(
				updated.name(),
				updated.description(),
				updated.active(),
				firstVersion.query(),
				firstVersion.defaultDisabledLines(),
				List.of(),
				List.of()));

		assertEquals(3, restored.versionNumber());
		assertTrue(restored.query().contains("Original"));
		assertEquals(3, queryService.listVersions(created.id()).size());
	}

	@Test
	void nameAndDescriptionAreVersioned() {
		QueryResponse created = queryService.createQuery(new QueryRequest(
				"Original Name",
				"Original description",
				true,
				"--# Base\nselect 1",
				List.of(),
				List.of(),
				List.of()));

		QueryResponse updated = queryService.updateQuery(created.id(), new QueryRequest(
				"Renamed",
				"New description",
				true,
				"--# Base\nselect 2",
				List.of(),
				List.of(),
				List.of()));

		assertEquals("Renamed", updated.name());
		assertEquals("New description", updated.description());

		QueryVersionResponse first = queryService.getVersion(created.id(), created.versionId());
		QueryVersionResponse second = queryService.getVersion(created.id(), updated.versionId());

		assertEquals("Original Name", first.name());
		assertEquals("Original description", first.description());
		assertEquals("Renamed", second.name());
		assertEquals("New description", second.description());
	}
}
