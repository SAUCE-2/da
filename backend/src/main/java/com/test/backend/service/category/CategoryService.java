package com.test.backend.service.category;

import com.test.backend.dto.category.CategoryRequest;
import com.test.backend.dto.category.CategoryResponse;
import com.test.backend.entity.category.Category;
import com.test.backend.mapper.CategoryMapper;
import com.test.backend.repository.category.CategoryRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.test.backend.service.ServiceSupport.notFound;

@Service
@RequiredArgsConstructor
public class CategoryService {

	private final CategoryRepository categoryRepository;
	private final CategoryMapper categoryMapper;

	@Transactional(readOnly = true)
	public List<CategoryResponse> listCategories() {
		return categoryRepository.findAllByOrderByNameAsc().stream()
				.map(categoryMapper::toResponse)
				.toList();
	}

	@Transactional
	public CategoryResponse createCategory(CategoryRequest request) {
		Category category = new Category(request.name(), request.description());
		return categoryMapper.toResponse(categoryRepository.save(category));
	}

	@Transactional
	public CategoryResponse updateCategory(Long id, CategoryRequest request) {
		Category category = getCategoryEntity(id);
		category.setName(request.name());
		category.setDescription(request.description());
		return categoryMapper.toResponse(category);
	}

	@Transactional
	public void deleteCategory(Long id) {
		Category category = getCategoryEntity(id);
		new ArrayList<>(category.getQueries()).forEach(query -> query.getCategories().remove(category));
		categoryRepository.delete(category);
	}

	private Category getCategoryEntity(Long id) {
		return categoryRepository.findById(id)
				.orElseThrow(() -> notFound("Category not found: " + id));
	}
}
