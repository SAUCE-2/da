package com.test.backend.entity.plan;

import com.test.backend.entity.query.Query;
import com.test.backend.entity.query.QueryVersion;
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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
		name = "plan_items",
		indexes = @Index(name = "idx_plan_items_plan_sort", columnList = "plan_id, sort_order"),
		uniqueConstraints = @UniqueConstraint(
				name = "uk_plan_items_plan_query",
				columnNames = { "plan_id", "query_id" }))
@Getter
@Setter
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
public class PlanItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "plan_id", nullable = false)
	private Plan plan;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "query_id", nullable = false)
	private Query query;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "query_version_id")
	private QueryVersion queryVersion;

	@Column(name = "sort_order", nullable = false)
	private int sortOrder;

	@Column(nullable = false)
	private boolean enabled = true;

	/**
	 * Comma-separated 1-based line numbers disabled for this plan item's run overlay.
	 */
	@Column(name = "disabled_lines", length = 4000)
	private String disabledLines = "";

	@OneToMany(mappedBy = "planItem", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("variableName ASC")
	private List<PlanItemVariable> variableBindings = new ArrayList<>();

	public PlanItem(Query query, int sortOrder, boolean enabled) {
		this.query = query;
		this.sortOrder = sortOrder;
		this.enabled = enabled;
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
