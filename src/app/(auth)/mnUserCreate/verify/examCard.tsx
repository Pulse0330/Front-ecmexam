import type { ExamItem, ExamRoom } from "./types";

// ── Helpers ────────────────────────────────────────────────────────────────
const WEEKDAYS = ["Ням", "Дав", "Мяг", "Лха", "Пүр", "Баа", "Бям"];

function formatDate(iso: string) {
	const d = new Date(iso);
	const date = d.toLocaleDateString("mn-MN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	const weekday = WEEKDAYS[d.getDay()];
	const time = d.toLocaleTimeString("mn-MN", {
		hour: "2-digit",
		minute: "2-digit",
	});
	return { date, weekday, time };
}

// ── Icons ──────────────────────────────────────────────────────────────────
const IconClock = () => (
	<svg
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<title>Цаг</title>
		<circle cx="12" cy="12" r="10" />
		<polyline points="12 6 12 12 16 14" />
	</svg>
);
const IconCalendar = () => (
	<svg
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<title>Календар</title>
		<rect x="3" y="4" width="18" height="18" rx="2" />
		<line x1="16" y1="2" x2="16" y2="6" />
		<line x1="8" y1="2" x2="8" y2="6" />
		<line x1="3" y1="10" x2="21" y2="10" />
	</svg>
);
const IconPin = () => (
	<svg
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<title>Байршил</title>
		<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
		<circle cx="12" cy="10" r="3" />
	</svg>
);
const IconMonitor = () => (
	<svg
		width="13"
		height="13"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<title>Компьютер</title>
		<rect x="2" y="3" width="20" height="14" rx="2" />
		<line x1="8" y1="21" x2="16" y2="21" />
		<line x1="12" y1="17" x2="12" y2="21" />
	</svg>
);
const IconUsers = () => (
	<svg
		width="13"
		height="13"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<title>Суудал</title>
		<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
		<circle cx="9" cy="7" r="4" />
		<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
		<path d="M16 3.13a4 4 0 0 1 0 7.75" />
	</svg>
);
const IconCheck = () => (
	<svg
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="3"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<title>Бүртгүүлэх</title>
		<polyline points="20 6 9 17 4 12" />
	</svg>
);
const IconWarn = () => (
	<svg
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<title>Анхааруулга</title>
		<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
		<line x1="12" y1="9" x2="12" y2="13" />
		<line x1="12" y1="17" x2="12.01" y2="17" />
	</svg>
);

// ── Radio ──────────────────────────────────────────────────────────────────
function Radio({ selected }: { selected: boolean }) {
	return (
		<div
			style={{
				width: 20,
				height: 20,
				borderRadius: "50%",
				border: `2px solid ${selected ? "#4f46e5" : "#d1d5db"}`,
				background: selected ? "#4f46e5" : "white",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexShrink: 0,
				transition: "all 0.15s",
			}}
		>
			{selected && (
				<div
					style={{
						width: 7,
						height: 7,
						borderRadius: "50%",
						background: "white",
					}}
				/>
			)}
		</div>
	);
}

// ── ExamCard ───────────────────────────────────────────────────────────────
export default function ExamCard({
	exam,
	selected,
	selectedDateId,
	rooms,
	roomsLoading,
	selectedRoomId,
	isLoading,
	onSelect,
	onSelectDate,
	onSelectRoom,
	onRegister, // ← verifyForm-ын handleRegister-г дуудна
}: {
	exam: ExamItem;
	selected: boolean;
	selectedDateId: number | null;
	rooms: ExamRoom[];
	roomsLoading: boolean;
	selectedRoomId: number | null;
	isLoading: boolean;
	onSelect: () => void;
	onSelectDate: (dateId: number) => void;
	onSelectRoom: (roomId: number) => void;
	onRegister: () => void;
}) {
	const now = new Date();
	const isOpen =
		now >= new Date(exam.register_start_date) &&
		now <= new Date(exam.register_end_date);
	const isExpired = now > new Date(exam.register_end_date);

	const needsDate = exam.exam_dates.length > 0;
	// Бүртгэх товч идэвхтэй болох нөхцөл
	const canRegister =
		selected && (!needsDate || (!!selectedDateId && !!selectedRoomId));

	const statusColor = isOpen
		? { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" }
		: isExpired
			? { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" }
			: { bg: "#fffbeb", text: "#d97706", border: "#fde68a" };
	const statusLabel = isOpen
		? "Бүртгэл нээлттэй"
		: isExpired
			? "Бүртгэл дууссан"
			: "Бүртгэл эхлээгүй";

	return (
		<div
			style={{
				borderRadius: 16,
				overflow: "hidden",
				border: `2px solid ${selected ? "#4f46e5" : "#e5e7eb"}`,
				background: "white",
				transition: "all 0.2s",
				boxShadow: selected
					? "0 4px 20px rgba(79,70,229,0.12)"
					: "0 1px 4px rgba(0,0,0,0.06)",
				opacity: isOpen ? 1 : 0.6,
			}}
		>
			{/* ── Exam header ── */}
			<button
				type="button"
				onClick={() => isOpen && onSelect()}
				disabled={!isOpen}
				style={{
					width: "100%",
					textAlign: "left",
					padding: "18px 20px",
					background: "none",
					border: "none",
					cursor: isOpen ? "pointer" : "not-allowed",
					display: "block",
				}}
			>
				<div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
					<div
						style={{
							width: 44,
							height: 44,
							borderRadius: 12,
							flexShrink: 0,
							background: selected ? "#ede9fe" : "#f3f4f6",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: 20,
						}}
					>
						📝
					</div>

					<div style={{ flex: 1, minWidth: 0 }}>
						<span
							style={{
								display: "inline-block",
								fontSize: 11,
								fontWeight: 600,
								padding: "2px 8px",
								borderRadius: 20,
								border: `1px solid ${statusColor.border}`,
								background: statusColor.bg,
								color: statusColor.text,
								marginBottom: 6,
							}}
						>
							{statusLabel}
						</span>
						<p
							style={{
								fontWeight: 700,
								fontSize: 14,
								color: "#111827",
								marginBottom: 4,
								lineHeight: 1.4,
							}}
						>
							{exam.name}
						</p>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 4,
								color: "#6b7280",
								fontSize: 12,
							}}
						>
							<IconClock />
							<span>
								Үргэлжлэх хугацаа: <strong>{exam.duration} минут</strong>
							</span>
						</div>
					</div>
					<Radio selected={selected} />
				</div>

				{/* Бүртгэлийн хугацаа */}
				<div
					style={{
						marginTop: 14,
						paddingTop: 14,
						borderTop: "1px dashed #e5e7eb",
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 8,
					}}
				>
					{[
						{ label: "Бүртгэл эхлэх", value: exam.register_start_date },
						{ label: "Бүртгэл дуусах", value: exam.register_end_date },
					].map(({ label, value }) => {
						const { date, time } = formatDate(value);
						return (
							<div
								key={label}
								style={{
									padding: "8px 10px",
									borderRadius: 8,
									background: "#f9fafb",
								}}
							>
								<p
									style={{
										fontSize: 10,
										color: "#9ca3af",
										marginBottom: 2,
										textTransform: "uppercase",
										letterSpacing: "0.05em",
									}}
								>
									{label}
								</p>
								<p style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
									{date}
								</p>
								<p style={{ fontSize: 11, color: "#6b7280" }}>{time}</p>
							</div>
						);
					})}
				</div>
			</button>

			{/* ── Step 1: Цаг сонгох ── */}
			{selected && isOpen && exam.exam_dates.length > 0 && (
				<div style={{ padding: "0 20px 16px", borderTop: "1px solid #f3f4f6" }}>
					<div style={{ paddingTop: 16 }}>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 6,
								marginBottom: 10,
							}}
						>
							<div
								style={{
									width: 22,
									height: 22,
									borderRadius: "50%",
									background: "#4f46e5",
									color: "white",
									fontSize: 11,
									fontWeight: 700,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								1
							</div>
							<span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>
								Шалгалт өгөх цагаа сонгоно уу
							</span>
							<span
								style={{ marginLeft: "auto", fontSize: 11, color: "#9ca3af" }}
							>
								{exam.exam_dates.length} цаг байна
							</span>
						</div>

						<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
							{exam.exam_dates.map((ed, idx: number) => {
								const isSel = selectedDateId === ed.id;
								const s = formatDate(ed.start_date);
								const e = formatDate(ed.end_date);
								return (
									<button
										key={ed.id}
										type="button"
										onClick={() => onSelectDate(ed.id)}
										style={{
											display: "flex",
											alignItems: "center",
											gap: 12,
											padding: "12px 14px",
											borderRadius: 12,
											textAlign: "left",
											border: `2px solid ${isSel ? "#4f46e5" : "#e5e7eb"}`,
											background: isSel ? "#eef2ff" : "white",
											cursor: "pointer",
											transition: "all 0.15s",
										}}
									>
										<Radio selected={isSel} />
										<div style={{ flex: 1 }}>
											<p
												style={{
													fontWeight: 700,
													fontSize: 13,
													color: isSel ? "#4f46e5" : "#111827",
													marginBottom: 2,
												}}
											>
												{idx + 1}-р ээлж
											</p>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: 4,
													color: "#6b7280",
													fontSize: 12,
												}}
											>
												<IconCalendar />
												<span>
													{s.date} ({s.weekday})
												</span>
											</div>
										</div>
										<div style={{ textAlign: "right" }}>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: 4,
													color: "#6b7280",
													fontSize: 12,
												}}
											>
												<IconClock />
												<span style={{ fontWeight: 600 }}>
													{s.time} – {e.time}
												</span>
											</div>
										</div>
									</button>
								);
							})}
						</div>
					</div>

					{/* ── Step 2: Өрөө сонгох ── */}
					{selectedDateId && (
						<div style={{ marginTop: 16 }}>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 6,
									marginBottom: 10,
								}}
							>
								<div
									style={{
										width: 22,
										height: 22,
										borderRadius: "50%",
										background: "#4f46e5",
										color: "white",
										fontSize: 11,
										fontWeight: 700,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									2
								</div>
								<span
									style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}
								>
									Шалгалтын өрөөгөө сонгоно уу
								</span>
							</div>

							{roomsLoading ? (
								<div
									style={{
										padding: 16,
										textAlign: "center",
										color: "#9ca3af",
										fontSize: 13,
									}}
								>
									Өрөөний мэдээлэл ачаалж байна...
								</div>
							) : rooms.length === 0 ? (
								<div
									style={{
										padding: 16,
										textAlign: "center",
										color: "#9ca3af",
										fontSize: 13,
									}}
								>
									Өрөө олдсонгүй
								</div>
							) : (
								<div
									style={{ display: "flex", flexDirection: "column", gap: 8 }}
								>
									{rooms.map((room: ExamRoom) => {
										const isSel = selectedRoomId === room.id;
										const free = room.num_of_pc - room.seatcnt;
										const pct = Math.round(
											(room.seatcnt / room.num_of_pc) * 100,
										);
										const barColor =
											pct >= 90 ? "#ef4444" : pct >= 60 ? "#f59e0b" : "#22c55e";
										return (
											<button
												key={room.id}
												type="button"
												onClick={() => onSelectRoom(room.id)}
												style={{
													display: "flex",
													alignItems: "flex-start",
													gap: 12,
													padding: "12px 14px",
													borderRadius: 12,
													textAlign: "left",
													border: `2px solid ${isSel ? "#4f46e5" : "#e5e7eb"}`,
													background: isSel ? "#eef2ff" : "white",
													cursor: "pointer",
													transition: "all 0.15s",
												}}
											>
												<Radio selected={isSel} />
												<div style={{ flex: 1 }}>
													<p
														style={{
															fontWeight: 700,
															fontSize: 13,
															color: isSel ? "#4f46e5" : "#111827",
															marginBottom: 3,
														}}
													>
														{room.name || room.branchname}
													</p>
													<div
														style={{
															display: "flex",
															alignItems: "center",
															gap: 4,
															color: "#6b7280",
															fontSize: 12,
															marginBottom: 6,
														}}
													>
														<IconPin />
														<span>
															{room.branchname} · Өрөө {room.room_number}
														</span>
													</div>
													<div
														style={{
															display: "flex",
															gap: 12,
															marginBottom: 6,
														}}
													>
														<div
															style={{
																display: "flex",
																alignItems: "center",
																gap: 4,
																color: "#6b7280",
																fontSize: 11,
															}}
														>
															<IconMonitor />
															<span>
																Нийт PC: <strong>{room.num_of_pc}</strong>
															</span>
														</div>
														<div
															style={{
																display: "flex",
																alignItems: "center",
																gap: 4,
																fontSize: 11,
																fontWeight: 600,
																color: free > 0 ? "#16a34a" : "#dc2626",
															}}
														>
															<IconUsers />
															<span>
																Чөлөөт: <strong>{free}</strong>
															</span>
														</div>
													</div>
													<div
														style={{
															height: 4,
															borderRadius: 99,
															background: "#f3f4f6",
															overflow: "hidden",
														}}
													>
														<div
															style={{
																height: "100%",
																width: `${pct}%`,
																background: barColor,
																borderRadius: 99,
															}}
														/>
													</div>
													<p
														style={{
															fontSize: 10,
															color: "#9ca3af",
															marginTop: 3,
														}}
													>
														{pct}% дүүрсэн ({room.seatcnt}/{room.num_of_pc})
													</p>
												</div>
											</button>
										);
									})}
								</div>
							)}
						</div>
					)}

					{/* ── Warning: сонгоогүй бол ── */}
					{(!selectedDateId || !selectedRoomId) && (
						<div
							style={{
								marginTop: 12,
								display: "flex",
								alignItems: "center",
								gap: 8,
								padding: "10px 14px",
								borderRadius: 10,
								background: "#fffbeb",
								border: "1px solid #fde68a",
								color: "#92400e",
							}}
						>
							<IconWarn />
							<span style={{ fontSize: 12, fontWeight: 500 }}>
								{!selectedDateId ? "Цагаа сонгоно уу" : "Өрөөгөө сонгоно уу"}
							</span>
						</div>
					)}

					{/* ── Register button — onRegister prop дуудна ── */}
					<button
						type="button"
						onClick={onRegister}
						disabled={!canRegister || isLoading}
						style={{
							marginTop: 14,
							width: "100%",
							padding: "14px",
							borderRadius: 12,
							border: "none",
							background: canRegister
								? "linear-gradient(135deg, #4f46e5, #7c3aed)"
								: "#e5e7eb",
							color: canRegister ? "white" : "#9ca3af",
							fontWeight: 700,
							fontSize: 15,
							cursor: canRegister && !isLoading ? "pointer" : "not-allowed",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: 8,
							transition: "all 0.2s",
							boxShadow: canRegister
								? "0 4px 14px rgba(79,70,229,0.35)"
								: "none",
						}}
					>
						{isLoading ? (
							<span>Бүртгэж байна...</span>
						) : (
							<>
								<IconCheck />
								<span>Шалгалтад бүртгүүлэх</span>
							</>
						)}
					</button>
				</div>
			)}
		</div>
	);
}
