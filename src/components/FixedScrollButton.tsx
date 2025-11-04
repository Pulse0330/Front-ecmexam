"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";

type Props = {
  scrollThreshold?: number;
};

export default function FixedScrollButton({ scrollThreshold = 300 }: Props) {
  const [isAtTop, setIsAtTop] = useState(true);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsAtTop(scrollY < scrollThreshold);
    };

    const handleResize = () => {
      const scrollable =
        document.documentElement.scrollHeight > window.innerHeight + 50;
      setIsScrollable(scrollable);
    };

    handleResize();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [scrollThreshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  // Хэрэв хуудас scroll хийх боломжгүй бол товчийг харуулахгүй
  if (!isScrollable) return null;

  return (
    <Button
      variant="default"
      size="icon"
      onClick={isAtTop ? scrollToBottom : scrollToTop}
      className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
    >
      {isAtTop ? (
        <ArrowDown className="h-5 w-5" />
      ) : (
        <ArrowUp className="h-5 w-5" />
      )}
    </Button>
  );
}
