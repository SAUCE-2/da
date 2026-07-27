package com.test.backend.repository.query;

import com.test.backend.entity.category.Category;
import com.test.backend.entity.query.Query;
import com.test.backend.entity.query.QueryVersion;
import com.test.backend.repository.category.CategoryRepository;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.LinkedHashSet;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;

@SpringBootTest
@Transactional
class MetadataPersistenceTests {

	@Autowired
	private CategoryRepository categoryRepository;

	@Autowired
	private QueryRepository queryRepository;

	@Autowired
	private QueryVersionRepository queryVersionRepository;

	@Autowired
	private EntityManager entityManager;

	@Test
	void persistsQueryVersionsTextAndCategories() {
		Category category = categoryRepository.save(new Category("Group Alpha", "Grouping metadata"));
		Query query = new Query("Definition Alpha", true);
		QueryVersion version = query.addVersion(1);
		version.setName("Definition Alpha");
		version.setDescription("Persistence example");
		String queryText = "--# Block A\nFRAGMENT_A\n--# Block B\nFRAGMENT_B";
		version.setQueryText(queryText);
		version.setDefaultDisabledLines("1,2");
		query.replaceCategories(new LinkedHashSet<>(List.of(category)));

		Long queryId = queryRepository.saveAndFlush(query).getId();
		query.setCurrentVersionId(version.getId());
		queryRepository.saveAndFlush(query);
		entityManager.clear();

		Query reloaded = queryRepository.findById(queryId).orElseThrow();
		QueryVersion reloadedVersion = queryVersionRepository.findById(version.getId()).orElseThrow();

		assertEquals("Definition Alpha", reloaded.getName());
		assertEquals("Definition Alpha", reloadedVersion.getName());
		assertEquals("Persistence example", reloadedVersion.getDescription());
		assertTrue(reloaded.isActive());
		assertEquals(1, reloadedVersion.getVersionNumber());
		assertEquals(queryText, reloadedVersion.getQueryText());
		assertEquals("1,2", reloadedVersion.getDefaultDisabledLines());
		assertEquals(1, reloaded.getCategories().size());
		assertEquals("Group Alpha", reloaded.getCategories().iterator().next().getName());
	}
}
