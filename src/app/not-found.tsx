"use client";

import Link from "next/link";
import { Home, AlertTriangle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500 p-4 relative overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-yellow-300 dark:bg-yellow-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      {/* Main Icon instead of 404 */}
      <AlertTriangle className="w-48 h-48 text-red-500 dark:text-red-400 animate-bounce" />

      {/* Message */}
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-4 text-center">
        Хуудас олдсонгүй
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 text-center max-w-md">
        Уучлаарай, таны хайж буй хуудас олдсонгүй эсвэл устгагдсан байна.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Link
          href="/home"
          className="group inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r hover:to--700 dark:from-blue-500 dark:to-blue-500 dark:hover:from-blue-600 dark:hover:to-blue-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <Home className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          Нүүр хуудас руу буцах
        </Link>

        <button
          onClick={() => window.history.back()}
          className="group inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-full shadow-lg hover:shadow-xl border-2 border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-400 transform hover:scale-105 transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Буцах
        </button>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
