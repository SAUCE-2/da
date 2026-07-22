import type { z } from "zod";
import { fromError } from "zod-validation-error";

export function formatZodError(error: z.ZodError) {
	return fromError(error, {
		prefix: null,
		includePath: false,
		issueSeparator: " ",
	}).toString();
}
