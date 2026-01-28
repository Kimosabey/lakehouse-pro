"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const AnimatedNumber = ({
    value,
    className,
    decimals = 1,
    suffix = "",
}: {
    value: number;
    className?: string;
    decimals?: number;
    suffix?: string;
}) => {
    const [displayValue, setDisplayValue] = useState(0);
    const prevValueRef = useRef(0);

    useEffect(() => {
        const startValue = prevValueRef.current;
        const endValue = value;
        const duration = 500; // ms
        const startTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            const currentValue = startValue + (endValue - startValue) * easeProgress;

            setDisplayValue(currentValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                prevValueRef.current = endValue;
            }
        };

        requestAnimationFrame(animate);
    }, [value]);

    return (
        <span className={cn("tabular-nums", className)}>
            {displayValue.toFixed(decimals)}{suffix}
        </span>
    );
};
