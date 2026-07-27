package com.test.backend.controller.query;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import com.jayway.jsonpath.JsonPath;

@SpringBootTest
@Transactional
class MetadataApiTests {

	@Autowired
	private WebApplicationContext applicationContext;

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.webAppContextSetup(applicationContext).build();
	}

	@Test
	void createUpdateListAndGetAuditQueries() throws Exception {
		MvcResult categoryResult = mockMvc.perform(post("/api/categories")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "name": "Group Alpha",
						  "description": "Initial grouping metadata"
						}
						"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.name").value("Group Alpha"))
				.andExpect(jsonPath("$.queryCount").value(0))
				.andReturn();
		long categoryId = ((Number) JsonPath.read(categoryResult.getResponse().getContentAsString(), "$.id")).longValue();

		mockMvc.perform(put("/api/categories/{id}", categoryId)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "name": "Group Beta",
						  "description": "Updated grouping metadata"
						}
						"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value("Group Beta"));

		MvcResult queryResult = mockMvc.perform(post("/api/queries")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "name": "Definition Delta",
						  "description": "Initial definition metadata",
						  "active": false,
						  "categoryIds": [%d],
						  "query": "--# Block A\\nFRAGMENT_A\\n--# Block B\\nFRAGMENT_B\\n--# Block C\\nFRAGMENT_C",
						  "defaultDisabledLines": [1, 2, 5, 6]
						}
						""".formatted(categoryId)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.name").value("Definition Delta"))
				.andExpect(jsonPath("$.query").exists())
				.andExpect(jsonPath("$.defaultDisabledLines[0]").value(1))
				.andExpect(jsonPath("$.categories[0].name").value("Group Beta"))
				.andReturn();
		long queryId = ((Number) JsonPath.read(queryResult.getResponse().getContentAsString(), "$.id")).longValue();

		mockMvc.perform(put("/api/queries/{id}", queryId)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "name": "Definition Delta Updated",
						  "description": "Updated metadata",
						  "categoryIds": [%d],
						  "query": "--# Block A Updated\\nFRAGMENT_A_UPDATED\\n--# Block B Updated\\nFRAGMENT_B_UPDATED",
						  "defaultDisabledLines": [1, 2]
						}
						""".formatted(categoryId)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value("Definition Delta Updated"))
				.andExpect(jsonPath("$.active").value(false))
				.andExpect(jsonPath("$.defaultDisabledLines[0]").value(1));

		mockMvc.perform(get("/api/queries"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].name").value("Definition Delta Updated"))
				.andExpect(jsonPath("$[0].active").value(false))
				.andExpect(jsonPath("$[0].query").doesNotExist())
				.andExpect(jsonPath("$[0].categories[0].name").value("Group Beta"));

		mockMvc.perform(get("/api/queries/{id}", queryId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value("Definition Delta Updated"))
				.andExpect(jsonPath("$.query").exists())
				.andExpect(jsonPath("$.defaultDisabledLines[0]").value(1));

		mockMvc.perform(get("/api/categories"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].name").value("Group Beta"))
				.andExpect(jsonPath("$[0].queryCount").value(1));
	}
}
