package com.test.backend.mapper;

import com.test.backend.dto.category.CategorySummaryResponse;
import com.test.backend.dto.query.QueryResponse;
import com.test.backend.entity.category.Category;
import com.test.backend.entity.query.Query;
import com.test.backend.entity.query.QueryVersion;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring", uses = { QueryVersionMapper.class, CategoryMapper.class })
public abstract class QueryMapper {

	@Autowired
	private CategoryMapper categoryMapper;

	@Mapping(target = "id", source = "query.id")
	@Mapping(target = "versionId", source = "currentVersion.id")
	@Mapping(target = "sections", source = "currentVersion", qualifiedByName = "mapSections")
	@Mapping(target = "variables", source = "currentVersion", qualifiedByName = "mapVariables")
	@Mapping(target = "categories", source = "query.categories", qualifiedByName = "mapSortedCategories")
	public abstract QueryResponse toResponse(Query query, QueryVersion currentVersion);

	@Named("mapSortedCategories")
	protected List<CategorySummaryResponse> mapSortedCategories(Set<Category> categories) {
		return categories.stream()
				.sorted(Comparator.comparing(Category::getName).thenComparing(Category::getId))
				.map(categoryMapper::toSummaryResponse)
				.toList();
	}
}
