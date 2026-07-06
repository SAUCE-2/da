package com.test.backend.service.plan;

import com.test.backend.entity.plan.Plan;
import com.test.backend.entity.plan.PlanItem;
import com.test.backend.entity.plan.PlanItemVariable;
import com.test.backend.repository.plan.PlanRepository;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.test.backend.entity.query.Query;
import com.test.backend.repository.query.QueryRepository;
import com.test.backend.domain.query.QuerySqlRenderer;
import com.test.backend.entity.query.QueryVersion;
import com.test.backend.repository.query.QueryVersionRepository;
import com.test.backend.service.query.QueryVersionResolver;
import com.test.backend.dto.plan.PlanRequest;
import com.test.backend.dto.plan.PlanResponse;
import com.test.backend.dto.plan.PlanItemRequest;
import com.test.backend.dto.plan.PlanItemResponse;
import com.test.backend.dto.plan.PlanItemVariableBindingRequest;
import com.test.backend.dto.plan.PlanItemVariableBindingResponse;

@Service
public class PlanService {

	private final PlanRepository planRepository;
	private final QueryRepository queryRepository;
	private final QueryVersionRepository queryVersionRepository;
	private final QueryVersionResolver versionResolver;

	public PlanService(
			PlanRepository planRepository,
			QueryRepository queryRepository,
			QueryVersionRepository queryVersionRepository,
			QueryVersionResolver versionResolver) {
		this.planRepository = planRepository;
		this.queryRepository = queryRepository;
		this.queryVersionRepository = queryVersionRepository;
		this.versionResolver = versionResolver;
	}

	@Transactional(readOnly = true)
	public List<PlanResponse> listPlans() {
		return planRepository.findAllByOrderByNameAsc().stream()
				.map(this::toResponse)
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
		plan.replaceItems(toReplacementItems(request.items()));
		return toResponse(planRepository.save(plan));
	}

	@Transactional
	public PlanResponse updatePlan(Long id, PlanRequest request) {
		Plan plan = getPlanEntity(id);
		plan.setName(request.name());
		plan.setDescription(request.description());
		if (request.active() != null) {
			plan.setActive(request.active());
		}
		plan.replaceItems(toReplacementItems(request.items()));
		return toResponse(plan);
	}

	@Transactional
	public void deletePlan(Long id) {
		if (!planRepository.existsById(id)) {
			throw notFound("Plan not found: " + id);
		}
		planRepository.deleteById(id);
	}

	private List<PlanItem> toReplacementItems(List<PlanItemRequest> requests) {
		if (requests == null) {
			return List.of();
		}
		return requests.stream().map(this::toPlanItem).toList();
	}

	private PlanItem toPlanItem(PlanItemRequest request) {
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

		List<PlanItemVariable> bindings = seedVariableBindings(version, request.variableBindings());
		item.replaceVariableBindings(bindings);
		return item;
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
				.sorted(QuerySqlRenderer::compareVariables)
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
		return new PlanResponse(
				plan.getId(),
				plan.getName(),
				plan.getDescription(),
				plan.isActive(),
				plan.getItems().stream()
						.sorted(Comparator.comparingInt(PlanItem::getSortOrder).thenComparing(PlanItem::getId, Comparator.nullsLast(Long::compareTo)))
						.map(this::toItemResponse)
						.toList());
	}

	private PlanItemResponse toItemResponse(PlanItem item) {
		Query query = item.getQuery();
		QueryVersion version = item.getQueryVersion();
		Long versionId = version == null ? query.getCurrentVersionId() : version.getId();
		Integer versionNumber = version == null ? null : version.getVersionNumber();
		if (version == null && versionId != null) {
			version = queryVersionRepository.findById(versionId).orElse(null);
			versionNumber = version == null ? null : version.getVersionNumber();
		}
		return new PlanItemResponse(
				item.getId(),
				item.getQuery().getId(),
				item.getQuery().getName(),
				version == null ? null : version.getId(),
				versionNumber,
				item.getSortOrder(),
				item.isEnabled(),
				item.getVariableBindings().stream()
						.map(binding -> new PlanItemVariableBindingResponse(binding.getVariableName(), binding.getValue()))
						.toList());
	}

	private static boolean activeOrDefault(Boolean active) {
		return active == null || active;
	}

	private static String defaultString(String value) {
		return value == null ? "" : value;
	}

	private static ResponseStatusException notFound(String message) {
		return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
	}
}
