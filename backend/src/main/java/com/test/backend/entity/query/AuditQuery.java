package com.test.backend.entity.query;

import com.test.backend.entity.category.AuditCategory;

import java.util.ArrayList;
import java.util.Comparator;
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

	@Column(name = "current_version_id")
	private Long currentVersionId;

	@OneToMany(mappedBy = "auditQuery", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("versionNumber ASC")
	private List<AuditQueryVersion> versions = new ArrayList<>();

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

	public Long getCurrentVersionId() {
		return currentVersionId;
	}

	public void setCurrentVersionId(Long currentVersionId) {
		this.currentVersionId = currentVersionId;
	}

	public AuditQueryVersion getCurrentVersion() {
		if (currentVersionId == null) {
			return null;
		}
		return versions.stream()
				.filter(version -> currentVersionId.equals(version.getId()))
				.findFirst()
				.orElseGet(this::latestVersionByNumber);
	}

	public List<AuditQueryVersion> getVersions() {
		return versions;
	}

	public Set<AuditCategory> getCategories() {
		return categories;
	}

	public AuditQueryVersion addVersion(int versionNumber) {
		AuditQueryVersion version = new AuditQueryVersion(this, versionNumber);
		versions.add(version);
		return version;
	}

	public void replaceCategories(Set<AuditCategory> replacementCategories) {
		new ArrayList<>(categories).forEach(category -> category.getAuditQueries().remove(this));
		categories.clear();
		replacementCategories.forEach(category -> {
			categories.add(category);
			category.getAuditQueries().add(this);
		});
	}

	private AuditQueryVersion latestVersionByNumber() {
		return versions.stream()
				.max(Comparator.comparingInt(AuditQueryVersion::getVersionNumber))
				.orElse(null);
	}
}
