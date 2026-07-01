package com.test.backend.audit;

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
class AuditMetadataPersistenceTests {

	@Autowired
	private AuditCategoryRepository auditCategoryRepository;

	@Autowired
	private AuditQueryRepository auditQueryRepository;

	@Autowired
	private EntityManager entityManager;

	@Test
	void persistsAuditQuerySectionsAndCategories() {
		AuditCategory category = auditCategoryRepository.save(new AuditCategory("Group Alpha", "Grouping metadata"));
		AuditQuery query = new AuditQuery("Definition Alpha", "Persistence example", true);
		query.addSection(new QuerySection("Block B", "FRAGMENT_B", 20, true));
		query.addSection(new QuerySection("Block A", "FRAGMENT_A", 10, false));
		query.replaceCategories(new LinkedHashSet<>(List.of(category)));

		Long queryId = auditQueryRepository.saveAndFlush(query).getId();
		entityManager.clear();

		AuditQuery reloaded = auditQueryRepository.findById(queryId).orElseThrow();

		assertEquals("Definition Alpha", reloaded.getName());
		assertTrue(reloaded.isActive());
		assertEquals(2, reloaded.getSections().size());
		assertEquals("Block A", reloaded.getSections().getFirst().getName());
		assertEquals(false, reloaded.getSections().getFirst().isDefaultEnabled());
		assertEquals(1, reloaded.getCategories().size());
		assertEquals("Group Alpha", reloaded.getCategories().iterator().next().getName());
	}
}
