package com.test.backend.query;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import org.junit.jupiter.api.Test;

class DisabledLineRemapperTests {

	@Test
	void remapsDisabledLinesAcrossEqualContent() {
		String from = "a\nb\nc";
		String to = "a\nx\nb\nc";
		DisabledLines result = DisabledLineRemapper.remap(from, to, DisabledLines.of(List.of(2, 3)));
		assertEquals(List.of(3, 4), result.toList());
	}

	@Test
	void dropsDisabledLinesThatWereDeleted() {
		String from = "a\nb\nc";
		String to = "a\nc";
		DisabledLines result = DisabledLineRemapper.remap(from, to, DisabledLines.of(List.of(2)));
		assertTrue(result.isEmpty());
	}
}
