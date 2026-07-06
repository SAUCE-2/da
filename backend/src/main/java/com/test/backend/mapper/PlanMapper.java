package com.test.backend.mapper;

import com.test.backend.dto.plan.PlanItemResponse;
import com.test.backend.dto.plan.PlanItemVariableBindingResponse;
import com.test.backend.dto.plan.PlanResponse;
import com.test.backend.entity.plan.Plan;
import com.test.backend.entity.plan.PlanItem;
import com.test.backend.entity.plan.PlanItemVariable;
import java.util.Comparator;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PlanMapper {

	@Mapping(target = "name", source = "variableName")
	PlanItemVariableBindingResponse toBindingResponse(PlanItemVariable binding);

	@Mapping(target = "queryId", source = "item.query.id")
	@Mapping(target = "queryName", source = "item.query.name")
	@Mapping(target = "queryVersionId", source = "versionId")
	@Mapping(target = "queryVersionNumber", source = "versionNumber")
	@Mapping(target = "variableBindings", source = "item.variableBindings")
	PlanItemResponse toItemResponse(PlanItem item, Long versionId, Integer versionNumber);

	default PlanResponse toResponse(Plan plan, List<PlanItemResponse> items) {
		return new PlanResponse(
				plan.getId(),
				plan.getName(),
				plan.getDescription(),
				plan.isActive(),
				items);
	}

	default List<PlanItem> sortedItems(Plan plan) {
		return plan.getItems().stream()
				.sorted(Comparator
						.comparingInt(PlanItem::getSortOrder)
						.thenComparing(PlanItem::getId, Comparator.nullsLast(Long::compareTo)))
				.toList();
	}
}
