package com.test.backend.repository.category;

import com.test.backend.entity.category.AuditCategory;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditCategoryRepository extends JpaRepository<AuditCategory, Long> {

	List<AuditCategory> findAllByOrderByNameAsc();
}
