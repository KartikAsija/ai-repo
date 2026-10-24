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
    <div className="p-4 bg-[#141F32] border border-[#29384F] hover:border-[#3D506E] rounded-xl space-y-3.5 transition-all shadow-subtle">
      {/* Top Row: Skill Name & Interactive Stars */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs sm:text-sm font-bold text-[#F1F5F9]">{skill.skill_name}</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1A2940] text-[#22C5E5] border border-[#29384F]">
            Level {displayLevel}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isVerified
                ? "bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30"
                : "bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30"
            }`}
          >
            {isVerified ? "Verified Proof" : "Unverified"}
          </span>
        </div>

        {/* 5-Star Instant Rating Interface with Level on the Left */}
        <div className="flex items-center gap-2">
          {/* Level text description on the left of stars */}
          <span className="text-[11px] font-semibold text-[#94A3B8] bg-[#1A2940] px-2.5 py-1 rounded-md border border-[#29384F] whitespace-nowrap min-w-[155px] text-center">
            {RUBRIC_LABELS[displayLevel]}
          </span>

          <div
            className="flex items-center gap-0.5 bg-[#0B1220] px-2 py-1 rounded-lg border border-[#29384F]"
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
                    className={`w-5 h-5 transition-colors ${
                      isFilled
                        ? "text-[#FBBF24] fill-[#FBBF24]"
                        : "text-[#29384F] hover:text-[#FBBF24]/60"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Uploading & Proof Step with Dropdown Option */}
      <div className="pt-2.5 border-t border-[#29384F] space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#94A3B8] font-medium flex items-center gap-1.5">
            <UploadCloud className="w-3.5 h-3.5 text-[#22C5E5]" />
            <span>Upload or Attach Verification Proof</span>
          </span>
          {isVerified ? (
            <span className="text-[10px] text-[#34D399] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Verified Artifact
            </span>
          ) : (
            <span className="text-[10px] text-[#94A3B8] italic">
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
              className="w-full bg-[#0B1220] border border-[#29384F] hover:border-[#3D506E] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none focus:ring-1 focus:ring-[#22C5E5] focus:border-[#22C5E5] appearance-none pr-7 cursor-pointer"
            >
              {EVIDENCE_TYPES.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-[#141F32] text-[#F1F5F9]">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* Input & Upload File Controls */}
          <div className="sm:col-span-2 flex items-center gap-1.5">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={activePreset.placeholder}
                value={skill.proof_url || ""}
                onChange={(e) => onProofChange(skill.skill_name, e.target.value)}
                className="w-full bg-[#0B1220] border border-[#29384F] focus:border-[#22C5E5] focus:ring-1 focus:ring-[#22C5E5] rounded-lg pl-2.5 pr-7 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
              />
              {skill.proof_url && (
                <button
                  type="button"
                  onClick={() => onProofChange(skill.skill_name, "")}
                  className="absolute right-2 top-2 text-[#94A3B8] hover:text-[#F87171] transition-colors"
                  title="Clear proof link"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Direct Local File Upload Button */}
            <label
              className="px-2.5 py-1.5 bg-[#1A2940] hover:bg-[#1E3250] text-[#F1F5F9] rounded-lg border border-[#29384F] text-xs font-semibold cursor-pointer flex items-center gap-1 shrink-0 transition-colors focus-within:ring-1 focus-within:ring-[#22C5E5]"
              title="Upload a local certificate, report, or screenshot"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#22C5E5]" />
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
                className="p-1.5 bg-[#1A2940] hover:bg-[#1E3250] text-[#22C5E5] rounded-lg border border-[#29384F] shrink-0 transition-colors focus:ring-1 focus:ring-[#22C5E5]"
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
