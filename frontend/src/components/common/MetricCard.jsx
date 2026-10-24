import React from "react";

export default function MetricCard({ title, value, subtitle, icon: Icon, color = "cyan", badge }) {
  const accentClasses = {
    cyan: {
      border: "border-t-[#22C5E5]",
      icon: "text-[#22C5E5] bg-[#22C5E5]/10 border-[#22C5E5]/20",
    },
    emerald: {
      border: "border-t-[#34D399]",
      icon: "text-[#34D399] bg-[#34D399]/10 border-[#34D399]/20",
    },
    amber: {
      border: "border-t-[#FBBF24]",
      icon: "text-[#FBBF24] bg-[#FBBF24]/10 border-[#FBBF24]/20",
    },
    rose: {
      border: "border-t-[#F87171]",
      icon: "text-[#F87171] bg-[#F87171]/10 border-[#F87171]/20",
    },
    slate: {
      border: "border-t-[#94A3B8]",
      icon: "text-[#94A3B8] bg-[#94A3B8]/10 border-[#94A3B8]/20",
    }
  };

  const scheme = accentClasses[color] || accentClasses.cyan;

  return (
    <div className={`rounded-xl border border-[#29384F] border-t-2 ${scheme.border} bg-[#141F32] p-4 relative overflow-hidden shadow-subtle hover:border-[#3D506E] transition-all`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${scheme.icon}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
      <div className="mt-2 text-2xl font-bold text-[#F1F5F9] tracking-tight">{value}</div>
      <div className="mt-1 flex items-center justify-between">
        {subtitle && <div className="text-[11px] text-[#94A3B8] truncate">{subtitle}</div>}
        {badge && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#1A2940] text-[#F1F5F9] border border-[#29384F]">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

