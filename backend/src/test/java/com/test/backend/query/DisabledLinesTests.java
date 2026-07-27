package com.test.backend.query;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;

class DisabledLinesTests {

	@Test
	void formatsAndParsesDisabledLines() {
		assertEquals("1,3,5", DisabledLines.of(List.of(5, 1, 3, 1)).format());
		assertEquals(List.of(1, 3, 5), DisabledLines.parse("5, 1,,3").toList());
		assertTrue(DisabledLines.parse("").isEmpty());
		assertTrue(DisabledLines.of(null).isEmpty());
	}

	@Test
	void normalizeRoundTrips() {
		DisabledLines lines = DisabledLines.parse("4,2,2,9");
		assertEquals("2,4,9", lines.format());
		assertEquals(lines.toList(), DisabledLines.parse(lines.format()).toList());
	}
}
