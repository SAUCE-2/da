package com.test.backend.entity.plan;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

@Entity
@Table(name = "audit_plans")
public class AuditPlan {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 200)
	private String name;

	@Column(length = 1000)
	private String description;

	@Column(nullable = false)
	private boolean active = true;

	@OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("sortOrder ASC, id ASC")
	private List<PlanItem> items = new ArrayList<>();

	protected AuditPlan() {
	}

	public AuditPlan(String name, String description, boolean active) {
		this.name = name;
		this.description = description;
		this.active = active;
	}

	public Long getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public List<PlanItem> getItems() {
		return items;
	}

	public void replaceItems(List<PlanItem> replacementItems) {
		items.clear();
		replacementItems.forEach(this::addItem);
	}

	public void addItem(PlanItem item) {
		item.setPlan(this);
		items.add(item);
	}
}
