package com.test.backend.service.category;

import com.test.backend.entity.category.AuditCategory;
import com.test.backend.repository.category.AuditCategoryRepository;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.test.backend.dto.category.AuditCategoryRequest;
import com.test.backend.dto.category.AuditCategoryResponse;

@Service
public class AuditCategoryService {

	private final AuditCategoryRepository auditCategoryRepository;

	public AuditCategoryService(AuditCategoryRepository auditCategoryRepository) {
		this.auditCategoryRepository = auditCategoryRepository;
	}

	@Transactional(readOnly = true)
	public List<AuditCategoryResponse> listCategories() {
		return auditCategoryRepository.findAllByOrderByNameAsc().stream()
				.map(this::toResponse)
				.toList();
	}

	@Transactional
	public AuditCategoryResponse createCategory(AuditCategoryRequest request) {
		AuditCategory category = new AuditCategory(request.name(), request.description());
		return toResponse(auditCategoryRepository.save(category));
	}

	@Transactional
	public AuditCategoryResponse updateCategory(Long id, AuditCategoryRequest request) {
		AuditCategory category = getCategoryEntity(id);
		category.setName(request.name());
		category.setDescription(request.description());
		return toResponse(category);
	}

	@Transactional
	public void deleteCategory(Long id) {
		AuditCategory category = getCategoryEntity(id);
		new ArrayList<>(category.getAuditQueries()).forEach(query -> query.getCategories().remove(category));
		auditCategoryRepository.delete(category);
	}

	private AuditCategory getCategoryEntity(Long id) {
		return auditCategoryRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Audit category not found: " + id));
	}

	private AuditCategoryResponse toResponse(AuditCategory category) {
		return new AuditCategoryResponse(
				category.getId(),
				category.getName(),
				category.getDescription(),
				category.getAuditQueries().size());
	}
}
