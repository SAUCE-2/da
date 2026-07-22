import { ClipboardTextIcon } from "@phosphor-icons/react/ClipboardText";
import { FileMagnifyingGlassIcon } from "@phosphor-icons/react/FileMagnifyingGlass";
import { StackIcon } from "@phosphor-icons/react/Stack";
import { TagIcon } from "@phosphor-icons/react/Tag";
import { createFileRoute, Link } from "@tanstack/react-router";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/")({
	component: HomePage,
});

const QUICK_LINKS = [
	{
		to: "/queries",
		label: "Queries",
		description:
			"Define reusable SQL audit queries with variables and ordered sections.",
		icon: FileMagnifyingGlassIcon,
	},
	{
		to: "/plans",
		label: "Plans",
		description:
			"Build run pipelines — ordered queries with variable bindings for repeatable audits.",
		icon: StackIcon,
	},
	{
		to: "/categories",
		label: "Categories",
		description: "Organize queries for browsing and plan building.",
		icon: TagIcon,
	},
] as const;

function HomePage() {
	return (
		<div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
			<header className="flex flex-col gap-2 border-b p-4">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center bg-primary text-primary-foreground">
						<ClipboardTextIcon className="size-5" />
					</div>
					<div>
						<h1 className="text-2xl font-semibold tracking-tight">
							Data Audit
						</h1>
						<p className="text-sm text-muted-foreground">
							Bamboo-style SQL audit runner for Oracle databases
						</p>
					</div>
				</div>
				<p className="text-sm text-muted-foreground">
					Store SQL audit queries, compose them into plans, and run them when
					execution is wired up. Each query is versioned; each plan run will
					record what executed and when.
				</p>
			</header>

			<section className="grid border-b sm:grid-cols-3">
				{QUICK_LINKS.map(({ to, label, description, icon: Icon }) => (
					<Link
						key={to}
						to={to}
						className="group flex flex-col gap-2 border-b p-4 transition-colors last:border-b-0 hover:bg-muted/40 sm:border-b-0 sm:border-r sm:last:border-r-0"
					>
						<div className="flex size-8 items-center justify-center bg-muted">
							<Icon className="size-4" />
						</div>
						<h2 className="font-medium">{label}</h2>
						<p className="text-sm text-muted-foreground">{description}</p>
					</Link>
				))}
			</section>

			<div className="p-4">
				<Card className="border-dashed bg-muted/20">
					<CardHeader>
						<CardTitle>Coming next</CardTitle>
						<CardDescription>
							Database connection setup, JDBC execution, plan runs, query run
							history, and scheduled overnight audits.
						</CardDescription>
					</CardHeader>
					<CardContent className="text-xs text-muted-foreground">
						See <code className="bg-muted px-1 py-0.5">context/README.md</code>{" "}
						for the staged roadmap.
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
