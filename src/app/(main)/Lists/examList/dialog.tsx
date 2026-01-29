"use client";

import {
	AlertTriangle,
	Ban,
	Camera,
	CheckCircle2,
	Clock,
	Copy,
	Eye,
	FileText,
	Globe,
	Keyboard,
	Lock,
	type LucideIcon,
	MessageSquare,
	Monitor,
	Mouse,
	Settings,
	ShieldAlert,
	Smartphone,
	Users,
	Volume2,
	Wifi,
	X,
	Zap,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface ExamRulesDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isMobile?: boolean;
}

interface Rule {
	icon: LucideIcon;
	title: string;
	severity: "high" | "medium" | "low";
	description: string;
}

export default function ExamRulesDialog({
	open,
	onOpenChange,
	onConfirm,
	isMobile = false,
}: ExamRulesDialogProps) {
	const [showMessage, setShowMessage] = useState(false);

	// Desktop specific monitoring rules
	const desktopMonitoringRules = useMemo<Rule[]>(
		() => [
			{
				icon: Monitor,
				title: "Цонх солих / Tab солих",
				severity: "high",
				description:
					"Өөр цонх эсвэл tab руу шилжихийг хориглоно. Таны сэжигтэй үйлдэл бүртгэгдэнэ.",
			},
			{
				icon: Lock,
				title: "Fullscreen горимоос гарах",
				severity: "high",
				description: "Шалгалтын үед fullscreen горимоос гарахыг хориглоно",
			},
			{
				icon: Mouse,
				title: "Хулгана цонхноос гаргах",
				severity: "medium",
				description: "Хулганы заагчийг 3+ секунд цонхноос гаргаж болохгүй",
			},
			{
				icon: Keyboard,
				title: "Shortcut товчлуурууд",
				severity: "high",
				description:
					"Alt+Tab, Cmd+Tab, Ctrl+W зэрэг товчлууруудыг идэвхгүй болгосон",
			},
		],
		[],
	);

	// Mobile specific monitoring rules
	const mobileMonitoringRules = useMemo<Rule[]>(
		() => [
			{
				icon: Smartphone,
				title: "Өөр апп руу шилжих",
				severity: "high",
				description: "Шалгалтын үед өөр application руу шилжихийг хориглоно",
			},
			{
				icon: Smartphone,
				title: "Утасны orientation өөрчлөх",
				severity: "medium",
				description: "Дэлгэцийн чиглэлийг өөрчлөх үйлдлийг хязгаарласан",
			},
			{
				icon: MessageSquare,
				title: "Notification-ууд",
				severity: "medium",
				description:
					"Шалгалтын үед notification харуулахгүй байхыг зөвлөж байна",
			},
			{
				icon: Volume2,
				title: "Утас ирэх",
				severity: "medium",
				description: "Утасны дуудлага ирвэл шалгалт түр зогсоно",
			},
		],
		[],
	);

	const systemRestrictions = useMemo<Rule[]>(
		() => [
			{
				icon: Copy,
				title: "Copy / Paste / Cut үйлдлүүд",
				severity: "high",
				description: "Текст хуулах, буулгах, таслах үйлдлүүдийг хориглоно",
			},
			{
				icon: Ban,
				title: "DevTools / Inspect Element",
				severity: "high",
				description:
					"Developer Tools нээх, баруун товч дарах, F12 дарахыг хориглоно",
			},
			{
				icon: Camera,
				title: "Screenshot / Screen Recording",
				severity: "high",
				description: "Дэлгэцийн зураг авах, бичлэг хийх оролдлогыг илрүүлнэ",
			},
			{
				icon: FileText,
				title: "Хэвлэх (Print)",
				severity: "high",
				description: "Ctrl+P, Cmd+P ашиглан хэвлэх оролдлогыг хориглоно",
			},
			{
				icon: Settings,
				title: "Browser Settings",
				severity: "medium",
				description: "Browser тохиргоо нээх, extension ашиглахыг хориглоно",
			},
			{
				icon: Globe,
				title: "Өөр веб хуудас нээх",
				severity: "high",
				description: "Шинэ tab, цонх нээх, link дарахыг хориглоно",
			},
		],
		[],
	);

	const behavioralRules = useMemo<Rule[]>(
		() => [
			{
				icon: Eye,
				title: "Камерын хяналт (опцион)",
				severity: "medium",
				description: "Зарим шалгалтад камер нээлттэй байх шаардлагатай",
			},
			{
				icon: Users,
				title: "Бусдын тусламж авах",
				severity: "high",
				description: "Өөр хүнтэй ярих, туслуулах, chat хийхийг хатуу хориглоно",
			},
			{
				icon: Wifi,
				title: "Интернэт холболт",
				severity: "high",
				description:
					"Холболт тасарвал шалгалт түр зогсоно. VPN ашиглахыг хориглоно",
			},
			{
				icon: Clock,
				title: "Цаг хугацааны хязгаар",
				severity: "medium",
				description: "Шалгалтын хугацаа дуусахад автоматаар илгээгдэнэ",
			},
			{
				icon: ShieldAlert,
				title: "Хуурамч мэдээлэл өгөх",
				severity: "high",
				description: "Бусдын нэрээр нэвтрэх, proxy ашиглахыг хориглоно",
			},
			{
				icon: Zap,
				title: "Цахилгаан тасрах",
				severity: "low",
				description:
					"Тасрах үед backup хийгддэг боловч дахин нэвтрэх шаардлагатай",
			},
		],
		[],
	);

	// Exam guidelines (positive rules)
	const examGuidelines = useMemo<Rule[]>(
		() => [
			{
				icon: CheckCircle2,
				title: "Зөвхөн шалгалтын цонх ашиглах",
				severity: "low",
				description:
					"Шалгалтын үед зөвхөн шалгалтын interface дээр ажиллана уу",
			},
			{
				icon: FileText,
				title: "Эмхэтгэсэн тэмдэглэл (зөвшөөрөгдсөн)",
				severity: "low",
				description: "Зарим шалгалтанд A4 1 хуудас тэмдэглэл авахыг зөвшөөрнө",
			},
			{
				icon: Clock,
				title: "Цагийг зөв удирдах",
				severity: "low",
				description: "Үлдсэн хугацааг хянаж, асуултуудыг төлөвлөн хариулна уу",
			},
		],
		[],
	);

	// Combine all rules based on device type
	const allRules = useMemo(
		() => [
			...(isMobile ? mobileMonitoringRules : desktopMonitoringRules),
			...systemRestrictions,
			...behavioralRules,
			...examGuidelines,
		],
		[
			isMobile,
			mobileMonitoringRules,
			desktopMonitoringRules,
			systemRestrictions,
			behavioralRules,
			examGuidelines,
		],
	);

	const handleStartExam = useCallback(() => {
		setShowMessage(true);
		setTimeout(() => {
			onConfirm();
			onOpenChange(false);
			setShowMessage(false);
		}, 1800);
	}, [onConfirm, onOpenChange]);

	const handleCancel = useCallback(() => {
		onOpenChange(false);
	}, [onOpenChange]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-full max-w-4xl p-0 flex flex-col max-h-[95vh] overflow-hidden">
				{/* Header Section */}
				<div className="px-4 pt-6 pb-4 sm:px-6 border-b bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
							Таньд амжилт хүсье! 🎓
						</DialogTitle>
						<DialogDescription className="text-base sm:text-lg font-medium mt-2 text-gray-700 dark:text-gray-300">
							Шалгалтын дүрэм журмыг анхааралтай уншаад эхлүүлнэ үү
						</DialogDescription>
					</DialogHeader>

					{/* Critical Warning Alert */}
					<Alert variant="destructive" className="mt-4 border-2 shadow-lg">
						<AlertTriangle className="h-6 w-6" />
						<AlertDescription className="font-bold text-sm">
							⚠️ АНХААРУУЛГА: 3 удаа ноцтой дүрэм зөрчвөл шалгалт автоматаар
							дуусгана!
						</AlertDescription>
					</Alert>

					{/* Info Stats */}
					<div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:text-sm">
						<div className="bg-white dark:bg-gray-800 p-3 rounded-lg border shadow-sm">
							<div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
								<ShieldAlert className="w-4 h-4" />
								<span>
									Ноцтой дүрэм:{" "}
									{allRules.filter((r) => r.severity === "high").length}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Scrollable Rules Section */}
				<div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
					{/* Desktop/Mobile Monitoring Section */}
					<div className="mb-6">
						<h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
							<Monitor className="w-5 h-5" />
							{isMobile ? "Утасны хяналт" : "Дэлгэцний хяналт"}
						</h3>
						<div className="space-y-2.5">
							{(isMobile ? mobileMonitoringRules : desktopMonitoringRules).map(
								(rule) => (
									<RuleItem key={`monitoring-${rule.title}`} {...rule} />
								),
							)}
						</div>
					</div>

					{/* System Restrictions Section */}
					<div className="mb-6">
						<h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
							<Ban className="w-5 h-5" />
							Системийн хязгаарлалт
						</h3>
						<div className="space-y-2.5">
							{systemRestrictions.map((rule) => (
								<RuleItem key={rule.title} {...rule} />
							))}
						</div>
					</div>

					{/* Behavioral Rules Section */}
					<div className="mb-6">
						<h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
							<Users className="w-5 h-5" />
							Хандлага болон аюулгүй байдал
						</h3>
						<div className="space-y-2.5">
							{behavioralRules.map((rule) => (
								<RuleItem key={rule.title} {...rule} />
							))}
						</div>
					</div>

					{/* Exam Guidelines Section */}
					<div className="mb-6">
						<h3 className="text-sm font-bold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
							<CheckCircle2 className="w-5 h-5" />
							Шалгалтын зөвлөмж
						</h3>
						<div className="space-y-2.5">
							{examGuidelines.map((rule) => (
								<RuleItem key={rule.title} {...rule} />
							))}
						</div>
					</div>
				</div>

				{/* Sticky Footer */}
				<DialogFooter className="flex flex-col-reverse sm:flex-row gap-2.5 p-4 sm:px-6 sm:py-5 border-t bg-linear-to-b from-gray-50/80 to-gray-100/80 dark:from-gray-900/80 dark:to-gray-950/80 backdrop-blur-sm">
					<Button
						variant="outline"
						onClick={handleCancel}
						disabled={showMessage}
						className="w-full sm:w-auto text-sm font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
					>
						<X className="w-4 h-4 mr-2" />
						Цуцлах
					</Button>
					<Button
						onClick={handleStartExam}
						disabled={showMessage}
						className="w-full sm:w-auto text-sm font-medium bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
					>
						{!showMessage && <CheckCircle2 className="w-4 h-4" />}
						{showMessage ? "Бэлдэж байна..." : "Шалгалт эхлүүлэх"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// Memoized RuleItem component
interface RuleItemProps {
	icon: LucideIcon;
	title: string;
	severity: "high" | "medium" | "low";
	description: string;
}

const RuleItem = React.memo<RuleItemProps>(function RuleItem({
	icon: Icon,
	title,
	description,
	severity,
}) {
	const severityConfig = useMemo(
		() => ({
			high: {
				className:
					"text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-950/40 hover:border-red-400",
				badge: "🔴",
				label: "Ноцтой",
			},
			medium: {
				className:
					"text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800/50 hover:bg-orange-100 dark:hover:bg-orange-950/40 hover:border-orange-400",
				badge: "🟠",
				label: "Дунд",
			},
			low: {
				className:
					"text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-950/40 hover:border-green-400",
				badge: "🟢",
				label: "Зөвлөмж",
			},
		}),
		[],
	);

	const config = severityConfig[severity];

	return (
		<div
			className={`flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 ${config.className} hover:shadow-md hover:scale-[1.01] group`}
		>
			<div className="shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
				<Icon className="w-5 h-5" strokeWidth={2.5} />
			</div>
			<div className="flex-1 min-w-0">
				<h4 className="font-bold text-sm sm:text-base mb-1 flex items-center gap-2 flex-wrap">
					<span>{title}</span>
					<span className="text-[10px] px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20 font-semibold">
						{config.label}
					</span>
				</h4>
				<p className="text-xs sm:text-sm leading-relaxed opacity-90">
					{description}
				</p>
			</div>
		</div>
	);
});
