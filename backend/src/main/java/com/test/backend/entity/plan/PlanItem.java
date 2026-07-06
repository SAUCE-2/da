package com.test.backend.entity.plan;

import com.test.backend.entity.query.AuditQuery;
import com.test.backend.entity.query.AuditQueryVersion;
import java.util.ArrayList;
import java.util.List;


import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
		name = "plan_items",
		indexes = @Index(name = "idx_plan_items_plan_sort", columnList = "plan_id, sort_order"),
		uniqueConstraints = @UniqueConstraint(
				name = "uk_plan_items_plan_query",
				columnNames = { "plan_id", "audit_query_id" }))
public class PlanItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "plan_id", nullable = false)
	private AuditPlan plan;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "audit_query_id", nullable = false)
	private AuditQuery auditQuery;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "audit_query_version_id")
	private AuditQueryVersion auditQueryVersion;

	@Column(name = "sort_order", nullable = false)
	private int sortOrder;

	@Column(nullable = false)
	private boolean enabled = true;

	@OneToMany(mappedBy = "planItem", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("variableName ASC")
	private List<PlanItemVariable> variableBindings = new ArrayList<>();

	protected PlanItem() {
	}

	public PlanItem(AuditQuery auditQuery, int sortOrder, boolean enabled) {
		this.auditQuery = auditQuery;
		this.sortOrder = sortOrder;
		this.enabled = enabled;
	}

	public Long getId() {
		return id;
	}

	public AuditPlan getPlan() {
		return plan;
	}

	public void setPlan(AuditPlan plan) {
		this.plan = plan;
	}

	public AuditQuery getAuditQuery() {
		return auditQuery;
	}

	public AuditQueryVersion getAuditQueryVersion() {
		return auditQueryVersion;
	}

	public void setAuditQueryVersion(AuditQueryVersion auditQueryVersion) {
		this.auditQueryVersion = auditQueryVersion;
	}

	public int getSortOrder() {
		return sortOrder;
	}

	public void setSortOrder(int sortOrder) {
		this.sortOrder = sortOrder;
	}

	public boolean isEnabled() {
		return enabled;
	}

	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}

	public List<PlanItemVariable> getVariableBindings() {
		return variableBindings;
	}

	public void replaceVariableBindings(List<PlanItemVariable> replacementBindings) {
		variableBindings.clear();
		replacementBindings.forEach(this::addVariableBinding);
	}

	public void addVariableBinding(PlanItemVariable binding) {
		binding.setPlanItem(this);
		variableBindings.add(binding);
	}
}
