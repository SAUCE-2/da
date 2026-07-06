package com.test.backend.service.plan;

import com.test.backend.entity.plan.AuditPlan;
import com.test.backend.entity.plan.PlanItem;
import com.test.backend.entity.plan.PlanItemVariable;
import com.test.backend.repository.plan.AuditPlanRepository;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.test.backend.entity.query.AuditQuery;
import com.test.backend.repository.query.AuditQueryRepository;
import com.test.backend.domain.query.AuditQuerySqlRenderer;
import com.test.backend.entity.query.AuditQueryVersion;
import com.test.backend.repository.query.AuditQueryVersionRepository;
import com.test.backend.service.query.AuditQueryVersionResolver;
import com.test.backend.dto.plan.AuditPlanRequest;
import com.test.backend.dto.plan.AuditPlanResponse;
import com.test.backend.dto.plan.PlanItemRequest;
import com.test.backend.dto.plan.PlanItemResponse;
import com.test.backend.dto.plan.PlanItemVariableBindingRequest;
import com.test.backend.dto.plan.PlanItemVariableBindingResponse;

@Service
public class AuditPlanService {

	private final AuditPlanRepository auditPlanRepository;
	private final AuditQueryRepository auditQueryRepository;
	private final AuditQueryVersionRepository auditQueryVersionRepository;
	private final AuditQueryVersionResolver versionResolver;

	public AuditPlanService(
			AuditPlanRepository auditPlanRepository,
			AuditQueryRepository auditQueryRepository,
			AuditQueryVersionRepository auditQueryVersionRepository,
			AuditQueryVersionResolver versionResolver) {
		this.auditPlanRepository = auditPlanRepository;
		this.auditQueryRepository = auditQueryRepository;
		this.auditQueryVersionRepository = auditQueryVersionRepository;
		this.versionResolver = versionResolver;
	}

	@Transactional(readOnly = true)
	public List<AuditPlanResponse> listPlans() {
		return auditPlanRepository.findAllByOrderByNameAsc().stream()
				.map(this::toResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public AuditPlanResponse getPlan(Long id) {
		return toResponse(getPlanEntity(id));
	}

	@Transactional
	public AuditPlanResponse createPlan(AuditPlanRequest request) {
		AuditPlan plan = new AuditPlan(
				request.name(),
				request.description(),
				activeOrDefault(request.active()));
		plan.replaceItems(toReplacementItems(request.items()));
		return toResponse(auditPlanRepository.save(plan));
	}

	@Transactional
	public AuditPlanResponse updatePlan(Long id, AuditPlanRequest request) {
		AuditPlan plan = getPlanEntity(id);
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
		if (!auditPlanRepository.existsById(id)) {
			throw notFound("Audit plan not found: " + id);
		}
		auditPlanRepository.deleteById(id);
	}

	private List<PlanItem> toReplacementItems(List<PlanItemRequest> requests) {
		if (requests == null) {
			return List.of();
		}
		return requests.stream().map(this::toPlanItem).toList();
	}

	private PlanItem toPlanItem(PlanItemRequest request) {
		AuditQuery auditQuery = auditQueryRepository.findById(request.auditQueryId())
				.orElseThrow(() -> new ResponseStatusException(
						HttpStatus.BAD_REQUEST,
						"Unknown audit query id: " + request.auditQueryId()));

		AuditQueryVersion version = versionResolver.requireVersion(auditQuery, request.auditQueryVersionId());
		PlanItem item = new PlanItem(
				auditQuery,
				request.sortOrder(),
				request.enabled() == null || request.enabled());
		item.setAuditQueryVersion(version);

		List<PlanItemVariable> bindings = seedVariableBindings(version, request.variableBindings());
		item.replaceVariableBindings(bindings);
		return item;
	}

	private List<PlanItemVariable> seedVariableBindings(
			AuditQueryVersion version,
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
				.sorted(AuditQuerySqlRenderer::compareVariables)
				.map(variable -> {
					String value = valuesByName.containsKey(variable.getName())
							? valuesByName.get(variable.getName())
							: defaultString(variable.getDefaultValue());
					return new PlanItemVariable(variable.getName(), value);
				})
				.toList();
	}

	private AuditPlan getPlanEntity(Long id) {
		return auditPlanRepository.findWithItemsById(id)
				.orElseThrow(() -> notFound("Audit plan not found: " + id));
	}

	private AuditPlanResponse toResponse(AuditPlan plan) {
		return new AuditPlanResponse(
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
		AuditQuery auditQuery = item.getAuditQuery();
		AuditQueryVersion version = item.getAuditQueryVersion();
		Long versionId = version == null ? auditQuery.getCurrentVersionId() : version.getId();
		Integer versionNumber = version == null ? null : version.getVersionNumber();
		if (version == null && versionId != null) {
			version = auditQueryVersionRepository.findById(versionId).orElse(null);
			versionNumber = version == null ? null : version.getVersionNumber();
		}
		return new PlanItemResponse(
				item.getId(),
				item.getAuditQuery().getId(),
				item.getAuditQuery().getName(),
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
