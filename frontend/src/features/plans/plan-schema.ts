import { z } from "zod";

export const planItemVariableBindingRequestSchema = z.object({
	name: z.string().trim().min(1).max(100),
	value: z.string().max(1000),
});

export const planItemRequestSchema = z.object({
	queryId: z.number(),
	queryVersionId: z.number().optional(),
	sortOrder: z.number().finite(),
	enabled: z.boolean(),
	variableBindings: z.array(planItemVariableBindingRequestSchema),
});

export const planRequestSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Plan name is required.")
		.max(200, "Plan name must be 200 characters or fewer."),
	description: z.string().max(1000),
	active: z.boolean(),
	items: z.array(planItemRequestSchema),
});

export type PlanItemRequest = z.infer<typeof planItemRequestSchema>;
export type PlanRequest = z.infer<typeof planRequestSchema>;
