package com.test.backend.service.plan;

import com.test.backend.query.DisabledLineRemapper;
import com.test.backend.query.DisabledLines;
import com.test.backend.query.QueryVariables;
import com.test.backend.dto.plan.PlanItemRequest;
import com.test.backend.dto.plan.PlanItemResponse;
import com.test.backend.dto.plan.PlanItemVariableBindingRequest;
import com.test.backend.dto.plan.PlanRequest;
import com.test.backend.dto.plan.PlanResponse;
import com.test.backend.dto.plan.PlanSummaryResponse;
import com.test.backend.entity.plan.Plan;
import com.test.backend.entity.plan.PlanItem;
import com.test.backend.entity.plan.PlanItemVariable;
import com.test.backend.entity.query.Query;
import com.test.backend.entity.query.QueryVersion;
import com.test.backend.mapper.PlanMapper;
import com.test.backend.repository.plan.PlanRepository;
import com.test.backend.repository.query.QueryRepository;
import com.test.backend.service.query.QueryVersionResolver;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static com.test.backend.service.ServiceSupport.activeOrDefault;
import static com.test.backend.service.ServiceSupport.notFound;

@Service
@RequiredArgsConstructor
public class PlanService {

	private final PlanRepository planRepository;
	private final QueryRepository queryRepository;
	private final QueryVersionResolver versionResolver;
	private final PlanMapper planMapper;

	@Transactional(readOnly = true)
	public List<PlanSummaryResponse> listPlans() {
		return planRepository.findAllByOrderByNameAsc().stream()
				.map(planMapper::toSummaryResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public PlanResponse getPlan(Long id) {
		return toResponse(getPlanEntity(id));
	}

	@Transactional
	public PlanResponse createPlan(PlanRequest request) {
		Plan plan = new Plan(
				request.name(),
				request.description(),
				activeOrDefault(request.active()));
		plan.replaceItems(toReplacementItems(request.items(), null));
		return toResponse(planRepository.save(plan));
	}

	@Transactional
	public PlanResponse updatePlan(Long id, PlanRequest request) {
		Plan plan = getPlanEntity(id);
		Map<Long, PlanItem> previousByQueryId = plan.getItems().stream()
				.collect(Collectors.toMap(
						item -> item.getQuery().getId(),
						item -> item,
						(left, right) -> left,
						LinkedHashMap::new));
		plan.setName(request.name());
		plan.setDescription(request.description());
		if (request.active() != null) {
			plan.setActive(request.active());
		}
		plan.replaceItems(toReplacementItems(request.items(), previousByQueryId));
		return toResponse(plan);
	}

	@Transactional
	public void deletePlan(Long id) {
		if (!planRepository.existsById(id)) {
			throw notFound("Plan not found: " + id);
		}
		planRepository.deleteById(id);
	}

	private List<PlanItem> toReplacementItems(
			List<PlanItemRequest> requests,
			Map<Long, PlanItem> previousByQueryId) {
		if (requests == null) {
			return List.of();
		}
		return requests.stream()
				.map(request -> toPlanItem(request, previousByQueryId))
				.toList();
	}

	private PlanItem toPlanItem(PlanItemRequest request, Map<Long, PlanItem> previousByQueryId) {
		Query query = queryRepository.findById(request.queryId())
				.orElseThrow(() -> new ResponseStatusException(
						HttpStatus.BAD_REQUEST,
						"Unknown query id: " + request.queryId()));

		QueryVersion version = versionResolver.requireVersion(query, request.queryVersionId());
		PlanItem item = new PlanItem(
				query,
				request.sortOrder(),
				request.enabled() == null || request.enabled());
		item.setQueryVersion(version);

		DisabledLines disabledLines = resolveDisabledLines(request, version, previousByQueryId);
		item.setDisabledLines(disabledLines.format());

		List<PlanItemVariable> bindings = seedVariableBindings(version, request.variableBindings());
		item.replaceVariableBindings(bindings);
		return item;
	}

	private DisabledLines resolveDisabledLines(
			PlanItemRequest request,
			QueryVersion version,
			Map<Long, PlanItem> previousByQueryId) {
		if (request.disabledLines() != null) {
			return DisabledLines.of(request.disabledLines());
		}

		PlanItem previous = previousByQueryId == null ? null : previousByQueryId.get(request.queryId());
		if (previous == null) {
			return DisabledLines.parse(version.getDefaultDisabledLines());
		}

		QueryVersion previousVersion = previous.getQueryVersion();
		DisabledLines previousDisabled = DisabledLines.parse(previous.getDisabledLines());
		if (previousVersion == null || Objects.equals(previousVersion.getId(), version.getId())) {
			return previousDisabled;
		}

		return DisabledLineRemapper.remap(
				previousVersion.getQueryText(),
				version.getQueryText(),
				previousDisabled);
	}

	private List<PlanItemVariable> seedVariableBindings(
			QueryVersion version,
			List<PlanItemVariableBindingRequest> requestedBindings) {
		Map<String, String> valuesByName = requestedBindings == null
				? Map.of()
				: requestedBindings.stream()
						.collect(Collectors.toMap(
								PlanItemVariableBindingRequest::name,
								binding -> binding.value() == null ? "" : binding.value(),
								(left, right) -> right,
								LinkedHashMap::new));

		return version.getVariables().stream()
				.sorted(QueryVariables.BY_SORT_ORDER)
				.map(variable -> {
					String value = valuesByName.containsKey(variable.getName())
							? valuesByName.get(variable.getName())
							: defaultString(variable.getDefaultValue());
					return new PlanItemVariable(variable.getName(), value);
				})
				.toList();
	}

	private Plan getPlanEntity(Long id) {
		return planRepository.findWithItemsById(id)
				.orElseThrow(() -> notFound("Plan not found: " + id));
	}

	private PlanResponse toResponse(Plan plan) {
		List<PlanItemResponse> items = planMapper.sortedItems(plan).stream()
				.map(planMapper::toItemResponse)
				.toList();
		return planMapper.toResponse(plan, items);
	}

	private static String defaultString(String value) {
		return value == null ? "" : value;
	}
}
