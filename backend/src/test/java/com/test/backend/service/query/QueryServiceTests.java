package com.test.backend.service.query;

import com.test.backend.entity.query.QueryVariableType;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.test.backend.dto.query.QueryRequest;
import com.test.backend.dto.query.QueryResponse;
import com.test.backend.dto.query.QueryVersionResponse;
import com.test.backend.dto.query.QueryVariableRequest;

@SpringBootTest
@Transactional
class QueryServiceTests {

	@Autowired
	private QueryService queryService;

	@Test
	void createStoresQueryDocument() {
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
		assertEquals("Definition Alpha", created.name());
		assertEquals("Default behavior example", created.description());
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

	@Test
	void listReturnsSummariesWithoutDocumentBody() {
		QueryResponse created = queryService.createQuery(new QueryRequest(
				"Listed Query",
				"Listed description",
				true,
				"--# Base\nselect 1",
				List.of(),
				List.of(new QueryVariableRequest("status", QueryVariableType.STRING, "OPEN", true, 0)),
				List.of()));

		var summaries = queryService.listQueries();
		assertEquals(1, summaries.size());
		assertEquals(created.id(), summaries.getFirst().id());
		assertEquals("Listed Query", summaries.getFirst().name());
		assertEquals("Listed description", summaries.getFirst().description());
		assertEquals(created.versionId(), summaries.getFirst().versionId());
	}

	@Test
	void getQueryReturnsFullDocument() {
		QueryResponse created = queryService.createQuery(new QueryRequest(
				"Detailed Query",
				"Detail description",
				true,
				"--# Base\nselect {{status}}",
				List.of(1),
				List.of(new QueryVariableRequest("status", QueryVariableType.STRING, "OPEN", true, 0)),
				List.of()));

		QueryResponse loaded = queryService.getQuery(created.id());
		assertEquals(created.query(), loaded.query());
		assertEquals(List.of(1), loaded.defaultDisabledLines());
		assertEquals(1, loaded.variables().size());
		assertEquals("status", loaded.variables().getFirst().name());
	}
}
