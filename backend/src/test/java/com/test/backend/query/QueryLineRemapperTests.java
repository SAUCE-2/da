package com.test.backend.query;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;
import org.junit.jupiter.api.Test;

class QueryLineRemapperTests {

	@Test
	void remapsDisabledLinesAcrossEqualContent() {
		String from = "a\nb\nc";
		String to = "a\nx\nb\nc";
		QueryLineRemapper.RemapResult result = QueryLineRemapper.remapDisabledLines(from, to, List.of(2, 3));
		assertEquals(List.of(3, 4), result.remappedDisabledLines());
		assertEquals(0, result.unmappedCount());
	}

	@Test
	void countsUnmappedDeletedLines() {
		String from = "a\nb\nc";
		String to = "a\nc";
		QueryLineRemapper.RemapResult result = QueryLineRemapper.remapDisabledLines(from, to, List.of(2));
		assertEquals(List.of(), result.remappedDisabledLines());
		assertEquals(1, result.unmappedCount());
	}
}
