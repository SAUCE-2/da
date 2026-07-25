package com.test.backend.query;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Parses query documents that use {@code --#} / {@code --##} section headers.
 * Line numbers are 1-based.
 */
public final class QueryDocumentParser {

	private static final Pattern SECTION_HEADER = Pattern.compile("^\\s*--(#{1,6})\\s*(.*)$");

	private QueryDocumentParser() {
	}

	public record SectionOutline(String name, int level, int startLine, int endLine) {
	}

	public record ParsedDocument(String query, List<String> lines, List<SectionOutline> sections) {
	}

	public static ParsedDocument parse(String query) {
		String normalized = normalizeNewlines(query == null ? "" : query);
		List<String> lines = splitLines(normalized);
		List<SectionOutline> sections = parseSections(lines);
		return new ParsedDocument(normalized, lines, sections);
	}

	public static List<SectionOutline> parseSections(List<String> lines) {
		List<HeaderMatch> headers = new ArrayList<>();
		for (int i = 0; i < lines.size(); i++) {
			Matcher matcher = SECTION_HEADER.matcher(lines.get(i));
			if (matcher.matches()) {
				int level = matcher.group(1).length();
				String name = matcher.group(2).trim();
				if (name.isEmpty()) {
					name = "Section";
				}
				headers.add(new HeaderMatch(name, level, i + 1));
			}
		}

		List<SectionOutline> sections = new ArrayList<>(headers.size());
		for (int i = 0; i < headers.size(); i++) {
			HeaderMatch header = headers.get(i);
			int endLine = lines.size();
			for (int j = i + 1; j < headers.size(); j++) {
				if (headers.get(j).level() <= header.level()) {
					endLine = headers.get(j).line() - 1;
					break;
				}
			}
			sections.add(new SectionOutline(header.name(), header.level(), header.line(), endLine));
		}
		return sections;
	}

	/**
	 * Drops disabled lines and strips {@code --#} section markers from remaining lines.
	 * Marker lines that remain enabled are omitted from executable SQL (they are structural only).
	 */
	public static String renderQuery(String query, List<Integer> disabledLines) {
		ParsedDocument parsed = parse(query);
		LinkedHashSet<Integer> disabled = new LinkedHashSet<>(
				disabledLines == null ? List.of() : disabledLines);
		List<String> kept = new ArrayList<>();
		for (int i = 0; i < parsed.lines().size(); i++) {
			int lineNumber = i + 1;
			if (disabled.contains(lineNumber)) {
				continue;
			}
			String line = parsed.lines().get(i);
			if (SECTION_HEADER.matcher(line).matches()) {
				continue;
			}
			kept.add(line);
		}
		return trimFragmentBoundaries(String.join("\n", kept));
	}

	public static boolean isSectionHeader(String line) {
		return line != null && SECTION_HEADER.matcher(line).matches();
	}

	public static String queryHash(String query) {
		String normalized = normalizeNewlines(query == null ? "" : query);
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			byte[] hash = digest.digest(normalized.getBytes(StandardCharsets.UTF_8));
			return HexFormat.of().formatHex(hash);
		} catch (NoSuchAlgorithmException ex) {
			throw new IllegalStateException("SHA-256 not available", ex);
		}
	}

	public static List<Integer> parseDisabledLines(String stored) {
		if (stored == null || stored.isBlank()) {
			return List.of();
		}
		LinkedHashSet<Integer> lines = new LinkedHashSet<>();
		for (String part : stored.split(",")) {
			String trimmed = part.trim();
			if (trimmed.isEmpty()) {
				continue;
			}
			try {
				int value = Integer.parseInt(trimmed);
				if (value > 0) {
					lines.add(value);
				}
			} catch (NumberFormatException ignored) {
				// skip malformed entries
			}
		}
		return lines.stream().sorted().toList();
	}

	public static String formatDisabledLines(List<Integer> disabledLines) {
		if (disabledLines == null || disabledLines.isEmpty()) {
			return "";
		}
		return disabledLines.stream()
				.filter(line -> line != null && line > 0)
				.distinct()
				.sorted()
				.map(String::valueOf)
				.collect(Collectors.joining(","));
	}

	public static String normalizeNewlines(String text) {
		return text.replace("\r\n", "\n").replace('\r', '\n');
	}

	public static List<String> splitLines(String text) {
		if (text.isEmpty()) {
			return List.of();
		}
		// Prefer split that keeps content, including a trailing empty line when text ends with newline.
		String[] parts = text.split("\n", -1);
		// If text ends with a trailing newline, the last empty string is an empty line — keep it.
		// If text is non-empty and does not end with newline, split still works.
		if (parts.length == 1 && parts[0].isEmpty()) {
			return List.of();
		}
		return List.of(parts);
	}

	public static String trimFragmentBoundaries(String sqlFragment) {
		return sqlFragment
				.replace("\r\n", "\n")
				.replace('\r', '\n')
				.replaceAll("\\A(?:[\\t ]*\\n)+", "")
				.replaceAll("\\n[\\t \\n]*\\z", "");
	}

	private record HeaderMatch(String name, int level, int line) {
	}
}
