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
		name = "query_versions",
		uniqueConstraints = @UniqueConstraint(
				name = "uk_query_versions_number",
				columnNames = { "query_id", "version_number" }))
public class QueryVersion {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "query_id", nullable = false)
	private Query query;

	@Column(name = "version_number", nullable = false)
	private int versionNumber;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt = Instant.now();

	@OneToMany(mappedBy = "queryVersion", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("sortOrder ASC, id ASC")
	private List<QuerySection> sections = new ArrayList<>();

	@OneToMany(mappedBy = "queryVersion", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("sortOrder ASC, id ASC")
	private List<QueryVariable> variables = new ArrayList<>();

	protected QueryVersion() {
	}

	public QueryVersion(Query query, int versionNumber) {
		this.query = query;
		this.versionNumber = versionNumber;
	}

	public Long getId() {
		return id;
	}

	public Query getQuery() {
		return query;
	}

	public void setQuery(Query query) {
		this.query = query;
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
		section.setQueryVersion(this);
		sections.add(section);
	}

	public void replaceVariables(List<QueryVariable> replacementVariables) {
		variables.clear();
		replacementVariables.forEach(this::addVariable);
	}

	public void addVariable(QueryVariable variable) {
		variable.setQueryVersion(this);
		variables.add(variable);
	}
}
