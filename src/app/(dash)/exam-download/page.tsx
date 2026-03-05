import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExamDownloadPage() {
	return (
		<div className="py-6 max-w-7xl mx-auto">
			{" "}
			<header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 border-b pb-6">
				<div>
					<h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
						<div className="bg-primary/10 p-2 rounded-lg text-primary">
							<Download size={24} />
						</div>
						Шалгалтын матерал татах
					</h1>
					<p className="text-sm text-muted-foreground mt-1 font-medium">
						Lorem ipsum dolor sit, amet consectetur adipisicing elit. Suscipit,
						unde.
					</p>
				</div>
				<Button className="gap-2 shadow-sm">
					<Download size={18} />
					Шалгалтын матерал татах
				</Button>
			</header>
		</div>
	);
}
