package com.test.backend.audit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "query_sections", indexes = @Index(name = "idx_query_sections_audit_query_sort", columnList = "audit_query_id, sort_order"))
public class QuerySection {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "audit_query_id", nullable = false)
	private AuditQuery auditQuery;

	@Column(nullable = false, length = 200)
	private String name;

	@Lob
	@Column(nullable = false)
	private String sqlFragment;

	@Column(name = "sort_order", nullable = false)
	private int sortOrder;

	@Column(name = "default_enabled", nullable = false)
	private boolean defaultEnabled = true;

	protected QuerySection() {
	}

	public QuerySection(String name, String sqlFragment, int sortOrder, boolean defaultEnabled) {
		this.name = name;
		this.sqlFragment = sqlFragment;
		this.sortOrder = sortOrder;
		this.defaultEnabled = defaultEnabled;
	}

	public Long getId() {
		return id;
	}

	public AuditQuery getAuditQuery() {
		return auditQuery;
	}

	public void setAuditQuery(AuditQuery auditQuery) {
		this.auditQuery = auditQuery;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getSqlFragment() {
		return sqlFragment;
	}

	public void setSqlFragment(String sqlFragment) {
		this.sqlFragment = sqlFragment;
	}

	public int getSortOrder() {
		return sortOrder;
	}

	public void setSortOrder(int sortOrder) {
		this.sortOrder = sortOrder;
	}

	public boolean isDefaultEnabled() {
		return defaultEnabled;
	}

	public void setDefaultEnabled(boolean defaultEnabled) {
		this.defaultEnabled = defaultEnabled;
	}
}
