package com.test.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import java.util.Map;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfiguration {

	@Bean
	OpenApiCustomizer removeExamples() {
		return this::stripExamples;
	}

	private void stripExamples(OpenAPI openApi) {
		if (openApi.getComponents() != null && openApi.getComponents().getSchemas() != null) {
			openApi.getComponents().getSchemas().values().forEach(this::clearExamples);
		}

		if (openApi.getPaths() == null) {
			return;
		}

		openApi.getPaths().values().forEach(pathItem -> pathItem.readOperations().forEach(operation -> {
			if (operation.getRequestBody() != null) {
				clearMediaTypes(operation.getRequestBody().getContent());
			}
			if (operation.getResponses() != null) {
				operation.getResponses().values().forEach(response -> clearMediaTypes(response.getContent()));
			}
		}));
	}

	private void clearMediaTypes(Map<String, MediaType> content) {
		if (content == null) {
			return;
		}

		content.values().forEach(mediaType -> {
			mediaType.setExample(null);
			mediaType.setExamples(null);
			clearExamples(mediaType.getSchema());
		});
	}

	private void clearExamples(Schema<?> schema) {
		if (schema == null) {
			return;
		}

		schema.setExample(null);
		schema.setExamples(null);

		if (schema.getProperties() != null) {
			schema.getProperties().values().forEach(this::clearExamples);
		}
		if (schema.getItems() != null) {
			clearExamples(schema.getItems());
		}
		if (schema.getAllOf() != null) {
			schema.getAllOf().forEach(this::clearExamples);
		}
		if (schema.getAnyOf() != null) {
			schema.getAnyOf().forEach(this::clearExamples);
		}
		if (schema.getOneOf() != null) {
			schema.getOneOf().forEach(this::clearExamples);
		}
	}
}
