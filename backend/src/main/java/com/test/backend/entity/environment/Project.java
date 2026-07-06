package com.test.backend.entity.environment;

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

@Entity
@Table(
		name = "projects",
		uniqueConstraints = @UniqueConstraint(
				name = "uk_projects_environment_code",
				columnNames = { "environment_id", "code" }))
public class Project {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "environment_id", nullable = false)
	private Environment environment;

	@Column(nullable = false, length = 200)
	private String name;

	@Column(nullable = false, length = 50)
	private String code;

	@Column(name = "schema_name", length = 200)
	private String schemaName;

	@Column(nullable = false)
	private boolean active = true;

	protected Project() {
	}

	public Project(Environment environment, String name, String code, String schemaName, boolean active) {
		this.environment = environment;
		this.name = name;
		this.code = code;
		this.schemaName = schemaName;
		this.active = active;
	}

	public Long getId() {
		return id;
	}

	public Environment getEnvironment() {
		return environment;
	}

	public String getName() {
		return name;
	}

	public String getCode() {
		return code;
	}

	public String getSchemaName() {
		return schemaName;
	}

	public boolean isActive() {
		return active;
	}
}
