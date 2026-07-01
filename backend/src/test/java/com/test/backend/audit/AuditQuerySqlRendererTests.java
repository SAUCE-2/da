package com.test.backend.audit;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;

import org.junit.jupiter.api.Test;

class AuditQuerySqlRendererTests {

	@Test
	void renderQuerySqlConcatenatesEnabledSectionsInSortOrderAndTrimsBoundaries() {
		List<QuerySection> sections = List.of(
				new QuerySection("Block C", "FRAGMENT_C\n", 30, false),
				new QuerySection("Block A", "\nFRAGMENT_A\n  DETAIL_A\n\n", 10, true),
				new QuerySection("Block B", "\nFRAGMENT_B\n", 20, true));

		assertEquals(
				"FRAGMENT_A\n  DETAIL_A\nFRAGMENT_B",
				AuditQuerySqlRenderer.renderQuerySql(sections, true));
	}

	@Test
	void renderQuerySqlIncludesDisabledSectionsWhenRequested() {
		List<QuerySection> sections = List.of(
				new QuerySection("Block A", "FRAGMENT_A", 10, true),
				new QuerySection("Block B", "FRAGMENT_B", 20, false));

		assertEquals(
				"FRAGMENT_A\nFRAGMENT_B",
				AuditQuerySqlRenderer.renderQuerySql(sections, false));
	}

	@Test
	void trimFragmentBoundariesNormalizesLineEndingsAndBlankEdges() {
		assertEquals(
				"FRAGMENT_A\n  DETAIL_A",
				AuditQuerySqlRenderer.trimFragmentBoundaries("\r\n\nFRAGMENT_A\n  DETAIL_A\n\n  \n"));
	}
}
