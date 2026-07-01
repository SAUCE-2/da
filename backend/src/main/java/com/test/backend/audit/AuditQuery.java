package com.test.backend.audit;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "audit_queries")
public class AuditQuery {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 200)
	private String name;

	@Column(length = 1000)
	private String description;

	@Column(nullable = false)
	private boolean active = true;

	@OneToMany(mappedBy = "auditQuery", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("sortOrder ASC, id ASC")
	private List<QuerySection> sections = new ArrayList<>();

	@ManyToMany
	@JoinTable(
			name = "audit_query_categories",
			joinColumns = @JoinColumn(name = "audit_query_id"),
			inverseJoinColumns = @JoinColumn(name = "audit_category_id"),
			uniqueConstraints = @UniqueConstraint(
					name = "uk_audit_query_categories_pair",
					columnNames = { "audit_query_id", "audit_category_id" }))
	@OrderBy("name ASC")
	private Set<AuditCategory> categories = new LinkedHashSet<>();

	protected AuditQuery() {
	}

	public AuditQuery(String name, String description, boolean active) {
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

	public List<QuerySection> getSections() {
		return sections;
	}

	public Set<AuditCategory> getCategories() {
		return categories;
	}

	public void replaceSections(List<QuerySection> replacementSections) {
		sections.clear();
		replacementSections.forEach(this::addSection);
	}

	public void addSection(QuerySection section) {
		section.setAuditQuery(this);
		sections.add(section);
	}

	public void replaceCategories(Set<AuditCategory> replacementCategories) {
		new ArrayList<>(categories).forEach(category -> category.getAuditQueries().remove(this));
		categories.clear();
		replacementCategories.forEach(category -> {
			categories.add(category);
			category.getAuditQueries().add(this);
		});
	}
}
