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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
		name = "plan_item_variables",
		uniqueConstraints = @UniqueConstraint(
				name = "uk_plan_item_variables_name",
				columnNames = { "plan_item_id", "variable_name" }))
@Getter
@Setter
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
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

	public PlanItemVariable(String variableName, String value) {
		this.variableName = variableName;
		this.value = value;
	}
}
