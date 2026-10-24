import React from "react";
import { Sparkles } from "lucide-react";

export default function AiBadge({ text = "AI-Assisted Guidance (Informational)" }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-[#21262D] text-[#58A6FF] border border-[#30363D]">
      <Sparkles className="w-3 h-3 text-[#58A6FF]" />
      <span>{text}</span>
    </span>
  );
}

