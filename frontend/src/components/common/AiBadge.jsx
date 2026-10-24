import React from "react";
import { Sparkles } from "lucide-react";

export default function AiBadge({ text = "AI-Assisted Guidance (Informational)" }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#1A2940] text-[#22C5E5] border border-[#29384F]">
      <Sparkles className="w-3 h-3 text-[#22C5E5]" />
      <span>{text}</span>
    </span>
  );
}

