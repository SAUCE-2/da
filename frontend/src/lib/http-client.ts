import createClient, { type Middleware } from "openapi-fetch";

import type { paths } from "./api-schema";

export type { paths };

const client = createClient<paths>({ baseUrl: "" });

function getErrorMessage(error: unknown): string {
	if (!error || typeof error !== "object") {
		return "Request failed.";
	}

	const record = error as Record<string, unknown>;

	if (typeof record.detail === "string" && record.detail.length > 0) {
		return record.detail;
	}

	if (typeof record.message === "string" && record.message.length > 0) {
		return record.message;
	}

	if (typeof record.title === "string" && record.title.length > 0) {
		return record.title;
	}

	if (typeof record.error === "string" && record.error.length > 0) {
		return record.error;
	}

	return "Request failed.";
}

const errorMiddleware: Middleware = {
	async onResponse({ response }) {
		if (response.ok) {
			return undefined;
		}

		let body: unknown;
		try {
			body = await response.clone().json();
		} catch {
			throw new Error(`Request failed with status ${response.status}.`);
		}

		throw new Error(getErrorMessage(body));
	},
};

client.use(errorMiddleware);

export function unwrapData<T>(data: T | undefined): T {
	if (data === undefined) {
		throw new Error("Request failed.");
	}

	return data;
}

/** Shared OpenAPI-fetch client used by feature `*-api.ts` modules. */
export const httpClient = client;
