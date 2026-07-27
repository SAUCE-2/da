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
import jakarta.persistence.Lob;
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
		name = "query_versions",
		uniqueConstraints = @UniqueConstraint(
				name = "uk_query_versions_number",
				columnNames = { "query_id", "version_number" }))
@Getter
@Setter
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
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

	@Column(nullable = false, length = 200)
	private String name = "";

	@Column(length = 1000)
	private String description;

	@Lob
	@Column(name = "query", nullable = false)
	private String queryText = "";

	/**
	 * Comma-separated 1-based line numbers disabled by default for this version.
	 * Plan items may override this set.
	 */
	@Column(name = "default_disabled_lines", length = 4000)
	private String defaultDisabledLines = "";

	@OneToMany(mappedBy = "queryVersion", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("sortOrder ASC, id ASC")
	private List<QueryVariable> variables = new ArrayList<>();

	public QueryVersion(Query query, int versionNumber) {
		this.query = query;
		this.versionNumber = versionNumber;
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
