package com.test.backend.repository.query;

import com.test.backend.entity.query.Query;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface QueryRepository extends JpaRepository<Query, Long> {

	List<Query> findAllByOrderByNameAsc();
}
