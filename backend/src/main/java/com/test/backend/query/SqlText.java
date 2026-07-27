package com.test.backend.query;

import java.util.List;

/**
 * Text helpers for query document storage (newline normalization and line splitting).
 */
public final class SqlText {

	private SqlText() {
	}

	public static String normalize(String text) {
		return text.replace("\r\n", "\n").replace('\r', '\n');
	}

	public static List<String> lines(String text) {
		if (text.isEmpty()) {
			return List.of();
		}
		String[] parts = text.split("\n", -1);
		if (parts.length == 1 && parts[0].isEmpty()) {
			return List.of();
		}
		return List.of(parts);
	}
}
