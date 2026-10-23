import React, { useState, useEffect, memo } from "react";
import { Star, ChevronDown, UploadCloud, ExternalLink, X, CheckCircle2 } from "lucide-react";

const RUBRIC_LABELS = {
  1: "Level 1 • Novice",
  2: "Level 2 • Advanced Beginner",
  3: "Level 3 • Competent (Job-Ready)",
  4: "Level 4 • Proficient",
  5: "Level 5 • Expert"
};

const EVIDENCE_TYPES = [
  { id: "github", label: "GitHub Code Repository", placeholder: "https://github.com/username/project-repo" },
  { id: "demo", label: "Live Deployed App / Demo", placeholder: "https://my-app.vercel.app" },
  { id: "dashboard", label: "Interactive BI Dashboard", placeholder: "https://app.powerbi.com/view?r=..." },
  { id: "certificate", label: "Professional Certificate", placeholder: "https://www.credly.com/badges/..." },
  { id: "portfolio", label: "Portfolio / Case Study", placeholder: "https://myportfolio.com/case-study" },
  { id: "file", label: "Uploaded Document / Artifact", placeholder: "Attach file below or paste link..." },
  { id: "other", label: "Other Verification Link", placeholder: "https://example.com/proof" }
];

function detectEvidenceType(url) {
  if (!url) return "github";
  const u = url.toLowerCase();
  if (u.includes("github.com")) return "github";
  if (u.includes("powerbi") || u.includes("tableau") || u.includes("looker")) return "dashboard";
  if (u.includes("credly") || u.includes("cert") || u.includes("coursera")) return "certificate";
  if (u.includes("vercel") || u.includes("netlify") || u.includes("render")) return "demo";
  if (u.includes("attachment") || u.includes("upload") || u.includes(".pdf")) return "file";
  return "other";
}

function SkillCompetencyCard({ skill, onLevelChange, onProofChange }) {
  const [hoverLevel, setHoverLevel] = useState(0);
  const [localLevel, setLocalLevel] = useState(skill.current_level || 1);

  // Synchronize localLevel if external skill prop updates
  useEffect(() => {
    if (skill.current_level && skill.current_level !== localLevel) {
      setLocalLevel(skill.current_level);
    }
  }, [skill.current_level]);

  const [evidenceType, setEvidenceType] = useState(() => detectEvidenceType(skill.proof_url));

  useEffect(() => {
    if (skill.proof_url) {
      setEvidenceType(detectEvidenceType(skill.proof_url));
    }
  }, [skill.proof_url]);

  const currentLevel = localLevel;
  const isVerified = Boolean(
    skill.proof_url &&
    (skill.proof_url.trim().startsWith("http") || skill.proof_url.trim().startsWith("file://"))
  );

  const activePreset = EVIDENCE_TYPES.find((t) => t.id === evidenceType) || EVIDENCE_TYPES[0];

  // Instantaneous 0ms star click handler with local optimistic state
  const handleStarClick = (lvl) => {
    setLocalLevel(lvl);
    setHoverLevel(0);
    onLevelChange(skill.skill_name, lvl);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const sanitizedName = file.name.replace(/\s+/g, "-");
      const fileUrl = `https://uploads.local/artifacts/${sanitizedName}`;
      onProofChange(skill.skill_name, fileUrl);
      setEvidenceType("file");
    }
  };

  const displayLevel = hoverLevel || currentLevel;

  return (
    <div className="p-4 bg-[#111C33] border border-[#334155] hover:border-slate-500 rounded-xl space-y-3.5 transition-colors shadow-sm">
      {/* Top Row: Skill Name & Interactive Stars */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs sm:text-sm font-bold text-[#F8FAFC]">{skill.skill_name}</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#17243B] text-[#38BDF8] border border-[#334155]">
            Level {displayLevel}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isVerified
                ? "bg-emerald-950/40 text-emerald-400 border border-emerald-700/50"
                : "bg-amber-950/40 text-amber-300 border border-amber-700/50"
            }`}
          >
            {isVerified ? "Verified Proof" : "Unverified"}
          </span>
        </div>

        {/* 5-Star Instant Rating Interface with Level on the Left */}
        <div className="flex items-center gap-2">
          {/* Level text description on the left of stars */}
          <span className="text-[11px] font-semibold text-[#CBD5E1] bg-[#17243B] px-2.5 py-1 rounded-md border border-[#334155] whitespace-nowrap min-w-[155px] text-center">
            {RUBRIC_LABELS[displayLevel]}
          </span>

          <div
            className="flex items-center gap-0.5 bg-[#0B1220] px-2 py-1 rounded-lg border border-[#334155]"
            onMouseLeave={() => setHoverLevel(0)}
          >
            {[1, 2, 3, 4, 5].map((lvl) => {
              const isFilled = displayLevel >= lvl;

              return (
                <button
                  key={lvl}
                  type="button"
                  onMouseEnter={() => setHoverLevel(lvl)}
                  onClick={() => handleStarClick(lvl)}
                  className="p-1 rounded cursor-pointer select-none focus:outline-none hover:opacity-100 active:scale-95"
                  title={`Rate as Level ${lvl}: ${RUBRIC_LABELS[lvl]}`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      isFilled
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-600 hover:text-amber-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Uploading & Proof Step with Dropdown Option */}
      <div className="pt-2.5 border-t border-[#334155] space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#CBD5E1] font-medium flex items-center gap-1.5">
            <UploadCloud className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Upload or Attach Verification Proof</span>
          </span>
          {isVerified ? (
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Verified Artifact
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 italic">
              Optional: adds verified badge
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Dropdown Step Option */}
          <div className="relative">
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#334155] hover:border-slate-500 rounded-lg px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] appearance-none pr-7 cursor-pointer"
            >
              {EVIDENCE_TYPES.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-[#111C33] text-[#F8FAFC]">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#CBD5E1] absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* Input & Upload File Controls */}
          <div className="sm:col-span-2 flex items-center gap-1.5">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={activePreset.placeholder}
                value={skill.proof_url || ""}
                onChange={(e) => onProofChange(skill.skill_name, e.target.value)}
                className="w-full bg-[#0B1220] border border-[#334155] focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8] rounded-lg pl-2.5 pr-7 py-1.5 text-xs text-[#F8FAFC] focus:outline-none"
              />
              {skill.proof_url && (
                <button
                  type="button"
                  onClick={() => onProofChange(skill.skill_name, "")}
                  className="absolute right-2 top-2 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Clear proof link"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Direct Local File Upload Button */}
            <label
              className="px-2.5 py-1.5 bg-[#17243B] hover:bg-[#1f3150] text-[#F8FAFC] rounded-lg border border-[#334155] text-xs font-semibold cursor-pointer flex items-center gap-1 shrink-0 transition-colors focus-within:ring-2 focus-within:ring-[#38BDF8]"
              title="Upload a local certificate, report, or screenshot"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span className="hidden sm:inline">Upload</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            {/* Open link button if verified */}
            {isVerified && (
              <a
                href={skill.proof_url}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 bg-[#17243B] hover:bg-[#1f3150] text-[#38BDF8] rounded-lg border border-[#334155] shrink-0 transition-colors focus:ring-2 focus:ring-[#38BDF8]"
                title="Open external proof artifact"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// React.memo with comparison prevents unneeded re-rendering of sibling cards
export default memo(SkillCompetencyCard, (prev, next) => {
  return (
    prev.skill.skill_name === next.skill.skill_name &&
    prev.skill.current_level === next.skill.current_level &&
    prev.skill.proof_url === next.skill.proof_url &&
    prev.onLevelChange === next.onLevelChange &&
    prev.onProofChange === next.onProofChange
  );
});
