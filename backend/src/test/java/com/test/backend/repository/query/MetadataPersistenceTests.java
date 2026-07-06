package com.test.backend.repository.query;

import com.test.backend.entity.category.Category;
import com.test.backend.entity.query.Query;
import com.test.backend.entity.query.QueryVersion;
import com.test.backend.entity.query.QuerySection;
import com.test.backend.repository.category.CategoryRepository;
import com.test.backend.repository.query.QueryRepository;
import com.test.backend.repository.query.QueryVersionRepository;
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
	void persistsQueryVersionsSectionsAndCategories() {
		Category category = categoryRepository.save(new Category("Group Alpha", "Grouping metadata"));
		Query query = new Query("Definition Alpha", "Persistence example", true);
		QueryVersion version = query.addVersion(1);
		version.addSection(new QuerySection("Block B", "FRAGMENT_B", 20, true));
		version.addSection(new QuerySection("Block A", "FRAGMENT_A", 10, false));
		query.replaceCategories(new LinkedHashSet<>(List.of(category)));

		Long queryId = queryRepository.saveAndFlush(query).getId();
		query.setCurrentVersionId(version.getId());
		queryRepository.saveAndFlush(query);
		entityManager.clear();

		Query reloaded = queryRepository.findById(queryId).orElseThrow();
		QueryVersion reloadedVersion = queryVersionRepository.findById(version.getId()).orElseThrow();

		assertEquals("Definition Alpha", reloaded.getName());
		assertTrue(reloaded.isActive());
		assertEquals(1, reloadedVersion.getVersionNumber());
		assertEquals(2, reloadedVersion.getSections().size());
		assertEquals("Block A", reloadedVersion.getSections().getFirst().getName());
		assertEquals(false, reloadedVersion.getSections().getFirst().isDefaultEnabled());
		assertEquals(1, reloaded.getCategories().size());
		assertEquals("Group Alpha", reloaded.getCategories().iterator().next().getName());
	}
}
