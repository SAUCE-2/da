package com.test.backend.service.environment;

import com.test.backend.entity.environment.Environment;
import com.test.backend.entity.environment.Project;
import com.test.backend.repository.environment.EnvironmentRepository;
import com.test.backend.repository.environment.ProjectRepository;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.test.backend.dto.environment.EnvironmentResponse;
import com.test.backend.dto.environment.ProjectResponse;

@Service
public class AuditEnvironmentService {

	private final EnvironmentRepository environmentRepository;
	private final ProjectRepository projectRepository;

	public AuditEnvironmentService(EnvironmentRepository environmentRepository, ProjectRepository projectRepository) {
		this.environmentRepository = environmentRepository;
		this.projectRepository = projectRepository;
	}

	@Transactional(readOnly = true)
	public List<EnvironmentResponse> listEnvironments() {
		return environmentRepository.findAllByOrderByNameAsc().stream()
				.map(environment -> new EnvironmentResponse(
						environment.getId(),
						environment.getName(),
						environment.getCode(),
						environment.isActive()))
				.toList();
	}

	@Transactional(readOnly = true)
	public List<ProjectResponse> listProjects(Long environmentId) {
		return projectRepository.findAll().stream()
				.filter(project -> project.getEnvironment().getId().equals(environmentId))
				.sorted(java.util.Comparator.comparing(Project::getName))
				.map(project -> new ProjectResponse(
						project.getId(),
						project.getEnvironment().getId(),
						project.getName(),
						project.getCode(),
						project.getSchemaName(),
						project.isActive()))
				.toList();
	}

	@Transactional(readOnly = true)
	public Project requireProjectForEnvironment(Long projectId, Long environmentId) {
		Project project = projectRepository.findWithEnvironmentById(projectId)
				.orElseThrow(() -> notFound("Project not found: " + projectId));
		if (!project.getEnvironment().getId().equals(environmentId)) {
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST,
					"Project " + projectId + " does not belong to environment " + environmentId);
		}
		return project;
	}

	@Transactional(readOnly = true)
	public Environment requireEnvironment(Long environmentId) {
		return environmentRepository.findById(environmentId)
				.orElseThrow(() -> notFound("Environment not found: " + environmentId));
	}

	private static ResponseStatusException notFound(String message) {
		return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
	}
}
