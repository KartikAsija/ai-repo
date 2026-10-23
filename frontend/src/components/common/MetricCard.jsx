import React from "react";

export default function MetricCard({ title, value, subtitle, icon: Icon, color = "cyan" }) {
  const accentColors = {
    cyan: "text-[#38BDF8] border-l-[#38BDF8]",
    indigo: "text-[#38BDF8] border-l-[#38BDF8]",
    teal: "text-teal-400 border-l-teal-400",
    emerald: "text-emerald-400 border-l-emerald-400",
    amber: "text-amber-400 border-l-amber-400",
    blue: "text-[#38BDF8] border-l-[#38BDF8]",
    rose: "text-rose-400 border-l-rose-400"
  };

  const activeAccent = accentColors[color] || accentColors.cyan;

  return (
    <div className={`rounded-xl border border-[#334155] border-l-4 ${activeAccent.split(" ")[1]} bg-[#111C33] p-4 relative overflow-hidden shadow-sm`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider">{title}</span>
        {Icon && <Icon className={`w-4 h-4 ${activeAccent.split(" ")[0]} opacity-80`} />}
      </div>
      <div className="mt-2 text-2xl font-bold text-[#F8FAFC]">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-[#CBD5E1]">{subtitle}</div>}
    </div>
  );
}
