package com.test.backend.query;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

/**
 * Diffs query text and remaps disabled line overlays across versions via LCS alignment.
 */
public final class QueryLineRemapper {

	private QueryLineRemapper() {
	}

	public enum DiffOp {
		EQUAL,
		INSERT,
		DELETE
	}

	public record DiffLine(DiffOp op, String text, Integer fromLine, Integer toLine) {
	}

	public record RemapResult(List<Integer> remappedDisabledLines, int unmappedCount) {
	}

	public static List<DiffLine> diffQueries(String fromQuery, String toQuery) {
		List<String> fromLines = QueryDocumentParser.splitLines(QueryDocumentParser.normalizeNewlines(
				fromQuery == null ? "" : fromQuery));
		List<String> toLines = QueryDocumentParser.splitLines(QueryDocumentParser.normalizeNewlines(
				toQuery == null ? "" : toQuery));
		return diffLines(fromLines, toLines);
	}

	public static RemapResult remapDisabledLines(
			String fromQuery,
			String toQuery,
			List<Integer> fromDisabledLines) {
		List<DiffLine> diff = diffQueries(fromQuery, toQuery);
		Map<Integer, Integer> fromToMapping = new HashMap<>();
		for (DiffLine line : diff) {
			if (line.op() == DiffOp.EQUAL && line.fromLine() != null && line.toLine() != null) {
				fromToMapping.put(line.fromLine(), line.toLine());
			}
		}

		LinkedHashSet<Integer> remapped = new LinkedHashSet<>();
		int unmapped = 0;
		List<Integer> source = fromDisabledLines == null ? List.of() : fromDisabledLines;
		for (Integer fromLine : source) {
			if (fromLine == null || fromLine <= 0) {
				continue;
			}
			Integer toLine = fromToMapping.get(fromLine);
			if (toLine == null) {
				unmapped++;
			} else {
				remapped.add(toLine);
			}
		}
		return new RemapResult(List.copyOf(remapped), unmapped);
	}

	static List<DiffLine> diffLines(List<String> fromLines, List<String> toLines) {
		int m = fromLines.size();
		int n = toLines.size();
		int[][] lcs = new int[m + 1][n + 1];
		for (int i = m - 1; i >= 0; i--) {
			for (int j = n - 1; j >= 0; j--) {
				if (fromLines.get(i).equals(toLines.get(j))) {
					lcs[i][j] = lcs[i + 1][j + 1] + 1;
				} else {
					lcs[i][j] = Math.max(lcs[i + 1][j], lcs[i][j + 1]);
				}
			}
		}

		List<DiffLine> result = new ArrayList<>();
		int i = 0;
		int j = 0;
		while (i < m && j < n) {
			if (fromLines.get(i).equals(toLines.get(j))) {
				result.add(new DiffLine(DiffOp.EQUAL, fromLines.get(i), i + 1, j + 1));
				i++;
				j++;
			} else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
				result.add(new DiffLine(DiffOp.DELETE, fromLines.get(i), i + 1, null));
				i++;
			} else {
				result.add(new DiffLine(DiffOp.INSERT, toLines.get(j), null, j + 1));
				j++;
			}
		}
		while (i < m) {
			result.add(new DiffLine(DiffOp.DELETE, fromLines.get(i), i + 1, null));
			i++;
		}
		while (j < n) {
			result.add(new DiffLine(DiffOp.INSERT, toLines.get(j), null, j + 1));
			j++;
		}
		return result;
	}
}
