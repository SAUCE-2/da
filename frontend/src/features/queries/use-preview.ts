import { useCallback, useMemo, useState } from "react";
import type { ClientVariable } from "./form";

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

export function useQueryPreview(formVariables: ClientVariable[]) {
	const [previewVariableOverrides, setPreviewVariableOverrides] = useState<
		Record<string, string>
	>({});

	const previewVariableValues = useMemo(
		() => buildPreviewVariableValues(formVariables, previewVariableOverrides),
		[formVariables, previewVariableOverrides],
	);

	function updatePreviewVariable(name: string, value: string) {
		setPreviewVariableOverrides((current) => ({ ...current, [name]: value }));
	}

	const resetPreviewOverrides = useCallback(() => {
		setPreviewVariableOverrides({});
	}, []);

	return {
		previewVariableValues,
		previewErrorMessage: null as string | null,
		updatePreviewVariable,
		resetPreviewOverrides,
	};
}
