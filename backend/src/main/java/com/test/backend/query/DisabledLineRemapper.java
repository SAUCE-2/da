package com.test.backend.query;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

/**
 * Remaps disabled-line overlays across query document versions via LCS alignment.
 */
public final class DisabledLineRemapper {

	private DisabledLineRemapper() {
	}

	private enum DiffOp {
		EQUAL,
		INSERT,
		DELETE
	}

	private record DiffLine(DiffOp op, String text, Integer fromLine, Integer toLine) {
	}

	public static DisabledLines remap(String fromText, String toText, DisabledLines fromDisabledLines) {
		List<DiffLine> diff = diffLines(
				SqlText.lines(SqlText.normalize(fromText == null ? "" : fromText)),
				SqlText.lines(SqlText.normalize(toText == null ? "" : toText)));
		Map<Integer, Integer> fromToMapping = new HashMap<>();
		for (DiffLine line : diff) {
			if (line.op() == DiffOp.EQUAL && line.fromLine() != null && line.toLine() != null) {
				fromToMapping.put(line.fromLine(), line.toLine());
			}
		}

		LinkedHashSet<Integer> remapped = new LinkedHashSet<>();
		DisabledLines source = fromDisabledLines == null ? DisabledLines.EMPTY : fromDisabledLines;
		for (Integer fromLine : source.lines()) {
			Integer toLine = fromToMapping.get(fromLine);
			if (toLine != null) {
				remapped.add(toLine);
			}
		}
		return DisabledLines.of(remapped);
	}

	private static List<DiffLine> diffLines(List<String> fromLines, List<String> toLines) {
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
