import { z } from "zod";

export const categoryRequestSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Category name is required.")
		.max(200, "Category name must be 200 characters or fewer."),
	description: z
		.string()
		.max(1000, "Description must be 1000 characters or fewer."),
});

export type CategoryRequest = z.infer<typeof categoryRequestSchema>;
