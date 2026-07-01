package com.test.backend.audit;

import java.util.LinkedHashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "audit_categories", uniqueConstraints = @UniqueConstraint(name = "uk_audit_categories_name", columnNames = "name"))
public class AuditCategory {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 200)
	private String name;

	@Column(length = 1000)
	private String description;

	@ManyToMany(mappedBy = "categories")
	private Set<AuditQuery> auditQueries = new LinkedHashSet<>();

	protected AuditCategory() {
	}

	public AuditCategory(String name, String description) {
		this.name = name;
		this.description = description;
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

	public Set<AuditQuery> getAuditQueries() {
		return auditQueries;
	}
}
