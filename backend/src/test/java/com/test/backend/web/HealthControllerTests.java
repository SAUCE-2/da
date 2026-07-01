package com.test.backend.web;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class HealthControllerTests {

	@Test
	void healthReturnsUpStatus() {
		assertEquals("UP", new HealthController().health().get("status"));
	}
}
