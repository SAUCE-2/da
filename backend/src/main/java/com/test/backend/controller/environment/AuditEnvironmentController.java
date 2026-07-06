package com.test.backend.controller.environment;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.test.backend.service.environment.AuditEnvironmentService;
import com.test.backend.dto.environment.EnvironmentResponse;
import com.test.backend.dto.environment.ProjectResponse;

@RestController
@RequestMapping("/api")
public class AuditEnvironmentController {

	private final AuditEnvironmentService auditEnvironmentService;

	public AuditEnvironmentController(AuditEnvironmentService auditEnvironmentService) {
		this.auditEnvironmentService = auditEnvironmentService;
	}

	@GetMapping("/environments")
	public List<EnvironmentResponse> listEnvironments() {
		return auditEnvironmentService.listEnvironments();
	}

	@GetMapping("/environments/{environmentId}/projects")
	public List<ProjectResponse> listProjects(@PathVariable Long environmentId) {
		return auditEnvironmentService.listProjects(environmentId);
	}
}
