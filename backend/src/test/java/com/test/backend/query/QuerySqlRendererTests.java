package com.test.backend.query;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.test.backend.entity.query.Query;
import com.test.backend.entity.query.QueryVariable;
import com.test.backend.entity.query.QueryVariableType;
import com.test.backend.entity.query.QueryVersion;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class QuerySqlRendererTests {

	@Test
	void renderPreviewDropsDisabledLinesAndSubstitutesVariables() {
		Query query = new Query("Demo", "desc", true);
		QueryVersion version = query.addVersion(1);
		version.setQueryText("""
				--# Base
				select *
				from invoices
				--# Filters
				where 1 = 1
				  and status = {{status}}
				""");
		version.setName("Demo");
		version.setDefaultDisabledLines("");
		version.addVariable(new QueryVariable("status", QueryVariableType.STRING, "OPEN", true, 0));

		QuerySqlRenderer.PreviewSql preview = QuerySqlRenderer.renderPreviewSql(
				version,
				List.of(6),
				Map.of());

		assertEquals("select *\nfrom invoices\nwhere 1 = 1", preview.sql());
	}

	@Test
	void renderPreviewUsesDefaultDisabledLinesWhenNullPassed() {
		Query query = new Query("Demo", "desc", true);
		QueryVersion version = query.addVersion(1);
		version.setQueryText("""
				--# Base
				select 1
				--# Extra
				select 2
				""");
		version.setName("Demo");
		version.setDefaultDisabledLines("3,4");

		QuerySqlRenderer.PreviewSql preview = QuerySqlRenderer.renderPreviewSql(version, null, Map.of());
		assertEquals("select 1", preview.sql());
	}
}
