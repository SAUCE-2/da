package com.test.backend.entity.query;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
		name = "query_variables",
		indexes = @Index(
				name = "idx_query_variables_version_sort",
				columnList = "audit_query_version_id, sort_order"),
		uniqueConstraints = @UniqueConstraint(
				name = "uk_query_variables_version_name",
				columnNames = { "audit_query_version_id", "name" }))
public class QueryVariable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "audit_query_version_id", nullable = false)
	private AuditQueryVersion auditQueryVersion;

	@Column(nullable = false, length = 100)
	private String name;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private QueryVariableType type;

	@Column(name = "default_value", length = 1000)
	private String defaultValue;

	@Column(nullable = false)
	private boolean required = false;

	@Column(name = "sort_order", nullable = false)
	private int sortOrder;

	protected QueryVariable() {
	}

	public QueryVariable(
			String name,
			QueryVariableType type,
			String defaultValue,
			boolean required,
			int sortOrder) {
		this.name = name;
		this.type = type;
		this.defaultValue = defaultValue;
		this.required = required;
		this.sortOrder = sortOrder;
	}

	public Long getId() {
		return id;
	}

	public AuditQueryVersion getAuditQueryVersion() {
		return auditQueryVersion;
	}

	public void setAuditQueryVersion(AuditQueryVersion auditQueryVersion) {
		this.auditQueryVersion = auditQueryVersion;
	}

	public String getName() {
		return name;
	}

	public QueryVariableType getType() {
		return type;
	}

	public String getDefaultValue() {
		return defaultValue;
	}

	public boolean isRequired() {
		return required;
	}

	public int getSortOrder() {
		return sortOrder;
	}
}
