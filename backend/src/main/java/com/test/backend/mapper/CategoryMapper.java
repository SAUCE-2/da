package com.test.backend.mapper;

import com.test.backend.dto.category.CategoryResponse;
import com.test.backend.dto.category.CategorySummaryResponse;
import com.test.backend.entity.category.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

	CategorySummaryResponse toSummaryResponse(Category category);

	@Mapping(target = "queryCount", expression = "java(category.getQueries().size())")
	CategoryResponse toResponse(Category category);
}
