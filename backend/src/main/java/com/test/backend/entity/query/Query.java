package com.test.backend.entity.query;

import com.test.backend.entity.category.Category;

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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "queries")
@Getter
@Setter
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
public class Query {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 200)
	private String name;

	@Column(nullable = false)
	private boolean active = true;

	@Column(name = "current_version_id")
	private Long currentVersionId;

	@OneToMany(mappedBy = "query", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("versionNumber ASC")
	private List<QueryVersion> versions = new ArrayList<>();

	@ManyToMany
	@JoinTable(
			name = "query_categories",
			joinColumns = @JoinColumn(name = "query_id"),
			inverseJoinColumns = @JoinColumn(name = "category_id"),
			uniqueConstraints = @UniqueConstraint(
					name = "uk_query_categories_pair",
					columnNames = { "query_id", "category_id" }))
	@OrderBy("name ASC")
	private Set<Category> categories = new LinkedHashSet<>();

	public Query(String name, boolean active) {
		this.name = name;
		this.active = active;
	}

	public QueryVersion addVersion(int versionNumber) {
		QueryVersion version = new QueryVersion(this, versionNumber);
		versions.add(version);
		return version;
	}

	public void replaceCategories(Set<Category> replacementCategories) {
		new ArrayList<>(categories).forEach(category -> category.getQueries().remove(this));
		categories.clear();
		replacementCategories.forEach(category -> {
			categories.add(category);
			category.getQueries().add(this);
		});
	}
}
