package com.test.backend.repository.environment;

import com.test.backend.entity.environment.Project;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {

	@EntityGraph(attributePaths = "environment")
	Optional<Project> findWithEnvironmentById(Long id);
}
