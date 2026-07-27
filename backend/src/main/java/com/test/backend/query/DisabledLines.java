package com.test.backend.query;

import java.util.Collection;
import java.util.List;
import java.util.SortedSet;
import java.util.TreeSet;
import java.util.stream.Collectors;

/**
 * Sorted, deduplicated, 1-based line numbers that are disabled in a query document.
 */
public record DisabledLines(SortedSet<Integer> lines) {

	public static final DisabledLines EMPTY = new DisabledLines(new TreeSet<>());

	public DisabledLines {
		lines = lines == null ? new TreeSet<>() : new TreeSet<>(lines);
	}

	public static DisabledLines parse(String stored) {
		if (stored == null || stored.isBlank()) {
			return EMPTY;
		}
		SortedSet<Integer> parsed = new TreeSet<>();
		for (String part : stored.split(",")) {
			String trimmed = part.trim();
			if (trimmed.isEmpty()) {
				continue;
			}
			try {
				int value = Integer.parseInt(trimmed);
				if (value > 0) {
					parsed.add(value);
				}
			} catch (NumberFormatException ignored) {
				// skip malformed entries
			}
		}
		return parsed.isEmpty() ? EMPTY : new DisabledLines(parsed);
	}

	public static DisabledLines of(Collection<Integer> lines) {
		if (lines == null || lines.isEmpty()) {
			return EMPTY;
		}
		SortedSet<Integer> normalized = new TreeSet<>();
		for (Integer line : lines) {
			if (line != null && line > 0) {
				normalized.add(line);
			}
		}
		return normalized.isEmpty() ? EMPTY : new DisabledLines(normalized);
	}

	public String format() {
		if (lines.isEmpty()) {
			return "";
		}
		return lines.stream().map(String::valueOf).collect(Collectors.joining(","));
	}

	public boolean contains(int lineNumber) {
		return lines.contains(lineNumber);
	}

	public boolean isEmpty() {
		return lines.isEmpty();
	}

	public List<Integer> toList() {
		return List.copyOf(lines);
	}
}
