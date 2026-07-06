package com.test.backend.entity.plan;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
		name = "plan_item_variables",
		uniqueConstraints = @UniqueConstraint(
				name = "uk_plan_item_variables_name",
				columnNames = { "plan_item_id", "variable_name" }))
public class PlanItemVariable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "plan_item_id", nullable = false)
	private PlanItem planItem;

	@Column(name = "variable_name", nullable = false, length = 100)
	private String variableName;

	@Column(name = "binding_value", length = 1000)
	private String value;

	protected PlanItemVariable() {
	}

	public PlanItemVariable(String variableName, String value) {
		this.variableName = variableName;
		this.value = value;
	}

	public Long getId() {
		return id;
	}

	public PlanItem getPlanItem() {
		return planItem;
	}

	public void setPlanItem(PlanItem planItem) {
		this.planItem = planItem;
	}

	public String getVariableName() {
		return variableName;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}
}
