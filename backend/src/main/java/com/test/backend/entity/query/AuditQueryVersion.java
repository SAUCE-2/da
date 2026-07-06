package com.test.backend.entity.query;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
		name = "audit_query_versions",
		uniqueConstraints = @UniqueConstraint(
				name = "uk_audit_query_versions_number",
				columnNames = { "audit_query_id", "version_number" }))
public class AuditQueryVersion {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "audit_query_id", nullable = false)
	private AuditQuery auditQuery;

	@Column(name = "version_number", nullable = false)
	private int versionNumber;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt = Instant.now();

	@OneToMany(mappedBy = "auditQueryVersion", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("sortOrder ASC, id ASC")
	private List<QuerySection> sections = new ArrayList<>();

	@OneToMany(mappedBy = "auditQueryVersion", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("sortOrder ASC, id ASC")
	private List<QueryVariable> variables = new ArrayList<>();

	protected AuditQueryVersion() {
	}

	public AuditQueryVersion(AuditQuery auditQuery, int versionNumber) {
		this.auditQuery = auditQuery;
		this.versionNumber = versionNumber;
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

	public int getVersionNumber() {
		return versionNumber;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public List<QuerySection> getSections() {
		return sections;
	}

	public List<QueryVariable> getVariables() {
		return variables;
	}

	public void replaceSections(List<QuerySection> replacementSections) {
		sections.clear();
		replacementSections.forEach(this::addSection);
	}

	public void addSection(QuerySection section) {
		section.setAuditQueryVersion(this);
		sections.add(section);
	}

	public void replaceVariables(List<QueryVariable> replacementVariables) {
		variables.clear();
		replacementVariables.forEach(this::addVariable);
	}

	public void addVariable(QueryVariable variable) {
		variable.setAuditQueryVersion(this);
		variables.add(variable);
	}
}
