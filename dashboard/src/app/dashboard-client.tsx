"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Activity,
    Thermometer,
    Droplets,
    Zap,
    Database,
    Clock,
    TrendingUp,
    Server,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WavyBackground } from "@/components/ui/wavy-background";
import type { TelemetryEvent, Stats } from "@/lib/db";

interface DashboardClientProps {
    initialEvents: TelemetryEvent[];
    initialStats: Stats;
}

export function DashboardClient({
    initialEvents,
    initialStats,
}: DashboardClientProps) {
    const [events, setEvents] = useState(initialEvents);
    const [stats, setStats] = useState(initialStats);
    const [mounted, setMounted] = useState(false);

    // Fix hydration - only show after mount
    useEffect(() => {
        setMounted(true);
    }, []);

    const formatEventTime = (timestamp: string) => {
        if (!mounted) return '00:00:00';
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    // Real-time polling
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch("/api/telemetry");
                if (res.ok) {
                    const data = await res.json();
                    setEvents(data.events);
                    setStats(data.stats);
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // Dynamic calculations from real data
    const dynamicStats = {
        avgTemp: stats.avg_temp || 0,
        avgHum: stats.avg_hum || 0,
        maxTemp: stats.max_temp || 0,
        totalEvents: stats.total_events || 0,
        liveEventCount: events.length,
        lastUpdate: mounted ? new Date().toLocaleTimeString() : '--:--:--'
    };

    if (!mounted) {
        return <div className="min-h-screen bg-[#F7F7F7]" />;
    }

    return (
        <div className="min-h-screen bg-[#F7F7F7] text-[#393E46] relative overflow-x-hidden">

            {/* Wavy Background Animation */}
            <WavyBackground
                className="max-w-7xl mx-auto pb-20"
                backgroundFill="#F7F7F7"
                colors={[
                    "#929AAB", // Blue-Grey Cream
                    "#393E46", // Dark Charcoal (Accent)
                    "#EEEEEE", // Light Grey
                    "#929AAB", // Repeat for effect
                    "#F7F7F7"  // Fade to white
                ]}
                waveWidth={50}
                blur={10}
                speed="slow"
                waveOpacity={0.3}
            >
                {/* Content wrapper must match wave structure */}
                <div className="relative z-10 w-full h-full px-3 sm:px-6 lg:px-8 py-4 lg:py-8">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            className="space-y-4 sm:space-y-6 lg:space-y-8"
                        >
                            {/* Header - Responsive */}
                            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 sm:p-3 bg-[#393E46] rounded-xl shadow-lg">
                                        <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-[#F7F7F7]" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#393E46]">
                                            Lakehouse Pro
                                        </h1>
                                        <p className="text-[#929AAB] text-xs sm:text-sm font-semibold mt-0.5">
                                            Real-time telemetry monitoring
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
                                    <Badge className="bg-[#393E46] text-[#F7F7F7] border-0 px-3 sm:px-4 py-1.5 sm:py-2 shadow-md text-xs sm:text-sm flex-1 lg:flex-none justify-center">
                                        <span className="relative flex h-2 w-2 mr-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F7F7F7] opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F7F7F7]"></span>
                                        </span>
                                        Live
                                    </Badge>
                                    <Badge className="bg-[#EEEEEE] text-[#393E46] border-2 border-[#929AAB]/30 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">
                                        <Clock className="w-3 h-3 mr-1" />
                                        2s
                                    </Badge>
                                </div>
                            </header>

                            {/* Stats Grid - Fully Responsive */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                                {/* Avg Temperature */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white border-2 border-[#EEEEEE] hover:border-[#929AAB] shadow-lg hover:shadow-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="flex flex-col gap-2 sm:gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 sm:p-2 lg:p-3 bg-[#393E46] rounded-lg sm:rounded-xl shadow-md">
                                                <Thermometer className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#F7F7F7]" />
                                            </div>
                                            <span className="text-[#929AAB] text-[10px] sm:text-xs font-bold uppercase tracking-wider hidden sm:inline">
                                                Avg Temp
                                            </span>
                                        </div>
                                        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#393E46]">
                                            {dynamicStats.avgTemp.toFixed(1)}°C
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Avg Humidity */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white border-2 border-[#EEEEEE] hover:border-[#929AAB] shadow-lg hover:shadow-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="flex flex-col gap-2 sm:gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 sm:p-2 lg:p-3 bg-[#929AAB] rounded-lg sm:rounded-xl shadow-md">
                                                <Droplets className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#F7F7F7]" />
                                            </div>
                                            <span className="text-[#929AAB] text-[10px] sm:text-xs font-bold uppercase tracking-wider hidden sm:inline">
                                                Avg Hum
                                            </span>
                                        </div>
                                        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#393E46]">
                                            {dynamicStats.avgHum.toFixed(1)}%
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Max Temperature */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white border-2 border-[#EEEEEE] hover:border-[#929AAB] shadow-lg hover:shadow-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="flex flex-col gap-2 sm:gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 sm:p-2 lg:p-3 bg-[#393E46] rounded-lg sm:rounded-xl shadow-md">
                                                <Zap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#F7F7F7]" />
                                            </div>
                                            <span className="text-[#929AAB] text-[10px] sm:text-xs font-bold uppercase tracking-wider hidden sm:inline">
                                                Max Peak
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#393E46]">
                                                {dynamicStats.maxTemp.toFixed(1)}°C
                                            </span>
                                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-[#929AAB]" />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Total Events */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-white border-2 border-[#EEEEEE] hover:border-[#929AAB] shadow-lg hover:shadow-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="flex flex-col gap-2 sm:gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 sm:p-2 lg:p-3 bg-[#929AAB] rounded-lg sm:rounded-xl shadow-md">
                                                <Database className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#F7F7F7]" />
                                            </div>
                                            <span className="text-[#929AAB] text-[10px] sm:text-xs font-bold uppercase tracking-wider hidden sm:inline">
                                                Total
                                            </span>
                                        </div>
                                        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#393E46]">
                                            {dynamicStats.totalEvents.toLocaleString()}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Main Content - Responsive Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                                {/* Events Stream */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="lg:col-span-2"
                                >
                                    <div className="bg-white/95 border-2 border-[#EEEEEE] shadow-2xl rounded-xl sm:rounded-2xl p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="p-1.5 sm:p-2 bg-[#393E46] rounded-lg shadow-md">
                                                    <Server className="w-4 h-4 sm:w-5 sm:h-5 text-[#F7F7F7]" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg sm:text-xl font-bold text-[#393E46]">Live Event Stream</h3>
                                                    <p className="text-xs sm:text-sm text-[#929AAB] font-semibold">Real-time telemetry</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-[#393E46] text-[#F7F7F7] border-0 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-bold shadow-md self-start sm:self-auto">
                                                {dynamicStats.liveEventCount} events
                                            </Badge>
                                        </div>

                                        <div className="space-y-2 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-1 sm:pr-2">
                                            {events.map((event, idx) => (
                                                <div
                                                    key={`${event.device_id}-${event.timestamp}-${idx}`}
                                                    className="bg-[#F7F7F7] hover:bg-[#EEEEEE] border-2 border-[#EEEEEE] hover:border-[#929AAB] rounded-lg sm:rounded-xl p-2 sm:p-4 transition-all duration-300"
                                                >
                                                    <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center text-xs sm:text-sm">
                                                        <div className="col-span-3">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3 text-[#929AAB] hidden sm:block" />
                                                                <span className="font-mono text-[#393E46] font-bold">
                                                                    {formatEventTime(event.timestamp)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="col-span-4">
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-[#929AAB] animate-pulse" />
                                                                <span className="font-mono text-[#929AAB] font-semibold truncate">
                                                                    {event.device_id.substring(0, 10)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="col-span-3">
                                                            <div className="flex items-center gap-1">
                                                                <Thermometer className="w-3 h-3 text-[#393E46] hidden sm:block" />
                                                                <span className="font-bold text-[#393E46]">
                                                                    {event.temperature.toFixed(1)}°
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <div className="flex items-center gap-1">
                                                                <Droplets className="w-3 h-3 text-[#929AAB] hidden sm:block" />
                                                                <span className="font-bold text-[#393E46]">
                                                                    {event.humidity.toFixed(0)}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* System Status - Responsive */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="bg-white/95 border-2 border-[#EEEEEE] shadow-2xl rounded-xl sm:rounded-2xl p-4 sm:p-6"
                                >
                                    <h3 className="text-base sm:text-lg font-bold text-[#393E46] mb-1 sm:mb-2">System Status</h3>
                                    <p className="text-xs sm:text-sm text-[#929AAB] font-semibold mb-4 sm:mb-6">Pipeline health</p>

                                    <div className="space-y-2 sm:space-y-3">
                                        <StatusItem label="Ingestion" status="healthy" icon={<Server className="w-3 h-3 sm:w-4 sm:h-4" />} />
                                        <StatusItem label="Kafka" status="healthy" icon={<Activity className="w-3 h-3 sm:w-4 sm:h-4" />} />
                                        <StatusItem label="ClickHouse" status="healthy" icon={<Database className="w-3 h-3 sm:w-4 sm:h-4" />} />
                                        <StatusItem label="Processor" status="healthy" icon={<Zap className="w-3 h-3 sm:w-4 sm:h-4" />} />
                                    </div>

                                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-[#EEEEEE]">
                                        <h4 className="text-xs sm:text-sm font-bold text-[#393E46] mb-2 sm:mb-3">Architecture</h4>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            <Badge className="bg-[#393E46] text-[#F7F7F7] border-0 font-bold text-xs shadow-md">
                                                Medallion
                                            </Badge>
                                            <Badge className="bg-[#929AAB] text-[#F7F7F7] border-0 font-bold text-xs shadow-md">
                                                Bronze→Silver→Gold
                                            </Badge>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </WavyBackground>
        </div>
    );
}

function StatusItem({
    label,
    status,
    icon,
}: {
    label: string;
    status: "healthy" | "warning" | "error";
    icon: React.ReactNode;
}) {
    const statusColors = {
        healthy: "text-[#393E46] bg-[#F7F7F7] border-[#929AAB]",
        warning: "text-[#393E46] bg-[#EEEEEE] border-[#929AAB]",
        error: "text-[#393E46] bg-[#EEEEEE] border-[#929AAB]",
    };

    return (
        <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-[#F7F7F7] border-2 border-[#EEEEEE] hover:border-[#929AAB] transition-all duration-300">
            <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-[#929AAB]">{icon}</div>
                <span className="text-xs sm:text-sm font-bold text-[#393E46]">{label}</span>
            </div>
            <div className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border-2 ${statusColors[status]}`}>
                {status}
            </div>
        </div>
    );
}
