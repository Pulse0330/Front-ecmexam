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

// ============================================
// CONSTANTS - Component-оос гадна
// ============================================

const DESKTOP_MONITORING_RULES: Rule[] = [
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
];

const MOBILE_MONITORING_RULES: Rule[] = [
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
		description: "Шалгалтын үед notification харуулахгүй байхыг зөвлөж байна",
	},
	{
		icon: Volume2,
		title: "Утас ирэх",
		severity: "medium",
		description: "Утасны дуудлага ирвэл шалгалт түр зогсоно",
	},
];

const SYSTEM_RESTRICTIONS: Rule[] = [
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
];

const BEHAVIORAL_RULES: Rule[] = [
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
		description: "Тасрах үед backup хийгддэг боловч дахин нэвтрэх шаардлагатай",
	},
];

const EXAM_GUIDELINES: Rule[] = [
	{
		icon: CheckCircle2,
		title: "Зөвхөн шалгалтын цонх ашиглах",
		severity: "low",
		description: "Шалгалтын үед зөвхөн шалгалтын interface дээр ажиллана уу",
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
];

const SEVERITY_CONFIG = {
	high: {
		className: "severity-high",
		label: "Ноцтой",
	},
	medium: {
		className: "severity-medium",
		label: "Дунд",
	},
	low: {
		className: "severity-low",
		label: "Зөвлөмж",
	},
} as const;

// ============================================
// MAIN COMPONENT
// ============================================

export default function ExamRulesDialog({
	open,
	onOpenChange,
	onConfirm,
	isMobile = false,
}: ExamRulesDialogProps) {
	const [showMessage, setShowMessage] = useState(false);

	// Зөвхөн isMobile-аас хамааран allRules тооцоолох
	const allRules = useMemo(() => {
		const monitoringRules = isMobile
			? MOBILE_MONITORING_RULES
			: DESKTOP_MONITORING_RULES;

		return [
			...monitoringRules,
			...SYSTEM_RESTRICTIONS,
			...BEHAVIORAL_RULES,
			...EXAM_GUIDELINES,
		];
	}, [isMobile]);

	// Stats тооцоолох
	const stats = useMemo(
		() => ({
			high: allRules.filter((r) => r.severity === "high").length,
			medium: allRules.filter((r) => r.severity === "medium").length,
		}),
		[allRules],
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

	const monitoringRules = isMobile
		? MOBILE_MONITORING_RULES
		: DESKTOP_MONITORING_RULES;

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

					{/* Info Stats - Optimized */}
					<div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:text-sm">
						<div className="bg-white dark:bg-gray-800 p-3 rounded-lg border shadow-sm">
							<div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
								<ShieldAlert className="w-4 h-4" />
								<span>Ноцтой дүрэм: {stats.high}</span>
							</div>
						</div>
						<div className="bg-white dark:bg-gray-800 p-3 rounded-lg border shadow-sm">
							<div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold">
								<AlertTriangle className="w-4 h-4" />
								<span>Дунд зэрэг: {stats.medium}</span>
							</div>
						</div>
					</div>
				</div>

				{/* Scrollable Rules Section */}
				<div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
					{/* Desktop/Mobile Monitoring Section */}
					<RulesSection
						title={isMobile ? "Утасны хяналт" : "Дэлгэцний хяналт"}
						icon={Monitor}
						rules={monitoringRules}
					/>

					{/* System Restrictions Section */}
					<RulesSection
						title="Системийн хязгаарлалт"
						icon={Ban}
						rules={SYSTEM_RESTRICTIONS}
					/>

					{/* Behavioral Rules Section */}
					<RulesSection
						title="Хандлага болон аюулгүй байдал"
						icon={Users}
						rules={BEHAVIORAL_RULES}
					/>

					{/* Exam Guidelines Section */}
					<RulesSection
						title="Шалгалтын зөвлөмж"
						icon={CheckCircle2}
						rules={EXAM_GUIDELINES}
						titleClassName="text-green-700 dark:text-green-400"
					/>
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

// ============================================
// SUB-COMPONENTS
// ============================================

interface RulesSectionProps {
	title: string;
	icon: LucideIcon;
	rules: Rule[];
	titleClassName?: string;
}

const RulesSection = React.memo<RulesSectionProps>(function RulesSection({
	title,
	icon: Icon,
	rules,
	titleClassName = "text-gray-900 dark:text-gray-100",
}) {
	return (
		<div className="mb-6">
			<h3
				className={`text-sm font-bold mb-3 flex items-center gap-2 ${titleClassName}`}
			>
				<Icon className="w-5 h-5" />
				{title}
			</h3>
			<div className="space-y-2.5">
				{rules.map((rule) => (
					<RuleItem key={rule.title} {...rule} />
				))}
			</div>
		</div>
	);
});

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
	const config = SEVERITY_CONFIG[severity];

	return (
		<div className={`rule-item ${config.className}`}>
			<div className="rule-icon">
				<Icon className="w-5 h-5" strokeWidth={2.5} />
			</div>
			<div className="rule-content">
				<h4 className="rule-title">
					<span>{title}</span>
					<span className="rule-badge">{config.label}</span>
				</h4>
				<p className="rule-description">{description}</p>
			</div>
		</div>
	);
});
