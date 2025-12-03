"use client";

import { useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

type TooltipVariant = "default" | "legendary" | "prism";

interface TooltipProps {
  isVisible: boolean;
  mousePos: { x: number; y: number };
  children: React.ReactNode;
  width?: "sm" | "md" | "lg";
  variant?: TooltipVariant;
}

const widthClasses = {
  sm: "w-64",
  md: "w-72",
  lg: "w-80",
} as const;

const variantClasses = {
  default: "border-zinc-700",
  legendary: "border-amber-500/50",
  prism: "border-purple-500/50",
} as const;

const OFFSET = 12;
const VIEWPORT_PADDING = 8;

export const Tooltip = ({
  isVisible,
  mousePos,
  children,
  width = "md",
  variant = "default",
}: TooltipProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (!isVisible) return;

    const calculatePosition = () => {
      let x = mousePos.x + OFFSET;
      let y = mousePos.y + OFFSET;

      if (tooltipRef.current) {
        const rect = tooltipRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Flip horizontally if tooltip would overflow right edge
        if (x + rect.width > viewportWidth - VIEWPORT_PADDING) {
          x = mousePos.x - rect.width - OFFSET;
        }

        // Flip vertically if tooltip would overflow bottom edge
        if (y + rect.height > viewportHeight - VIEWPORT_PADDING) {
          y = mousePos.y - rect.height - OFFSET;
        }

        // Ensure tooltip doesn't go off the left or top edge
        x = Math.max(VIEWPORT_PADDING, x);
        y = Math.max(VIEWPORT_PADDING, y);
      }

      return { x, y };
    };

    // Calculate position after render when ref is available
    const newPosition = calculatePosition();
    setPosition(newPosition);
  }, [isVisible, mousePos]);

  if (!isVisible || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={tooltipRef}
      className={`fixed z-50 ${widthClasses[width]} pointer-events-none`}
      style={{ left: position.x, top: position.y }}
    >
      <div
        className={`bg-zinc-950 text-zinc-50 p-3 rounded-lg shadow-xl border ${variantClasses[variant]}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};

interface TooltipTitleProps {
  children: React.ReactNode;
}

export const TooltipTitle = ({ children }: TooltipTitleProps) => (
  <div className="font-semibold text-sm mb-2 text-amber-400">{children}</div>
);

interface TooltipContentProps {
  children: React.ReactNode;
}

export const TooltipContent = ({ children }: TooltipContentProps) => (
  <div className="text-xs text-zinc-400 whitespace-pre-line">{children}</div>
);
