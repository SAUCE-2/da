package com.test.backend.controller.category;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.test.backend.service.category.AuditCategoryService;
import com.test.backend.dto.category.AuditCategoryRequest;
import com.test.backend.dto.category.AuditCategoryResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/audit-categories")
public class AuditCategoryController {

	private final AuditCategoryService auditCategoryService;

	public AuditCategoryController(AuditCategoryService auditCategoryService) {
		this.auditCategoryService = auditCategoryService;
	}

	@GetMapping
	public List<AuditCategoryResponse> listCategories() {
		return auditCategoryService.listCategories();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public AuditCategoryResponse createCategory(@Valid @RequestBody AuditCategoryRequest request) {
		return auditCategoryService.createCategory(request);
	}

	@PutMapping("/{id}")
	public AuditCategoryResponse updateCategory(@PathVariable Long id, @Valid @RequestBody AuditCategoryRequest request) {
		return auditCategoryService.updateCategory(id, request);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
		auditCategoryService.deleteCategory(id);
		return ResponseEntity.noContent().build();
	}
}
