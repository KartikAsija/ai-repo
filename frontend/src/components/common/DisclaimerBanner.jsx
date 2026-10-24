import React, { useState } from "react";
import { ShieldCheck, X } from "lucide-react";

export default function DisclaimerBanner() {
  const [minimized, setMinimized] = useState(false);

  if (minimized) {
    return (
      <div className="bg-[#141F32] border-b border-[#29384F] text-[11px] text-[#94A3B8] px-4 py-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#22C5E5]" />
          <span>Ethical Notice: Estimates represent rubric alignment, not employment guarantees.</span>
        </span>
        <button
          onClick={() => setMinimized(false)}
          className="text-[#22C5E5] hover:underline text-[10px] font-medium"
        >
          Expand
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#141F32] border-b border-[#29384F] text-xs text-[#94A3B8] py-2 px-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-md bg-[#FBBF24]/10 border border-[#FBBF24]/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FBBF24]" />
          </div>
          <p className="text-[11px] leading-tight sm:text-xs">
            <strong className="text-[#F1F5F9] font-medium">Ethical Guidance Notice:</strong> This platform provides objective framework guidance, not employment guarantees. Assessments are readiness estimates against public industry rubrics (SFIA & O*NET), not measures of personal worth.
          </p>
        </div>
        <button
          onClick={() => setMinimized(true)}
          className="text-[#94A3B8] hover:text-[#F1F5F9] p-1 rounded hover:bg-[#1A2940] transition-colors shrink-0"
          title="Minimize notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}


