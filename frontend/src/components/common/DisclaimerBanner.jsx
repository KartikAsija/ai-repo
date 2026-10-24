import React, { useState } from "react";
import { Info, X } from "lucide-react";

export default function DisclaimerBanner() {
  const [minimized, setMinimized] = useState(false);

  if (minimized) {
    return (
      <div className="bg-[#161B22] border-b border-[#30363D] text-[11px] text-[#8B949E] px-4 py-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#58A6FF]" />
          <span>Guidance Notice: Assessments are readiness estimates against public standards, not job guarantees.</span>
        </span>
        <button
          onClick={() => setMinimized(false)}
          className="text-[#58A6FF] hover:underline text-[10px] font-medium"
        >
          Expand
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#161B22] border-b border-[#30363D] text-xs text-[#8B949E] py-1.5 px-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-[#58A6FF] shrink-0" />
          <p className="text-[11px] sm:text-xs text-[#8B949E]">
            <strong className="text-[#F0F6FC] font-medium">Objective Guidance Notice:</strong> Assessments reflect rubric alignment with public industry standards (SFIA 8 & O*NET). This tool offers structured planning estimates, not employment guarantees.
          </p>
        </div>
        <button
          onClick={() => setMinimized(true)}
          className="text-[#8B949E] hover:text-[#F0F6FC] p-0.5 rounded hover:bg-[#21262D] transition-colors shrink-0"
          title="Minimize notice"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
