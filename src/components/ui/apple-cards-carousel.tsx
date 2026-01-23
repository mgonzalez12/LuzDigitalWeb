"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type Card = {
  category: string;
  title: string;
  src: string;
  content?: React.ReactNode;
  href?: string;
};

export const Card = React.memo(
  ({ card, index }: { card: Card; index: number }) => {
    const [hovered, setHovered] = useState(false);

    const cardContent = (
      <motion.div
        key={card.src}
        className="relative group/card block"
        style={{
          transformStyle: "preserve-3d",
          transform: hovered ? "perspective(1000px) rotateY(5deg) rotateX(-5deg)" : "perspective(1000px) rotateY(0deg) rotateX(0deg)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className={cn(
            "relative h-[500px] w-[350px] rounded-3xl overflow-hidden cursor-pointer",
            "bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-50/50 to-transparent dark:from-neutral-900/50" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(120,119,198,0.3),rgba(255,255,255,0))] opacity-0 group-hover/card:opacity-100 transition-opacity" />
          
          <div className="absolute inset-0">
            <img
              src={card.src}
              alt={card.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="mb-2">
              <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                {card.category}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {card.title}
            </h3>
          </div>

          {card.content && (
            <div className="absolute inset-0 p-8 overflow-y-auto">
              {card.content}
            </div>
          )}
        </div>
      </motion.div>
    );

    if (card.href) {
      return (
        <Link href={card.href} className="block">
          {cardContent}
        </Link>
      );
    }

    return cardContent;
  }
);

Card.displayName = "Card";

export const Carousel = ({ items }: { items: React.ReactNode[] }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    const ref = carouselRef.current;
    if (ref) {
      ref.addEventListener("scroll", checkScrollability);
      return () => ref.removeEventListener("scroll", checkScrollability);
    }
  }, [items]);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.7;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full">
      <div
        ref={carouselRef}
        className="flex gap-4 overflow-x-auto scroll-smooth py-10 px-4"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {items.map((item, index) => (
          <div key={index} className="flex-shrink-0">
            {item}
          </div>
        ))}
      </div>

      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          aria-label="Scroll left"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          aria-label="Scroll right"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
