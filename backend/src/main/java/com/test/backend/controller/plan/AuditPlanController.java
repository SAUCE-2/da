package com.test.backend.controller.plan;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.test.backend.service.plan.AuditPlanService;
import com.test.backend.dto.plan.AuditPlanRequest;
import com.test.backend.dto.plan.AuditPlanResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/audit-plans")
public class AuditPlanController {

	private final AuditPlanService auditPlanService;

	public AuditPlanController(AuditPlanService auditPlanService) {
		this.auditPlanService = auditPlanService;
	}

	@GetMapping
	public List<AuditPlanResponse> listPlans() {
		return auditPlanService.listPlans();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public AuditPlanResponse createPlan(@Valid @RequestBody AuditPlanRequest request) {
		return auditPlanService.createPlan(request);
	}

	@GetMapping("/{id}")
	public AuditPlanResponse getPlan(@PathVariable Long id) {
		return auditPlanService.getPlan(id);
	}

	@PutMapping("/{id}")
	public AuditPlanResponse updatePlan(@PathVariable Long id, @Valid @RequestBody AuditPlanRequest request) {
		return auditPlanService.updatePlan(id, request);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
		auditPlanService.deletePlan(id);
		return ResponseEntity.noContent().build();
	}
}
