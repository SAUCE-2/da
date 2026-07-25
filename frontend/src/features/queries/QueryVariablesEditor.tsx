import { useStore } from "@tanstack/react-form";
import { PlusIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { EditorSection } from "@/components/workspace/EditorSection";
import { cn } from "@/lib/utils";
import type { QueryEditorForm } from "./use-query-editor";

type QueryVariablesEditorProps = {
	form: QueryEditorForm;
	embedded?: boolean;
	onAddVariable: () => void;
	onRemoveVariable: (clientId: string) => void;
};

const rowGridClass =
	"grid grid-cols-[7.5rem_minmax(0,1fr)_minmax(0,1fr)_4.5rem_2rem] items-center gap-2";

export function QueryVariablesEditor({
	form,
	embedded = false,
	onAddVariable,
	onRemoveVariable,
}: QueryVariablesEditorProps) {
	const variables = useStore(form.store, (state) => state.values.variables);

	const content =
		variables.length === 0 ? (
			<p className="text-sm text-muted-foreground">
				No variables yet. Add one when SQL needs a runtime value such as a
				status filter or date range. Reference them as{" "}
				<code className="text-xs">{`{{name}}`}</code>.
			</p>
		) : (
			<div className="flex flex-col gap-2">
				<p className="text-sm text-muted-foreground">
					Reference in SQL as <code className="text-xs">{`{{name}}`}</code>.
				</p>
				<div className="flex flex-col gap-1.5">
					<div
						className={cn(
							rowGridClass,
							"px-0.5 text-xs font-medium text-muted-foreground",
						)}
					>
						<span>Type</span>
						<span>Name</span>
						<span>Default</span>
						<span className="text-center">Required</span>
						<span className="sr-only">Remove</span>
					</div>
					{variables.map((variable, index) => {
						const requiredId = `${variable.clientId}-required`;

						return (
							<div key={variable.clientId} className={rowGridClass}>
								<form.Field name={`variables[${index}].type`}>
									{(field) => (
										<Select
											value={field.state.value}
											onValueChange={(value) => {
												field.handleChange(
													value as "STRING" | "NUMBER" | "DATE",
												);
											}}
										>
											<SelectTrigger
												aria-label="Type"
												className="w-full"
												size="sm"
											>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="STRING">String</SelectItem>
												<SelectItem value="NUMBER">Number</SelectItem>
												<SelectItem value="DATE">Date</SelectItem>
											</SelectContent>
										</Select>
									)}
								</form.Field>

								<form.Field name={`variables[${index}].name`}>
									{(field) => (
										<Input
											aria-label="Name"
											value={field.state.value}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											onBlur={field.handleBlur}
											placeholder="status"
											className="h-7"
										/>
									)}
								</form.Field>

								<form.Field name={`variables[${index}].defaultValue`}>
									{(field) => (
										<Input
											aria-label="Default value"
											value={field.state.value}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											onBlur={field.handleBlur}
											placeholder="Optional"
											className="h-7"
										/>
									)}
								</form.Field>

								<form.Field name={`variables[${index}].required`}>
									{(field) => (
										<div className="flex justify-center">
											<Checkbox
												id={requiredId}
												aria-label="Required"
												checked={field.state.value}
												onCheckedChange={(checked) =>
													field.handleChange(checked === true)
												}
											/>
										</div>
									)}
								</form.Field>

								<Button
									type="button"
									variant="ghost"
									size="icon-xs"
									aria-label={`Remove ${variable.name.trim() || "variable"}`}
									onClick={() => onRemoveVariable(variable.clientId)}
								>
									<XIcon />
								</Button>
							</div>
						);
					})}
				</div>
				<div>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={onAddVariable}
					>
						<PlusIcon />
						Add variable
					</Button>
				</div>
			</div>
		);

	if (embedded) {
		return content;
	}

	return (
		<EditorSection
			title="Query variables"
			action={
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={onAddVariable}
				>
					Add variable
				</Button>
			}
		>
			{content}
		</EditorSection>
	);
}
