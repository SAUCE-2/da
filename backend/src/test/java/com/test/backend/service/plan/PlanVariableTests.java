package com.test.backend.service.plan;

import com.test.backend.entity.query.QueryVariableType;
import com.test.backend.service.query.QueryService;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.test.backend.dto.query.QueryRequest;
import com.test.backend.dto.query.QueryVariableRequest;
import com.test.backend.dto.plan.PlanRequest;
import com.test.backend.dto.plan.PlanResponse;
import com.test.backend.dto.plan.PlanItemRequest;
import com.test.backend.dto.plan.PlanItemVariableBindingRequest;

@SpringBootTest
@Transactional
class PlanVariableTests {

	@Autowired
	private QueryService queryService;

	@Autowired
	private PlanService planService;

	@Test
	void planItemSeedsVariableBindingsAndDisabledLinesFromQueryDefaults() {
		var created = queryService.createQuery(new QueryRequest(
				"Plan query",
				"Plan variable example",
				true,
				"""
						--# Filter
						WHERE region_id = {{regionId}}
						""",
				List.of(1),
				List.of(new QueryVariableRequest(
						"regionId",
						QueryVariableType.NUMBER,
						"7",
						false,
						0)),
				List.of()));

		PlanResponse plan = planService.createPlan(new PlanRequest(
				"Nightly checks",
				"Plan example",
				true,
				List.of(new PlanItemRequest(
						created.id(),
						null,
						10,
						true,
						null,
						List.of(new PlanItemVariableBindingRequest("regionId", "99"))))));

		assertEquals(1, plan.items().size());
		assertEquals("99", plan.items().getFirst().variableBindings().getFirst().value());
		assertEquals(List.of(1), plan.items().getFirst().disabledLines());
	}

	@Test
	void planItemRemapsDisabledLinesWhenPinnedVersionChanges() {
		var created = queryService.createQuery(new QueryRequest(
				"Plan remap query",
				"Remap example",
				true,
				"a\nb\nc",
				List.of(2),
				List.of(),
				List.of()));

		PlanResponse plan = planService.createPlan(new PlanRequest(
				"Remap plan",
				null,
				true,
				List.of(new PlanItemRequest(
						created.id(),
						created.versionId(),
						10,
						true,
						List.of(2),
						List.of()))));

		var updatedQuery = queryService.updateQuery(created.id(), new QueryRequest(
				"Plan remap query",
				"Remap example",
				true,
				"a\nx\nb\nc",
				List.of(),
				List.of(),
				List.of()));

		PlanResponse updatedPlan = planService.updatePlan(plan.id(), new PlanRequest(
				"Remap plan",
				null,
				true,
				List.of(new PlanItemRequest(
						created.id(),
						updatedQuery.versionId(),
						10,
						true,
						null,
						List.of()))));

		assertEquals(List.of(3), updatedPlan.items().getFirst().disabledLines());
	}
}
