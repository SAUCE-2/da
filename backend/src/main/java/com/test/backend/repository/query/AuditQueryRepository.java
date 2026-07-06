package com.test.backend.repository.query;

import com.test.backend.entity.query.AuditQuery;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditQueryRepository extends JpaRepository<AuditQuery, Long> {

	List<AuditQuery> findAllByOrderByNameAsc();
}
