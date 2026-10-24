import React from "react";

export default function MetricCard({ title, value, subtitle, icon: Icon, badge }) {
  return (
    <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-4 relative overflow-hidden transition-colors hover:border-[#484F58]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#8B949E] uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="w-6 h-6 rounded-md bg-[#21262D] border border-[#30363D] flex items-center justify-center text-[#8B949E]">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
      <div className="mt-2 text-2xl font-semibold text-[#F0F6FC] tracking-tight">{value}</div>
      <div className="mt-1 flex items-center justify-between">
        {subtitle && <div className="text-[11px] text-[#8B949E] truncate">{subtitle}</div>}
        {badge && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#21262D] text-[#8B949E] border border-[#30363D]">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
