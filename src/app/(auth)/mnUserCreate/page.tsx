"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingState } from "@/components/page/pageStates";
import { AuthShell } from "../authShell";
import StudentForm, { type StudentExamData } from "./form";

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
			setStudent(JSON.parse(raw) as StudentExamData);
		} catch {
			router.replace("/login");
		}
	}, [router]);

	if (!student) {
		return (
			<AuthShell>
				<LoadingState label="Мэдээлэл ачааллаж байна..." />
			</AuthShell>
		);
	}

	return <StudentForm data={student} />;
}
