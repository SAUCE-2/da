package com.test.backend.service.category;

import com.test.backend.entity.category.Category;
import com.test.backend.repository.category.CategoryRepository;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.test.backend.dto.category.CategoryRequest;
import com.test.backend.dto.category.CategoryResponse;

@Service
public class CategoryService {

	private final CategoryRepository categoryRepository;

	public CategoryService(CategoryRepository categoryRepository) {
		this.categoryRepository = categoryRepository;
	}

	@Transactional(readOnly = true)
	public List<CategoryResponse> listCategories() {
		return categoryRepository.findAllByOrderByNameAsc().stream()
				.map(this::toResponse)
				.toList();
	}

	@Transactional
	public CategoryResponse createCategory(CategoryRequest request) {
		Category category = new Category(request.name(), request.description());
		return toResponse(categoryRepository.save(category));
	}

	@Transactional
	public CategoryResponse updateCategory(Long id, CategoryRequest request) {
		Category category = getCategoryEntity(id);
		category.setName(request.name());
		category.setDescription(request.description());
		return toResponse(category);
	}

	@Transactional
	public void deleteCategory(Long id) {
		Category category = getCategoryEntity(id);
		new ArrayList<>(category.getQueries()).forEach(query -> query.getCategories().remove(category));
		categoryRepository.delete(category);
	}

	private Category getCategoryEntity(Long id) {
		return categoryRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found: " + id));
	}

	private CategoryResponse toResponse(Category category) {
		return new CategoryResponse(
				category.getId(),
				category.getName(),
				category.getDescription(),
				category.getQueries().size());
	}
}
