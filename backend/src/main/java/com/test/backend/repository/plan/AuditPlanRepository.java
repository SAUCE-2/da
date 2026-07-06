package com.test.backend.repository.plan;

import com.test.backend.entity.plan.AuditPlan;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditPlanRepository extends JpaRepository<AuditPlan, Long> {

	List<AuditPlan> findAllByOrderByNameAsc();

	@Query("""
			SELECT DISTINCT plan
			FROM AuditPlan plan
			LEFT JOIN FETCH plan.items items
			LEFT JOIN FETCH items.auditQuery
			LEFT JOIN FETCH items.auditQueryVersion
			WHERE plan.id = :id
			""")
	Optional<AuditPlan> findWithItemsById(@Param("id") Long id);
}
