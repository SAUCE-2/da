package com.test.backend.audit;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditCategoryRepository extends JpaRepository<AuditCategory, Long> {

	List<AuditCategory> findAllByOrderByNameAsc();
}
