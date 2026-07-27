import type { Plan, PlanSummary } from "@/lib/api-types";
import { httpClient, type paths, unwrapData } from "@/lib/http-client";

type PlanCreateBody = NonNullable<
	paths["/api/plans"]["post"]["requestBody"]
>["content"]["application/json"];

type PlanUpdateBody = NonNullable<
	paths["/api/plans/{id}"]["put"]["requestBody"]
>["content"]["application/json"];

export async function listPlans(): Promise<PlanSummary[]> {
	const data = await httpClient
		.GET("/api/plans")
		.then(({ data }) => unwrapData(data));
	return data as PlanSummary[];
}

export async function getPlan(id: number): Promise<Plan> {
	const data = await httpClient
		.GET("/api/plans/{id}", { params: { path: { id } } })
		.then(({ data }) => unwrapData(data));
	return data as Plan;
}

export async function createPlan(request: PlanCreateBody): Promise<Plan> {
	const data = await httpClient
		.POST("/api/plans", { body: request })
		.then(({ data }) => unwrapData(data));
	return data as Plan;
}

export async function updatePlan(
	id: number,
	request: PlanUpdateBody,
): Promise<Plan> {
	const data = await httpClient
		.PUT("/api/plans/{id}", { params: { path: { id } }, body: request })
		.then(({ data }) => unwrapData(data));
	return data as Plan;
}

export async function deletePlan(id: number): Promise<void> {
	await httpClient.DELETE("/api/plans/{id}", { params: { path: { id } } });
}
