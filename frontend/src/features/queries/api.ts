import type {
	Query,
	QuerySummary,
	QueryVersion,
	QueryVersionSummary,
} from "@/lib/api-types";
import { httpClient, type paths, unwrapData } from "@/lib/http-client";

type QueryCreateBody = NonNullable<
	paths["/api/queries"]["post"]["requestBody"]
>["content"]["application/json"];

type QueryUpdateBody = NonNullable<
	paths["/api/queries/{id}"]["put"]["requestBody"]
>["content"]["application/json"];

export async function listQueries(): Promise<QuerySummary[]> {
	const data = await httpClient
		.GET("/api/queries")
		.then(({ data }) => unwrapData(data));
	return data as QuerySummary[];
}

export async function getQuery(id: number): Promise<Query> {
	const data = await httpClient
		.GET("/api/queries/{id}", { params: { path: { id } } })
		.then(({ data }) => unwrapData(data));
	return data as Query;
}

export async function createQuery(request: QueryCreateBody): Promise<Query> {
	const data = await httpClient
		.POST("/api/queries", { body: request })
		.then(({ data }) => unwrapData(data));
	return data as Query;
}

export async function updateQuery(
	id: number,
	request: QueryUpdateBody,
): Promise<Query> {
	const data = await httpClient
		.PUT("/api/queries/{id}", { params: { path: { id } }, body: request })
		.then(({ data }) => unwrapData(data));
	return data as Query;
}

export async function deleteQuery(id: number): Promise<void> {
	await httpClient.DELETE("/api/queries/{id}", { params: { path: { id } } });
}

export async function listQueryVersions(
	id: number,
): Promise<QueryVersionSummary[]> {
	const data = await httpClient
		.GET("/api/queries/{id}/versions", { params: { path: { id } } })
		.then(({ data }) => unwrapData(data));
	return data as QueryVersionSummary[];
}

export async function getQueryVersion(
	id: number,
	versionId: number,
): Promise<QueryVersion> {
	const data = await httpClient
		.GET("/api/queries/{id}/versions/{versionId}", {
			params: { path: { id, versionId } },
		})
		.then(({ data }) => unwrapData(data));
	return data as QueryVersion;
}
