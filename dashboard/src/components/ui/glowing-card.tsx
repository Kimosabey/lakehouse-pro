"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const GlowingCard = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <motion.div
            className={cn(
                "relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-b from-slate-950/50 to-slate-900/50 p-6 backdrop-blur-sm",
                className
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent -translate-x-full animate-shimmer" />
            {children}
        </motion.div>
    );
};

export const MovingBorder = ({
    children,
    duration = 2000,
    className,
    containerClassName,
    borderClassName,
    as: Component = "div",
}: {
    children: React.ReactNode;
    duration?: number;
    className?: string;
    containerClassName?: string;
    borderClassName?: string;
    as?: any;
}) => {
    return (
        <Component
            className={cn(
                "relative rounded-lg overflow-hidden p-[1px] bg-transparent",
                containerClassName
            )}
        >
            <div
                className={cn(
                    "absolute inset-0",
                    "bg-[conic-gradient(from_0deg,transparent,transparent_70%,#3b82f6_70%,#3b82f6_100%)]",
                    borderClassName
                )}
                style={{
                    animation: `spin ${duration}ms linear infinite`,
                }}
            />
            <div
                className={cn(
                    "relative bg-slate-950 rounded-lg",
                    className
                )}
            >
                {children}
            </div>
        </Component>
    );
};
