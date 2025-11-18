"use client";

import { useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	Calendar,
	Hash,
	Mail,
	Phone,
	School,
	Shield,
	User,
	UserCircle,
} from "lucide-react";
import UseAnimations from "react-useanimations";
import loading2 from "react-useanimations/lib/loading2";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getUserProfile } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { UserProfileResponseType } from "@/types/user";

export default function UserProfilePage() {
	const { userId } = useAuthStore();

	const { data, isLoading, isError, error } = useQuery<UserProfileResponseType>(
		{
			queryKey: ["userProfilePage", userId],
			queryFn: () => getUserProfile(userId || 0),
			enabled: !!userId,
		},
	);

	// Not logged in
	if (!userId) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="text-center space-y-4 p-8 rounded-lg bg-muted border border-border shadow-sm">
					<AlertCircle className="w-12 h-12 mx-auto text-muted-foreground" />
					<p className="text-foreground font-medium">
						Хэрэглэгч нэвтрээгүй байна.
					</p>
					<p className="text-sm text-muted-foreground">
						Та эхлээд системд нэвтэрнэ үү
					</p>
				</div>
			</div>
		);
	}

	// Loading
	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
				<div className="relative">
					<div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
					<UseAnimations
						animation={loading2}
						size={64}
						strokeColor="hsl(var(--primary))"
						loop
					/>
				</div>
				<div className="space-y-2 text-center">
					<p className="text-lg font-medium text-foreground animate-pulse">
						Уншиж байна...
					</p>
					<p className="text-sm text-muted-foreground">Түр хүлээнэ үү</p>
				</div>
			</div>
		);
	}

	// Error
	if (isError) {
		return (
			<div className="flex items-center justify-center min-h-[60vh] p-4">
				<div className="max-w-md w-full bg-destructive/10 border border-destructive/50 rounded-lg p-6 shadow-sm">
					<div className="flex items-start space-x-3">
						<AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
						<div className="flex-1 space-y-2">
							<h3 className="font-semibold text-destructive">Алдаа гарлаа</h3>
							<p className="text-sm text-destructive/80">
								{(error as Error).message}
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const user = data?.RetData?.[0];
	const isSuccess = data?.RetResponse?.ResponseType === true;

	if (!isSuccess || !user) {
		return (
			<div className="flex items-center justify-center min-h-[60vh] p-4">
				<div className="max-w-md w-full bg-destructive/10 border border-destructive/50 rounded-lg p-6 shadow-sm">
					<div className="flex items-start space-x-3">
						<AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
						<div className="flex-1">
							<h3 className="font-semibold text-destructive">
								Профайл татахад алдаа гарлаа
							</h3>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Format date
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("mn-MN", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Get initials for avatar
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<div className="min-h-screen bg-gradient-page p-4 md:p-6">
			<div className="max-w-4xl mx-auto space-y-6">
				{/* Header */}
				<div>
					<h1 className="text-3xl font-bold text-card-foreground mb-2">
						Хэрэглэгчийн профайл
					</h1>
					<p className="text-muted-foreground">Таны бүртгэлийн мэдээлэл</p>
				</div>

				{/* Profile Card */}
				<Card className="overflow-hidden">
					{/* Header section with gradient */}
					<div className="h-32 bg-gradient-to-r from-primary to-primary/80 relative">
						<div className="absolute -bottom-16 left-8">
							<Avatar className="w-32 h-32 border-4 border-card shadow-xl">
								<AvatarImage
									src={user.img_url || undefined}
									alt={user.username}
								/>
								<AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
									{getInitials(user.username)}
								</AvatarFallback>
							</Avatar>
						</div>
					</div>

					<CardContent className="pt-20 pb-6">
						<div className="flex items-start justify-between mb-6">
							<div>
								<h2 className="text-2xl font-bold text-card-foreground mb-1">
									{user.username}
								</h2>
								<p className="text-muted-foreground flex items-center gap-2">
									<Hash className="w-4 h-4" />
									{user.user_code}
								</p>
							</div>
							<Badge variant="default" className="bg-chart-2">
								<Shield className="w-3 h-3 mr-1" />
								Идэвхтэй
							</Badge>
						</div>

						<Separator className="my-6" />

						{/* Info Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Personal Info */}
							<div className="space-y-4">
								<h3 className="font-semibold text-card-foreground flex items-center gap-2">
									<UserCircle className="w-5 h-5 text-primary" />
									Хувийн мэдээлэл
								</h3>

								<div className="space-y-3">
									<InfoItem
										icon={<User className="w-4 h-4 text-chart-1" />}
										label="Овог"
										value={user.lastname}
									/>
									<InfoItem
										icon={<User className="w-4 h-4 text-chart-1" />}
										label="Нэр"
										value={user.firstname}
									/>
									<InfoItem
										icon={<Mail className="w-4 h-4 text-chart-2" />}
										label="Имэйл"
										value={user.email}
									/>
									<InfoItem
										icon={<Phone className="w-4 h-4 text-chart-3" />}
										label="Утас"
										value={user.Phone || "—"}
									/>
								</div>
							</div>

							{/* System Info */}
							<div className="space-y-4">
								<h3 className="font-semibold text-card-foreground flex items-center gap-2">
									<Shield className="w-5 h-5 text-primary" />
									Системийн мэдээлэл
								</h3>

								<div className="space-y-3">
									<InfoItem
										icon={<Hash className="w-4 h-4 text-chart-4" />}
										label="Хэрэглэгчийн ID"
										value={user.id.toString()}
									/>
									<InfoItem
										icon={<School className="w-4 h-4 text-chart-5" />}
										label="Сургуулийн ID"
										value={user.school_id?.toString() || "—"}
									/>
									<InfoItem
										icon={<Calendar className="w-4 h-4 text-chart-1" />}
										label="Бүртгүүлсэн"
										value={formatDate(user.created)}
									/>
									<InfoItem
										icon={<Calendar className="w-4 h-4 text-chart-2" />}
										label="Шинэчилсэн"
										value={formatDate(user.updated_on)}
									/>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Additional Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Нэвтрэх нэр
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="flex justify-content  item-center">
								{user.login_name}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Хэрэглэгчийн код
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p>{user.user_code}</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Бүлэг
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-bold text-card-foreground">
								{user.ugroup}
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

// Info Item Component
interface InfoItemProps {
	icon: React.ReactNode;
	label: string;
	value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
	<div className="flex items-center gap-3">
		<div className="p-2 bg-accent rounded-lg shrink-0">{icon}</div>
		<div className="flex-1 min-w-0">
			<p className="text-xs text-muted-foreground">{label}</p>
			<p className="text-sm font-medium text-card-foreground truncate">
				{value}
			</p>
		</div>
	</div>
);
