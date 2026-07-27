import type { Category } from "@/lib/api-types";
import { httpClient, type paths, unwrapData } from "@/lib/http-client";

type CategoryCreateBody = NonNullable<
	paths["/api/categories"]["post"]["requestBody"]
>["content"]["application/json"];

type CategoryUpdateBody = NonNullable<
	paths["/api/categories/{id}"]["put"]["requestBody"]
>["content"]["application/json"];

export async function listCategories(): Promise<Category[]> {
	const data = await httpClient
		.GET("/api/categories")
		.then(({ data }) => unwrapData(data));
	return data as Category[];
}

export async function createCategory(
	request: CategoryCreateBody,
): Promise<Category> {
	const data = await httpClient
		.POST("/api/categories", { body: request })
		.then(({ data }) => unwrapData(data));
	return data as Category;
}

export async function updateCategory(
	id: number,
	request: CategoryUpdateBody,
): Promise<Category> {
	const data = await httpClient
		.PUT("/api/categories/{id}", { params: { path: { id } }, body: request })
		.then(({ data }) => unwrapData(data));
	return data as Category;
}

export async function deleteCategory(id: number): Promise<void> {
	await httpClient.DELETE("/api/categories/{id}", {
		params: { path: { id } },
	});
}
