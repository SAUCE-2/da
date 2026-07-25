package com.test.backend.dto.query;

import java.util.List;

public record QueryVersionDiffResponse(
		Long fromVersionId,
		int fromVersionNumber,
		Long toVersionId,
		int toVersionNumber,
		String fromQuery,
		String toQuery,
		List<DiffLine> lines) {

	public record DiffLine(
			String op,
			String text,
			Integer fromLine,
			Integer toLine) {
	}
}
