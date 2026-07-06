package com.test.backend.repository.query;

import com.test.backend.entity.category.AuditCategory;
import com.test.backend.entity.query.AuditQuery;
import com.test.backend.entity.query.AuditQueryVersion;
import com.test.backend.entity.query.QuerySection;
import com.test.backend.repository.category.AuditCategoryRepository;
import com.test.backend.repository.query.AuditQueryRepository;
import com.test.backend.repository.query.AuditQueryVersionRepository;
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
	private AuditQueryVersionRepository auditQueryVersionRepository;

	@Autowired
	private EntityManager entityManager;

	@Test
	void persistsAuditQueryVersionsSectionsAndCategories() {
		AuditCategory category = auditCategoryRepository.save(new AuditCategory("Group Alpha", "Grouping metadata"));
		AuditQuery query = new AuditQuery("Definition Alpha", "Persistence example", true);
		AuditQueryVersion version = query.addVersion(1);
		version.addSection(new QuerySection("Block B", "FRAGMENT_B", 20, true));
		version.addSection(new QuerySection("Block A", "FRAGMENT_A", 10, false));
		query.replaceCategories(new LinkedHashSet<>(List.of(category)));

		Long queryId = auditQueryRepository.saveAndFlush(query).getId();
		query.setCurrentVersionId(version.getId());
		auditQueryRepository.saveAndFlush(query);
		entityManager.clear();

		AuditQuery reloaded = auditQueryRepository.findById(queryId).orElseThrow();
		AuditQueryVersion reloadedVersion = auditQueryVersionRepository.findById(version.getId()).orElseThrow();

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
