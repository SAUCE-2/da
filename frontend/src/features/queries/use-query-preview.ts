import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import type { ClientVariable } from "./query-form";
import { queryPreviewOptions } from "./query-server-state";

export function buildPreviewVariableValues(
	variables: ClientVariable[],
	overrides: Record<string, string>,
) {
	const defaults: Record<string, string> = {};

	for (const variable of variables) {
		const name = variable.name.trim();
		if (!name) {
			continue;
		}
		defaults[name] = overrides[name] ?? variable.defaultValue ?? "";
	}

	const namedVariables = variables
		.map((variable) => variable.name.trim())
		.filter(Boolean);

	const prunedOverrides: Record<string, string> = {};
	for (const name of namedVariables) {
		if (name in overrides) {
			prunedOverrides[name] = overrides[name];
		}
	}

	return { ...defaults, ...prunedOverrides };
}

export function useQueryPreview(
	selectedQueryId: number | null,
	formVariables: ClientVariable[],
) {
	const [previewVariableOverrides, setPreviewVariableOverrides] = useState<
		Record<string, string>
	>({});

	const previewVariableValues = useMemo(
		() => buildPreviewVariableValues(formVariables, previewVariableOverrides),
		[formVariables, previewVariableOverrides],
	);
	const previewRequest = useMemo(
		() => ({ variables: previewVariableValues }),
		[previewVariableValues],
	);

	const previewQuery = useQuery(
		queryPreviewOptions(selectedQueryId, previewRequest),
	);

	const previewErrorMessage = previewQuery.isError
		? previewQuery.error instanceof Error && previewQuery.error.message
			? previewQuery.error.message
			: "Unable to load SQL preview."
		: null;

	function updatePreviewVariable(name: string, value: string) {
		setPreviewVariableOverrides((current) => ({ ...current, [name]: value }));
	}

	const resetPreviewOverrides = useCallback(() => {
		setPreviewVariableOverrides({});
	}, []);

	return {
		preview: previewQuery.data ?? null,
		previewVariableValues,
		isPreviewLoading: previewQuery.isFetching,
		previewErrorMessage,
		updatePreviewVariable,
		resetPreviewOverrides,
	};
}
