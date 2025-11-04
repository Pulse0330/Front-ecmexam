// (auth)/sign/page.tsx
"use client";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { SignForm } from "./form";
import LoginAnimation from "../animation";

export default function SignPage() {
  return (
    <main
      className="relative min-h-screen grid lg:grid-cols-2 
        bg-linear-to-br from-slate-50 via-white to-slate-100
        dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 
        transition-colors duration-500 overflow-hidden"
    >
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <AnimatedThemeToggler
          className="p-3 rounded-full backdrop-blur-sm border transition-all duration-300
            bg-white/80 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700
            text-gray-900 dark:text-yellow-400 hover:bg-white dark:hover:bg-gray-700/50
            hover:scale-110 shadow-sm"
        />
      </div>

      {/* Left Side - Animation */}
      <div className="hidden lg:flex items-center justify-center p-12 relative overflow-hidden">
        <LoginAnimation />
      </div>

      {/* Right Side - Sign Form */}
      <div className="flex items-center justify-center p-6">
        <SignForm />
      </div>
    </main>
  );
}
