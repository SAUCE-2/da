package com.test.backend.repository.plan;

import com.test.backend.entity.plan.Plan;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PlanRepository extends JpaRepository<Plan, Long> {

	List<Plan> findAllByOrderByNameAsc();

	@Query("""
			SELECT DISTINCT plan
			FROM Plan plan
			LEFT JOIN FETCH plan.items items
			LEFT JOIN FETCH items.query
			LEFT JOIN FETCH items.queryVersion
			WHERE plan.id = :id
			""")
	Optional<Plan> findWithItemsById(@Param("id") Long id);
}
