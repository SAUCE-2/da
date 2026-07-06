package com.test.backend.repository.environment;

import com.test.backend.entity.environment.Environment;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EnvironmentRepository extends JpaRepository<Environment, Long> {

	List<Environment> findAllByOrderByNameAsc();
}
