import { z } from "zod";

export const queryVariableRequestSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Variable name is required.")
		.max(100, "Variable name must be 100 characters or fewer.")
		.regex(
			/^[a-zA-Z][a-zA-Z0-9_]*$/,
			"Variable names must start with a letter and use letters, numbers, or underscores.",
		),
	type: z.enum(["STRING", "NUMBER", "DATE"]),
	defaultValue: z
		.string()
		.max(1000, "Default value must be 1000 characters or fewer."),
	required: z.boolean(),
	sortOrder: z.number().finite(),
});

export const queryRequestSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Query name is required.")
		.max(200, "Query name must be 200 characters or fewer."),
	description: z
		.string()
		.max(1000, "Description must be 1000 characters or fewer."),
	active: z.boolean(),
	query: z.string().trim().min(1, "Query text is required."),
	defaultDisabledLines: z.array(z.number().int().positive()),
	variables: z.array(queryVariableRequestSchema),
	categoryIds: z.array(z.number()),
});

export type QueryVariableRequest = z.infer<typeof queryVariableRequestSchema>;
export type QueryRequest = z.infer<typeof queryRequestSchema>;
