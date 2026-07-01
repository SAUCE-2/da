package com.test.backend.audit;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditQueryRepository extends JpaRepository<AuditQuery, Long> {

	List<AuditQuery> findAllByOrderByNameAsc();
}
