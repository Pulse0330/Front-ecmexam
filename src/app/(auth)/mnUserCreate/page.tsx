"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface StudentExamData {
	login_name: string;
	firstname: string;
	lastname: string;
	reg_number: string;
	gender: number;
	phone: string | null;
	email: string;
	aimag_id: string;
	sym_id: string;
	class_id: number;
	group_id: number;
	img_url: string | null;
	descr: string;
	regdate: string;
	dateofbirth: string;
	personId: string;
	schooldb: string;
	schoolname: string;
	studentgroupid: string;
	studentgroupname: string;
	aimag_name: string;
	sym_name: string;
}

function InfoRow({
	label,
	value,
}: {
	label: string;
	value: string | number | null;
}) {
	return (
		<div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
			<span className="text-sm text-gray-500 dark:text-gray-400 shrink-0 w-40">
				{label}
			</span>
			<span className="text-sm font-medium text-gray-900 dark:text-white text-right">
				{value ?? "—"}
			</span>
		</div>
	);
}

export default function UserCreatePage() {
	const router = useRouter();
	const [student, setStudent] = useState<StudentExamData | null>(null);

	useEffect(() => {
		const raw = sessionStorage.getItem("studentExam");
		if (!raw) {
			router.replace("/login");
			return;
		}
		try {
			setStudent(JSON.parse(raw));
		} catch {
			router.replace("/login");
		}
	}, [router]);

	if (!student) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<svg
					className="animate-spin w-8 h-8 text-emerald-500"
					fill="none"
					viewBox="0 0 24 24"
				>
					<title>Уншиж байна</title>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
					/>
				</svg>
			</div>
		);
	}

	const formatDate = (iso: string) => {
		try {
			return new Date(iso).toLocaleDateString("mn-MN", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			});
		} catch {
			return iso;
		}
	};

	return (
		<main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
			<div className="w-full max-w-lg space-y-4">
				{/* Header card */}
				<div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
					<div className="flex items-center gap-4">
						<div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold shrink-0">
							{student.lastname[0]}
							{student.firstname[0]}
						</div>
						<div>
							<p className="text-white/70 text-sm">Шалгуулагч</p>
							<h1 className="text-xl font-bold">
								{student.lastname} {student.firstname}
							</h1>
							<p className="font-mono text-white/80 text-sm mt-0.5">
								{student.reg_number}
							</p>
						</div>
					</div>
				</div>

				{/* Info card */}
				<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm px-5 py-2">
					<InfoRow label="Сургууль" value={student.schoolname} />
					<InfoRow
						label="Анги / Бүлэг"
						value={`${student.class_id}-р анги · ${student.studentgroupname}`}
					/>
					<InfoRow label="Аймаг / Нийслэл" value={student.aimag_name} />
					<InfoRow label="Дүүрэг / Сум" value={student.sym_name} />
					<InfoRow
						label="Төрсөн огноо"
						value={formatDate(student.dateofbirth)}
					/>
					<InfoRow label="Утас" value={student.phone} />
					<InfoRow label="И-мэйл" value={student.email} />
					<InfoRow
						label="Хүйс"
						value={student.gender === 1 ? "Эрэгтэй" : "Эмэгтэй"}
					/>
				</div>

				{/* Actions */}
				<div className="flex gap-3">
					<button
						type="button"
						onClick={() => router.back()}
						className="flex-1 py-3 rounded-xl font-semibold text-sm border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
					>
						← Буцах
					</button>
					<button
						type="button"
						onClick={() => {
							// Дараагийн алхам руу шилжих
							router.push("/dashboard");
						}}
						className="flex-1 py-3 rounded-xl font-semibold text-sm text-white
              bg-gradient-to-r from-emerald-500 to-teal-600
              hover:from-emerald-600 hover:to-teal-700
              shadow-lg shadow-emerald-500/20 hover:shadow-xl
              hover:-translate-y-0.5 active:translate-y-0
              transition-all duration-200"
					>
						Үргэлжлүүлэх →
					</button>
				</div>
			</div>
		</main>
	);
}
