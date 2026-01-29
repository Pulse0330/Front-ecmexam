"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search } from "lucide-react";
import { useState } from "react";
import { getCourseList } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { CourseListResponse } from "@/types/course/courseList";
import { CourseCard } from "./card";

const CourseListPage = () => {
	const { userId } = useAuthStore();
	const [searchTerm, setSearchTerm] = useState("");

	const {
		data: queryData,
		isPending,
		isError,
		error,
	} = useQuery<CourseListResponse>({
		queryKey: ["getCourseList", userId],
		queryFn: () => getCourseList(userId || 0),
		enabled: !!userId,
	});

	if (isPending) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
					<p className="text-muted-foreground">Ачааллаж байна...</p>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="container mx-auto p-4">
				<div className="flex flex-col items-center justify-center min-h-[400px] text-center">
					<div className="mb-6 p-6 bg-red-50 dark:bg-red-950/20 rounded-full">
						<BookOpen className="w-16 h-16 text-red-500" />
					</div>
					<h2 className="text-xl font-semibold mb-2 text-red-600 dark:text-red-400">
						Алдаа гарлаа
					</h2>
					<p className="text-muted-foreground max-w-md">{error.message}</p>
				</div>
			</div>
		);
	}

	if (!queryData?.RetResponse.ResponseType) {
		return (
			<div className="container mx-auto p-4">
				<h1 className="text-2xl font-bold mb-6">Миний хичээлүүд</h1>

				<div className="flex flex-col items-center justify-center min-h-[400px] text-center">
					<div className="mb-6 p-6 bg-muted/50 rounded-full">
						<BookOpen className="w-16 h-16 text-muted-foreground" />
					</div>
					<h2 className="text-xl font-semibold mb-2">Хичээл олдсонгүй</h2>
					<p className="text-muted-foreground max-w-md">
						Та одоогоор ямар ч хичээлд бүртгүүлээгүй байна.
					</p>
				</div>
			</div>
		);
	}

	if (!userId) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center p-8 text-muted-foreground">
					<p className="text-lg">Хэрэглэгчийн мэдээлэл олдсонгүй</p>
				</div>
			</div>
		);
	}

	const courses = queryData?.RetData || [];

	if (courses.length === 0) {
		return (
			<div className="container mx-auto p-4">
				<h1 className="text-2xl font-bold mb-6">Миний хичээлүүд</h1>

				<div className="flex flex-col items-center justify-center min-h-[400px] text-center">
					<div className="mb-6 p-6 bg-muted/50 rounded-full">
						<BookOpen className="w-16 h-16 text-muted-foreground" />
					</div>
					<h2 className="text-xl font-semibold mb-2">Хичээл олдсонгүй</h2>
					<p className="text-muted-foreground max-w-md">
						Та одоогоор ямар ч хичээлд бүртгүүлээгүй байна.
					</p>
				</div>
			</div>
		);
	}

	const filteredCourses = courses.filter(
		(course) =>
			course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			course.teach_name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-6">Миний хичээлүүд</h1>

			<div className="relative mb-6">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
				<input
					type="text"
					placeholder="Хичээл эсвэл багшаар хайх..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="border rounded-lg px-4 py-2 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-primary"
				/>
			</div>

			<p className="text-muted-foreground mb-4">
				Нийт: {filteredCourses.length} хичээл
			</p>

			{filteredCourses.length === 0 ? (
				<div className="flex flex-col items-center justify-center min-h-[300px] text-center">
					<div className="mb-6 p-6 bg-muted/50 rounded-full">
						<Search className="w-16 h-16 text-muted-foreground" />
					</div>
					<h2 className="text-xl font-semibold mb-2">
						Хайлтын үр дүн олдсонгүй
					</h2>
					<p className="text-muted-foreground max-w-md">
						"{searchTerm}" гэсэн хайлтаар хичээл олдсонгүй.
						<br />
						Өөр түлхүүр үг ашиглан дахин оролдоно уу.
					</p>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-8">
					{filteredCourses.map((course, idx) => (
						<CourseCard key={course.content_id} course={course} index={idx} />
					))}
				</div>
			)}
		</div>
	);
};

export default CourseListPage;
