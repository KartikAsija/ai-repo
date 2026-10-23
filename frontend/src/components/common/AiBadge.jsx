import React from "react";
import { Sparkles } from "lucide-react";

export default function AiBadge({ text = "AI-Generated Explanation (Informational)" }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-950/60 text-purple-300 border border-purple-500/30">
      <Sparkles className="w-2.5 h-2.5 text-purple-400" />
      <span>{text}</span>
    </span>
  );
}

