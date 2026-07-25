package com.test.backend.query;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;

class QueryDocumentParserTests {

	@Test
	void parsesNestedSectionRanges() {
		String body = """
				--# Base
				select 1
				--# Filters
				where 1 = 1
				--## Amount
				  and amount > 0
				--# Tail
				order by 1
				""";

		QueryDocumentParser.ParsedDocument parsed = QueryDocumentParser.parse(body);
		assertEquals(4, parsed.sections().size());
		assertEquals("Base", parsed.sections().get(0).name());
		assertEquals(1, parsed.sections().get(0).level());
		assertEquals(1, parsed.sections().get(0).startLine());
		assertEquals(2, parsed.sections().get(0).endLine());

		assertEquals("Filters", parsed.sections().get(1).name());
		assertEquals(3, parsed.sections().get(1).startLine());
		assertEquals(6, parsed.sections().get(1).endLine());

		assertEquals("Amount", parsed.sections().get(2).name());
		assertEquals(2, parsed.sections().get(2).level());
		assertEquals(5, parsed.sections().get(2).startLine());
		assertEquals(6, parsed.sections().get(2).endLine());

		assertEquals("Tail", parsed.sections().get(3).name());
		assertEquals(7, parsed.sections().get(3).startLine());
		assertEquals(parsed.lines().size(), parsed.sections().get(3).endLine());
	}

	@Test
	void renderQueryDropsDisabledLinesAndStripsHeaders() {
		String query = """
				--# Base
				select 1
				--# Filters
				where 1 = 1
				  and status = 'OPEN'
				""";

		String sql = QueryDocumentParser.renderQuery(query, List.of(5));
		assertEquals("select 1\nwhere 1 = 1", sql);
	}

	@Test
	void queryHashIsStableForNormalizedNewlines() {
		String hashA = QueryDocumentParser.queryHash("select 1\r\nfrom dual");
		String hashB = QueryDocumentParser.queryHash("select 1\nfrom dual");
		assertEquals(hashA, hashB);
		assertEquals(64, hashA.length());
	}

	@Test
	void formatsAndParsesDisabledLines() {
		assertEquals("1,3,5", QueryDocumentParser.formatDisabledLines(List.of(5, 1, 3, 1)));
		assertEquals(List.of(1, 3, 5), QueryDocumentParser.parseDisabledLines("5, 1,,3"));
		assertTrue(QueryDocumentParser.parseDisabledLines("").isEmpty());
	}
}
