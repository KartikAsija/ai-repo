import React from "react";
import { ShieldAlert } from "lucide-react";

export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-950/40 border-b border-amber-500/30 text-amber-200 text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>Ethical Guidance Notice:</strong> This tool provides guidance, not guarantees. It cannot promise employment, and its assessments are estimates, not measures of your worth or potential.
        </span>
      </div>
    </div>
  );
}

