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
import com.test.backend.dto.query.QuerySectionRequest;
import com.test.backend.dto.query.QueryVariableRequest;
import com.test.backend.service.plan.PlanService;
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
	void planItemSeedsVariableBindingsFromQueryDefaults() {
		var created = queryService.createQuery(new QueryRequest(
				"Plan query",
				"Plan variable example",
				true,
				List.of(new QuerySectionRequest("Filter", "WHERE region_id = {{regionId}}", 10, true)),
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
						List.of(new PlanItemVariableBindingRequest("regionId", "99"))))));

		assertEquals(1, plan.items().size());
		assertEquals("99", plan.items().getFirst().variableBindings().getFirst().value());
	}
}
