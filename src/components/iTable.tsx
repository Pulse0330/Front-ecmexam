"use client";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import * as React from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	className?: string;
	expandKey?: string; // Энд string байхаар авбал илүү уян хатан
}

export function ITable<TData extends Record<string, any>, TValue>({
	columns,
	data,
	className,
	expandKey = "items", // Чиний дата дээр 'items' байгаа тул default-ыг нь сольчихлоо
}: DataTableProps<TData, TValue>) {
	const [expanded, setExpanded] = React.useState({});

	const table = useReactTable({
		data,
		columns,
		state: { expanded },
		onExpandedChange: setExpanded,
		// expandKey-г ашиглан child өгөгдлийг унших
		getSubRows: (row) => row[expandKey],
		getCoreRowModel: getCoreRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
	});

	return (
		<div
			className={cn(
				"w-full rounded-2xl border bg-card shadow-sm overflow-hidden",
				className,
			)}
		>
			<Table>
				<TableHeader className="bg-muted/50">
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							<TableHead className="w-10" />
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id} className="font-bold py-4">
									{flexRender(
										header.column.columnDef.header,
										header.getContext(),
									)}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => {
							const isSubRow = row.depth > 0;

							// Эцэг доторх хамгийн сүүлийн мөр эсэхийг тодорхойлох (Алдаагүй хувилбар)
							const parent = row.getParentRow();
							const siblings = parent
								? (parent.original[expandKey] as TData[])
								: (table.options.data as TData[]);
							const isLastChild = row.index === siblings.length - 1;

							return (
								<TableRow
									key={row.id}
									className={cn(
										"transition-colors border-b last:border-0",
										isSubRow
											? "bg-muted/5 hover:bg-muted/10 text-sm"
											: "hover:bg-muted/30 font-medium text-[15px]",
									)}
								>
									<TableCell className="w-10 relative p-0 px-2">
										{isSubRow && (
											<>
												{/* Босоо зураас - Сүүлийнх бол таллана */}
												<div
													className={cn(
														"absolute left-6 top-0 w-px bg-border",
														isLastChild ? "h-1/2" : "h-full",
													)}
												/>
												{/* Хөндлөн зураас - Булан гаргах */}
												<div className="absolute left-6 top-1/2 w-3 h-px bg-border" />
											</>
										)}

										<div className="relative z-10 flex justify-center">
											{row.getCanExpand() && (
												<button
													onClick={row.getToggleExpandedHandler()}
													className="p-1 hover:bg-background rounded-md border bg-card shadow-sm transition-transform active:scale-95"
													type="button"
												>
													<ChevronRight
														size={12}
														className={cn(
															"transition-transform duration-200",
															row.getIsExpanded() && "rotate-90 text-primary",
														)}
													/>
												</button>
											)}
										</div>
									</TableCell>

									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className="py-3.5"
											style={{
												paddingLeft:
													cell.column.id === columns[0].id
														? `${row.depth * 0.5}rem`
														: undefined,
											}}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							);
						})
					) : (
						<TableRow>
							<TableCell
								colSpan={columns.length + 1}
								className="h-32 text-center text-muted-foreground"
							>
								Өгөгдөл олдсонгүй.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
