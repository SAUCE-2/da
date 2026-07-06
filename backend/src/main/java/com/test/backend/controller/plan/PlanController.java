package com.test.backend.controller.plan;

import com.test.backend.dto.plan.PlanRequest;
import com.test.backend.dto.plan.PlanResponse;
import com.test.backend.service.plan.PlanService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class PlanController {

	private final PlanService planService;

	@GetMapping
	public List<PlanResponse> listPlans() {
		return planService.listPlans();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public PlanResponse createPlan(@Valid @RequestBody PlanRequest request) {
		return planService.createPlan(request);
	}

	@GetMapping("/{id}")
	public PlanResponse getPlan(@PathVariable Long id) {
		return planService.getPlan(id);
	}

	@PutMapping("/{id}")
	public PlanResponse updatePlan(@PathVariable Long id, @Valid @RequestBody PlanRequest request) {
		return planService.updatePlan(id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deletePlan(@PathVariable Long id) {
		planService.deletePlan(id);
	}
}
