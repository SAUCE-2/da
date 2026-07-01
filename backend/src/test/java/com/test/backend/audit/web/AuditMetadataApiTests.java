package com.test.backend.audit.web;

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
class AuditMetadataApiTests {

	@Autowired
	private WebApplicationContext applicationContext;

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.webAppContextSetup(applicationContext).build();
	}

	@Test
	void createUpdateListAndPreviewAuditQueries() throws Exception {
		MvcResult categoryResult = mockMvc.perform(post("/api/audit-categories")
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

		mockMvc.perform(put("/api/audit-categories/{id}", categoryId)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "name": "Group Beta",
						  "description": "Updated grouping metadata"
						}
						"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value("Group Beta"));

		MvcResult queryResult = mockMvc.perform(post("/api/audit-queries")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "name": "Definition Delta",
						  "description": "Initial definition metadata",
						  "active": false,
						  "categoryIds": [%d],
						  "sections": [
						    {
						      "name": "Block C",
						      "sqlFragment": "FRAGMENT_C",
						      "sortOrder": 30,
						      "defaultEnabled": false
						    },
						    {
						      "name": "Block A",
						      "sqlFragment": "FRAGMENT_A",
						      "sortOrder": 10,
						      "defaultEnabled": false
						    },
						    {
						      "name": "Block B",
						      "sqlFragment": "FRAGMENT_B",
						      "sortOrder": 20,
						      "defaultEnabled": true
						    }
						  ]
						}
						""".formatted(categoryId)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.name").value("Definition Delta"))
				.andExpect(jsonPath("$.sections[0].name").value("Block A"))
				.andExpect(jsonPath("$.categories[0].name").value("Group Beta"))
				.andReturn();
		long queryId = ((Number) JsonPath.read(queryResult.getResponse().getContentAsString(), "$.id")).longValue();

		mockMvc.perform(put("/api/audit-queries/{id}", queryId)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "name": "Definition Delta Updated",
						  "description": "Updated metadata",
						  "categoryIds": [%d],
						  "sections": [
						    {
						      "name": "Block A Updated",
						      "sqlFragment": "FRAGMENT_A_UPDATED",
						      "sortOrder": 10
						    },
						    {
						      "name": "Block B Updated",
						      "sqlFragment": "FRAGMENT_B_UPDATED\\n",
						      "sortOrder": 20
						    }
						  ]
						}
						""".formatted(categoryId)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value("Definition Delta Updated"))
				.andExpect(jsonPath("$.active").value(false))
				.andExpect(jsonPath("$.sections.length()").value(2))
				.andExpect(jsonPath("$.sections[0].defaultEnabled").value(false))
				.andExpect(jsonPath("$.sections[1].defaultEnabled").value(true));

		mockMvc.perform(get("/api/audit-queries"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].name").value("Definition Delta Updated"))
				.andExpect(jsonPath("$[0].active").value(false));

		mockMvc.perform(get("/api/audit-categories"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].name").value("Group Beta"))
				.andExpect(jsonPath("$[0].queryCount").value(1));

		mockMvc.perform(get("/api/audit-queries/{id}/preview", queryId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(queryId))
				.andExpect(jsonPath("$.sql").value("FRAGMENT_B_UPDATED"));
	}
}
