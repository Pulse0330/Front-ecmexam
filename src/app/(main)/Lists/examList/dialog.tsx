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
	Shield,
	ShieldAlert,
	Smartphone,
	Users,
	Volume2,
	Wifi,
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
	maxViolations?: number; // Sync with AdvancedExamProctor
	strictMode?: boolean; // Sync with AdvancedExamProctor
	enableFullscreen?: boolean; // Sync with AdvancedExamProctor
}

interface Rule {
	icon: LucideIcon;
	title: string;
	severity: "high" | "medium" | "low";
	description: string;
	category: "monitoring" | "system" | "behavioral" | "guideline";
}

export default function ExamRulesDialog({
	open,
	onOpenChange,
	onConfirm,
	isMobile = false,
	maxViolations = 3,
	strictMode = true,
	enableFullscreen = true,
}: ExamRulesDialogProps) {
	const [showMessage, setShowMessage] = useState(false);

	// Desktop-specific monitoring rules (aligned with AdvancedExamProctor)
	const desktopMonitoringRules = useMemo<Rule[]>(
		() => [
			{
				icon: Monitor,
				title: "Цонх солих / Tab солих",
				severity: "high",
				description:
					"Өөр цонх эсвэл tab руу шилжихийг хориглоно (TAB_SWITCH, TAB_HIDDEN). Fullscreen-ээс гарах, focus алдах бүртгэгдэнэ.",
				category: "monitoring",
			},
			{
				icon: Lock,
				title: "Fullscreen горимоос гарах",
				severity: "high",
				description:
					"Fullscreen горимоос гарахыг хориглоно (FULLSCREEN_EXIT). Автоматаар буцаан fullscreen болгоно.",
				category: "monitoring",
			},
			{
				icon: Mouse,
				title: "Хулгана цонхноос гаргах",
				severity: "medium",
				description:
					"Хулганы заагчийг 3+ секунд цонхноос гаргаж болохгүй (MOUSE_LEFT). Анхааруулга харуулна.",
				category: "monitoring",
			},
			{
				icon: Keyboard,
				title: "DevTools нээх оролдлого",
				severity: "high",
				description:
					"F12, Ctrl+Shift+I/J/C, Cmd+Option+I товчлууруудыг хориглоно (DEVTOOLS_ATTEMPT).",
				category: "monitoring",
			},
		],
		[],
	);

	// Mobile-specific monitoring rules (aligned with AdvancedExamProctor)
	const mobileMonitoringRules = useMemo<Rule[]>(
		() => [
			{
				icon: Smartphone,
				title: "Өөр апп руу шилжих",
				severity: "high",
				description:
					"Шалгалтын үед өөр application руу шилжихийг хориглоно (TAB_SWITCH). Апп нуугдахыг илрүүлнэ.",
				category: "monitoring",
			},
			{
				icon: Smartphone,
				title: "Утасны orientation өөрчлөх",
				severity: "medium",
				description:
					"Дэлгэцийн чиглэлийг өөрчлөх үйлдлийг бүртгэнэ (ORIENTATION_CHANGE).",
				category: "monitoring",
			},
			{
				icon: MessageSquare,
				title: "Олон хуруу / Удаан дарах",
				severity: "medium",
				description:
					"Multi-touch болон long-press үйлдлийг хориглоно (MULTI_TOUCH, LONG_PRESS).",
				category: "monitoring",
			},
			{
				icon: Volume2,
				title: "Notification / Дуудлага",
				severity: "medium",
				description:
					"Утасны дуудлага ирэх, notification ирэх үед анхааруулга өгнө.",
				category: "monitoring",
			},
		],
		[],
	);

	// System restrictions (aligned with AdvancedExamProctor)
	const systemRestrictions = useMemo<Rule[]>(
		() => [
			{
				icon: Copy,
				title: "Copy / Paste / Cut үйлдлүүд",
				severity: "high",
				description:
					"Текст хуулах (COPY_ATTEMPT), буулгах (PASTE_ATTEMPT), таслах (CUT_ATTEMPT) үйлдлүүдийг бүрэн хориглоно.",
				category: "system",
			},
			{
				icon: Ban,
				title: "Баруун товч / Context Menu",
				severity: "medium",
				description:
					"Баруун товчлуур дарахыг хориглоно (CONTEXT_MENU). Inspect element хийх боломжгүй.",
				category: "system",
			},
			{
				icon: Camera,
				title: "Screenshot оролдлого",
				severity: "high",
				description:
					"PrintScreen товч дарахыг илрүүлнэ (SCREENSHOT_ATTEMPT). Дэлгэцийн зураг авах оролдлого.",
				category: "system",
			},
			{
				icon: FileText,
				title: "Хэвлэх (Print)",
				severity: "high",
				description:
					"Ctrl+P, Cmd+P ашиглан хэвлэх оролдлогыг хориглоно (PRINT_ATTEMPT).",
				category: "system",
			},
			{
				icon: Settings,
				title: "Текст сонгох / Drag үйлдэл",
				severity: "low",
				description:
					"Текст сонгох, drag хийх үйлдлийг хориглосон (DRAG_ATTEMPT). User selection идэвхгүй.",
				category: "system",
			},
			{
				icon: Globe,
				title: "Ctrl+S / Ctrl+U хэрэглэх",
				severity: "high",
				description:
					"Хуудас хадгалах, эх код харах оролдлогыг хориглоно (DEVTOOLS_ATTEMPT).",
				category: "system",
			},
		],
		[],
	);

	// Behavioral rules
	const behavioralRules = useMemo<Rule[]>(
		() => [
			{
				icon: Eye,
				title: "Камерын хяналт (опцион)",
				severity: "medium",
				description:
					"Зарим шалгалтад камер нээлттэй байх шаардлагатай. Дэлгэц болон царай хянана.",
				category: "behavioral",
			},
			{
				icon: Users,
				title: "Бусдын тусламж авах",
				severity: "high",
				description:
					"Өөр хүнтэй ярих, туслуулах, chat хийхийг хатуу хориглоно. Ганцаараа ажиллах.",
				category: "behavioral",
			},
			{
				icon: Wifi,
				title: "Интернэт холболт",
				severity: "high",
				description:
					"Холболт тасарвал шалгалт түр зогсоно. VPN ашиглахыг хориглоно. Тогтвортой холболт хэрэгтэй.",
				category: "behavioral",
			},
			{
				icon: Clock,
				title: "Цаг хугацааны хязгаар",
				severity: "medium",
				description:
					"Шалгалтын хугацаа дуусахад автоматаар илгээгдэнэ. Хугацааг бүрэн ашиглана уу.",
				category: "behavioral",
			},
			{
				icon: ShieldAlert,
				title: "Хуурамч мэдээлэл өгөх",
				severity: "high",
				description:
					"Бусдын нэрээр нэвтрэх, vpn ашиглахыг хориглоно. Зөвхөн өөрийн account.",
				category: "behavioral",
			},
			{
				icon: Zap,
				title: "Цахилгаан / Browser унах",
				severity: "low",
				description:
					"Тасрах үед backup хийгддэг боловч дахин нэвтрэх шаардлагатай. Батарей шалгана уу.",
				category: "behavioral",
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
					"Шалгалтын үед зөвхөн шалгалтын interface дээр ажиллана уу. Бусад апп хаана уу.",
				category: "guideline",
			},
			{
				icon: FileText,
				title: "Эмхэтгэсэн тэмдэглэл (зөвшөөрөгдсөн)",
				severity: "low",
				description:
					"Зарим шалгалтанд A4 1 хуудас тэмдэглэл авахыг зөвшөөрнө. Багшаас лавлана уу.",
				category: "guideline",
			},
			{
				icon: Clock,
				title: "Цагийг зөв удирдах",
				severity: "low",
				description:
					"Үлдсэн хугацааг хянаж, асуултуудыг төлөвлөн хариулна уу. Эхлээд амархан асуултаас эхлэх.",
				category: "guideline",
			},
			{
				icon: Shield,
				title: "Шалгалтын бүрэн бүтэн байдал",
				severity: "low",
				description:
					"Шударга шалгалт өгөх нь таны болон бусдын ирээдүйд ач холбогдолтой. Өөртөө итгэлтэй байгаарай.",
				category: "guideline",
			},
		],
		[],
	);

	// Filter rules based on strictMode and enableFullscreen
	const filteredRules = useMemo(() => {
		let rules = [
			...(isMobile ? mobileMonitoringRules : desktopMonitoringRules),
			...systemRestrictions,
			...behavioralRules,
			...examGuidelines,
		];

		// Remove fullscreen rule if disabled
		if (!enableFullscreen) {
			rules = rules.filter((r) => r.title !== "Fullscreen горимоос гарах");
		}

		// In non-strict mode, downgrade some severities
		if (!strictMode) {
			rules = rules.map((r) => {
				if (r.severity === "high" && r.category === "monitoring") {
					return { ...r, severity: "medium" as const };
				}
				return r;
			});
		}

		return rules;
	}, [
		isMobile,
		mobileMonitoringRules,
		desktopMonitoringRules,
		systemRestrictions,
		behavioralRules,
		examGuidelines,
		enableFullscreen,
		strictMode,
	]);

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

	const criticalCount = filteredRules.filter(
		(r) => r.severity === "high",
	).length;
	const mediumCount = filteredRules.filter(
		(r) => r.severity === "medium",
	).length;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
				{/* Header Section */}
				<DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
					<div className="flex items-start gap-3">
						<div className="mt-0.5 p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
							<Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
						</div>
						<div className="flex-1">
							<DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
								Шалгалтын дүрэм журам
							</DialogTitle>
							<DialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
								Таньд амжилт хүсье! 🎓 Шалгалтын дүрэм журмыг анхааралтай уншаад
								эхлүүлнэ үү
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				{/* Critical Warning Alert */}
				{strictMode && (
					<div className="px-4 sm:px-6 pt-4">
						<Alert
							variant="destructive"
							className="border-2 border-red-500 dark:border-red-600 shadow-lg"
						>
							<AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
							<AlertDescription className="text-xs sm:text-sm font-semibold">
								⚠️ АНХААРУУЛГА: {maxViolations} удаа ноцтой дүрэм зөрчвөл шалгалт
								автоматаар дуусгана!
							</AlertDescription>
						</Alert>
					</div>
				)}

				{/* Info Stats */}
				<div className="px-4 sm:px-6 pt-3 pb-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
					<div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-lg px-3 py-2">
						<div className="font-semibold text-red-700 dark:text-red-400">
							🔴 Ноцтой дүрэм:{" "}
							<span className="text-base sm:text-lg">{criticalCount}</span>
						</div>
					</div>
					<div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 rounded-lg px-3 py-2">
						<div className="font-semibold text-orange-700 dark:text-orange-400">
							🟠 Дунд:{" "}
							<span className="text-base sm:text-lg">{mediumCount}</span>
						</div>
					</div>
					<div className="col-span-2 sm:col-span-1 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-lg px-3 py-2">
						<div className="font-semibold text-blue-700 dark:text-blue-400">
							📱 Горим:{" "}
							<span className="text-base sm:text-lg">
								{isMobile ? "Мобайл" : "Компьютер"}
							</span>
						</div>
					</div>
				</div>

				{/* Scrollable Rules Section */}
				<div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4">
					<div className="space-y-4 sm:space-y-5">
						{/* Monitoring Section */}
						<RulesSection
							title={isMobile ? "📱 Утасны хяналт" : "🖥️ Дэлгэцний хяналт"}
							rules={filteredRules.filter((r) => r.category === "monitoring")}
						/>

						{/* System Restrictions Section */}
						<RulesSection
							title="⚙️ Системийн хязгаарлалт"
							rules={filteredRules.filter((r) => r.category === "system")}
						/>

						{/* Behavioral Rules Section */}
						<RulesSection
							title="🛡️ Хандлага болон аюулгүй байдал"
							rules={filteredRules.filter((r) => r.category === "behavioral")}
						/>

						{/* Exam Guidelines Section */}
						<RulesSection
							title="✅ Шалгалтын зөвлөмж"
							rules={filteredRules.filter((r) => r.category === "guideline")}
						/>
					</div>
				</div>

				{/* Sticky Footer */}
				<DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-gray-50 dark:bg-gray-900/50 flex-row gap-2 sm:gap-3">
					<Button
						onClick={handleCancel}
						variant="outline"
						className="flex-1 sm:flex-none text-xs sm:text-sm"
						disabled={showMessage}
					>
						Цуцлах
					</Button>
					<Button
						onClick={handleStartExam}
						className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-lg"
						disabled={showMessage}
					>
						{showMessage ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
								Бэлдэж байна...
							</>
						) : (
							<>
								<Shield className="w-4 h-4 mr-2" />
								Шалгалт эхлүүлэх
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// Memoized RulesSection component
interface RulesSectionProps {
	title: string;
	rules: Rule[];
}

const RulesSection = React.memo(function RulesSection({
	title,
	rules,
}: RulesSectionProps) {
	if (rules.length === 0) return null;

	return (
		<div>
			<h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 flex items-center gap-2">
				{title}
			</h3>
			<div className="space-y-2">
				{rules.map((rule, index) => (
					<RuleItem key={`${rule.title}-${index}`} {...rule} />
				))}
			</div>
		</div>
	);
});

// Memoized RuleItem component
interface RuleItemProps {
	icon: LucideIcon;
	title: string;
	severity: "high" | "medium" | "low";
	description: string;
}

const RuleItem = React.memo(function RuleItem({
	icon: Icon,
	title,
	description,
	severity,
}: RuleItemProps) {
	const severityConfig = useMemo(
		() => ({
			high: {
				className:
					"text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-950/40 hover:border-red-400 dark:hover:border-red-700",
				badge: "🔴",
				label: "Ноцтой",
			},
			medium: {
				className:
					"text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800/50 hover:bg-orange-100 dark:hover:bg-orange-950/40 hover:border-orange-400 dark:hover:border-orange-700",
				badge: "🟠",
				label: "Дунд",
			},
			low: {
				className:
					"text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-950/40 hover:border-green-400 dark:hover:border-green-700",
				badge: "🟢",
				label: "Зөвлөмж",
			},
		}),
		[],
	);

	const config = severityConfig[severity];

	return (
		<div
			className={`group border rounded-lg p-3 sm:p-4 transition-all duration-200 ${config.className}`}
		>
			<div className="flex items-start gap-2 sm:gap-3">
				<div className="mt-0.5 shrink-0">
					<Icon className="w-4 h-4 sm:w-5 sm:h-5" />
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-start justify-between gap-2 mb-1">
						<h4 className="font-semibold text-xs sm:text-sm leading-tight">
							{title}
						</h4>
						<span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20 whitespace-nowrap shrink-0">
							{config.badge} {config.label}
						</span>
					</div>
					<p className="text-[11px] sm:text-xs leading-relaxed opacity-90">
						{description}
					</p>
				</div>
			</div>
		</div>
	);
});
