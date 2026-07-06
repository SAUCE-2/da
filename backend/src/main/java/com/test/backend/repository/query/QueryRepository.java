package com.test.backend.repository.query;

import com.test.backend.entity.query.Query;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QueryRepository extends JpaRepository<Query, Long> {

	@org.springframework.data.jpa.repository.Query("""
			SELECT DISTINCT query
			FROM Query query
			LEFT JOIN FETCH query.categories
			ORDER BY query.name ASC
			""")
	List<Query> findAllWithCategoriesByOrderByNameAsc();

	@org.springframework.data.jpa.repository.Query("""
			SELECT DISTINCT query
			FROM Query query
			LEFT JOIN FETCH query.categories
			WHERE query.id = :id
			""")
	Optional<Query> findWithCategoriesById(
			@org.springframework.data.repository.query.Param("id") Long id);
}
