"use client";

import {
	AlertTriangle,
	Ban,
	Camera,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Clock,
	Copy,
	Eye,
	FileText,
	Globe,
	Keyboard,
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
	X,
	Zap,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

// ============================================
// TYPES
// ============================================

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

interface RuleCategory {
	id: string;
	title: string;
	icon: LucideIcon;
	rules: Rule[];
	requiresAcknowledgment: boolean;
}

// ============================================
// CONSTANTS
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
		icon: Shield,
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
		icon: Clock,
		title: "Цагийг зөв удирдах",
		severity: "low",
		description: "Үлдсэн хугацааг хянаж, асуултуудыг төлөвлөн хариулна уу",
	},
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function ExamRulesDialog({
	open,
	onOpenChange,
	onConfirm,
	isMobile = false,
}: ExamRulesDialogProps) {
	const [currentStep, setCurrentStep] = useState(0);
	const [acknowledgments, setAcknowledgments] = useState<
		Record<string, boolean>
	>({});
	const [showMessage, setShowMessage] = useState(false);

	// Memoized categories
	const categories: RuleCategory[] = useMemo(() => {
		const monitoringRules = isMobile
			? MOBILE_MONITORING_RULES
			: DESKTOP_MONITORING_RULES;

		return [
			{
				id: "monitoring",
				title: isMobile ? "Утасны хяналт" : "Дэлгэцний хяналт",
				icon: Monitor,
				rules: monitoringRules,
				requiresAcknowledgment: true,
			},
			{
				id: "system",
				title: "Системийн хязгаарлалт",
				icon: Ban,
				rules: SYSTEM_RESTRICTIONS,
				requiresAcknowledgment: true,
			},
			{
				id: "behavioral",
				title: "Хандлага болон аюулгүй байдал",
				icon: Users,
				rules: BEHAVIORAL_RULES,
				requiresAcknowledgment: true,
			},
			{
				id: "guidelines",
				title: "Шалгалтын зөвлөмж",
				icon: CheckCircle2,
				rules: EXAM_GUIDELINES,
				requiresAcknowledgment: false,
			},
		];
	}, [isMobile]);

	const currentCategory = useMemo(
		() => categories[currentStep],
		[categories, currentStep],
	);
	const isLastStep = currentStep === categories.length - 1;
	const canProceed =
		!currentCategory.requiresAcknowledgment ||
		acknowledgments[currentCategory.id];

	const handleNext = useCallback(() => {
		if (isLastStep) {
			setShowMessage(true);
			setTimeout(() => {
				onConfirm();
				onOpenChange(false);
				setShowMessage(false);
				setCurrentStep(0);
				setAcknowledgments({});
			}, 1800);
		} else {
			setCurrentStep((prev) => prev + 1);
		}
	}, [isLastStep, onConfirm, onOpenChange]);

	const handlePrevious = useCallback(() => {
		setCurrentStep((prev) => Math.max(0, prev - 1));
	}, []);

	const handleCancel = useCallback(() => {
		onOpenChange(false);
		setTimeout(() => {
			setCurrentStep(0);
			setAcknowledgments({});
		}, 300);
	}, [onOpenChange]);

	const toggleAcknowledgment = useCallback((categoryId: string) => {
		setAcknowledgments((prev) => ({
			...prev,
			[categoryId]: !prev[categoryId],
		}));
	}, []);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[90vw] max-w-3xl h-[85vh] p-0 flex flex-col overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
				{/* Header - Clean gradient */}
				<div className="flex-none px-3 pt-3 pb-2 sm:px-4 sm:pt-4 sm:pb-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-1.5 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50">
							Таньд амжилт хүсье! 🎓
						</DialogTitle>
						<DialogDescription className="text-xs sm:text-sm font-medium mt-0.5 text-slate-600 dark:text-slate-400">
							Шалгалтын дүрэм журмыг анхааралтай уншаад эхлүүлнэ үү
						</DialogDescription>
					</DialogHeader>

					{/* Progress bar - Minimal & elegant */}
					<div className="mt-2 flex items-center gap-1.5">
						{categories.map((category, index) => (
							<div
								key={category.id}
								className={`flex-1 h-1 rounded-full transition-all duration-500 ${
									index <= currentStep
										? "bg-slate-900 dark:bg-slate-100"
										: "bg-slate-200 dark:bg-slate-700"
								}`}
							/>
						))}
					</div>

					<div className="mt-1 text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
						Алхам {currentStep + 1} / {categories.length}
					</div>

					{/* Alert - High contrast */}
					{currentStep === 0 && (
						<Alert className="mt-2 border py-1.5 px-2 border-red-200 dark:border-red-800">
							<AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
							<AlertDescription className="font-semibold text-[10px] sm:text-xs text-red-900 dark:text-red-100">
								⚠️ АНХААРУУЛГА: 3 удаа ноцтой дүрэм зөрчвөл шалгалт автоматаар
								дуусгана!
							</AlertDescription>
						</Alert>
					)}
				</div>

				{/* Content - Clean white/dark background */}
				<div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-3 bg-white dark:bg-slate-900 flex flex-col justify-between ">
					<div>
						<div className="mb-2">
							<h3 className="text-sm sm:text-base font-bold flex items-center gap-1.5 text-slate-900 dark:text-slate-50">
								<currentCategory.icon className="w-4 h-4 sm:w-5 sm:h-5" />
								{currentCategory.title}
							</h3>
						</div>{" "}
						<div className="space-y-2">
							{currentCategory.rules.map((rule) => (
								<RuleItem key={rule.title} {...rule} />
							))}
						</div>
					</div>
					{/* Acknowledgment */}
					{currentCategory.requiresAcknowledgment && (
						<div className="mt-3 p-2 sm:p-2.5 border-2 rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50">
							<div className="flex flex-row justify-between items-start gap-2">
								<Checkbox
									id={`ack-${currentCategory.id}`}
									checked={acknowledgments[currentCategory.id] || false}
									onCheckedChange={() =>
										toggleAcknowledgment(currentCategory.id)
									}
									className="mt-0.5 h-4 w-4 border-slate-400 dark:border-slate-500 data-[state=checked]:bg-slate-900 dark:data-[state=checked]:bg-slate-100 data-[state=checked]:text-white dark:data-[state=checked]:text-slate-900"
								/>
								<label
									htmlFor={`ack-${currentCategory.id}`}
									className="text-[10px] sm:text-xs font-medium leading-snug cursor-pointer text-slate-700 dark:text-slate-300"
								>
									Би <strong>{currentCategory.title}</strong> талаарх бүх
									дүрмийг уншсан бөгөөд эдгээрийг дагаж мөрдөхөө амлаж байна.
									Дүрэм зөрчвөл шалгалт дуусгагдаж болохыг ойлгож байна.
								</label>
							</div>
						</div>
					)}
				</div>

				{/* Footer - Minimal gradient */}
				<DialogFooter className="flex-none flex flex-row items-center justify-between gap-2 p-2.5 sm:p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
					<Button
						variant="outline"
						onClick={handleCancel}
						disabled={showMessage}
						className="text-[10px] sm:text-xs font-medium h-8 px-2.5 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
					>
						<X className="w-3.5 h-3.5 mr-1" />
						Цуцлах
					</Button>

					<div className="flex gap-1.5">
						{currentStep > 0 && (
							<Button
								variant="outline"
								onClick={handlePrevious}
								disabled={showMessage}
								className="text-[10px] sm:text-xs font-medium h-8 px-2.5 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
							>
								<ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
								Өмнөх
							</Button>
						)}

						<Button
							onClick={handleNext}
							disabled={!canProceed || showMessage}
							className="text-[10px] sm:text-xs font-medium h-8 px-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
						>
							{showMessage ? (
								"Бэлдэж байна..."
							) : isLastStep ? (
								<>
									<CheckCircle2 className="w-3.5 h-3.5 mr-1" />
									Шалгалт эхлүүлэх
								</>
							) : (
								<>
									Дараах
									<ChevronRight className="w-3.5 h-3.5 ml-0.5" />
								</>
							)}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ============================================
// RULE ITEM - Optimized with memo
// ============================================

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
	// Severity colors - Clean & accessible
	const severityConfig = useMemo(() => {
		switch (severity) {
			case "high":
				return {
					bg: "border-slate-400 dark:border-slate-500 ",
					icon: "text-red-600 dark:text-red-400",
					badge: "bg-red-600 dark:bg-red-500 text-white",
					label: "Ноцтой",
				};
			case "medium":
				return {
					bg: "border-slate-400 dark:border-slate-500 ",
					icon: "text-amber-600 dark:text-amber-400",
					badge: "bg-amber-600 dark:bg-amber-500 text-white",
					label: "Дунд",
				};
			case "low":
				return {
					bg: "border-slate-400 dark:border-slate-500 ",
					icon: "text-emerald-600 dark:text-emerald-400",
					badge: "bg-emerald-600 dark:bg-emerald-500 text-white",
					label: "Зөвлөмж",
				};
		}
	}, [severity]);

	return (
		<div
			className={`p-2 sm:p-2.5 rounded-lg border transition-all duration-200 ${severityConfig.bg}`}
		>
			<div className="flex items-start gap-2">
				<div className={`flex-shrink-0 ${severityConfig.icon}`}>
					<Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 flex-wrap">
						<h4 className="text-[10px] sm:text-xs leading-tight font-semibold text-slate-900 dark:text-slate-50">
							{title}
						</h4>
						<span
							className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-bold`}
						></span>
					</div>
					<p className="text-[10px] sm:text-xs leading-snug mt-0.5 text-slate-600 dark:text-slate-400">
						{description}
					</p>
				</div>
			</div>
		</div>
	);
});
