import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type EntityNotFoundProps = {
	message: string;
	backLabel: string;
	onBack: () => void;
};

export function EntityNotFound({
	message,
	backLabel,
	onBack,
}: EntityNotFoundProps) {
	return (
		<div className="flex flex-col gap-3 p-3">
			<Alert variant="destructive">
				<AlertDescription>{message}</AlertDescription>
			</Alert>
			<Button type="button" size="sm" className="w-fit" onClick={onBack}>
				{backLabel}
			</Button>
		</div>
	);
}
