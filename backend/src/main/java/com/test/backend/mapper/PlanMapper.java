package com.test.backend.mapper;

import com.test.backend.query.DisabledLines;
import com.test.backend.dto.plan.PlanItemResponse;
import com.test.backend.dto.plan.PlanItemVariableBindingResponse;
import com.test.backend.dto.plan.PlanResponse;
import com.test.backend.dto.plan.PlanSummaryResponse;
import com.test.backend.entity.plan.Plan;
import com.test.backend.entity.plan.PlanItem;
import com.test.backend.entity.plan.PlanItemVariable;
import java.util.Comparator;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface PlanMapper {

	@Mapping(target = "name", source = "variableName")
	PlanItemVariableBindingResponse toBindingResponse(PlanItemVariable binding);

	@Mapping(target = "queryId", source = "query.id")
	@Mapping(target = "disabledLines", source = ".", qualifiedByName = "mapDisabledLines")
	PlanItemResponse toItemResponse(PlanItem item);

	@Named("mapDisabledLines")
	default List<Integer> mapDisabledLines(PlanItem item) {
		return DisabledLines.parse(item.getDisabledLines()).toList();
	}

	default PlanResponse toResponse(Plan plan, List<PlanItemResponse> items) {
		return new PlanResponse(
				plan.getId(),
				plan.getName(),
				plan.getDescription(),
				plan.isActive(),
				items);
	}

	default PlanSummaryResponse toSummaryResponse(Plan plan) {
		return new PlanSummaryResponse(
				plan.getId(),
				plan.getName(),
				plan.getDescription(),
				plan.isActive(),
				plan.getItems().size());
	}

	default List<PlanItem> sortedItems(Plan plan) {
		return plan.getItems().stream()
				.sorted(Comparator
						.comparingInt(PlanItem::getSortOrder)
						.thenComparing(PlanItem::getId, Comparator.nullsLast(Long::compareTo)))
				.toList();
	}
}
