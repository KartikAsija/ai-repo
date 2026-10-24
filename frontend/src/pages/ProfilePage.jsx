import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  UserCheck, 
  Trash2, 
  Save, 
  Plus, 
  X, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft, 
  Briefcase, 
  GraduationCap, 
  Layers, 
  Tag, 
  PlusCircle, 
  FileText 
} from "lucide-react";
import { useLearner } from "../context/LearnerContext";
import { api } from "../api/client";
import CalendarDropdown from "../components/common/CalendarDropdown";
import SkillCompetencyCard from "../components/profile/SkillCompetencyCard";

const STEP_DEFINITIONS = [
  { num: 1, title: "Identity & Role", subtitle: "Basic info & target track" },
  { num: 2, title: "Schedule & Pacing", subtitle: "Time budget & target date" },
  { num: 3, title: "Skills Self-Rating", subtitle: "Competencies & proof links" },
  { num: 4, title: "Experience & Interests", subtitle: "Projects & domain tags" }
];

export default function ProfilePage({ setCurrentPage }) {
  const { activeLearner, activeLearnerId, roles, refreshAll, setActiveLearnerId } = useLearner();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    alias: "",
    current_role: "",
    education: "",
    target_role_id: "data_analyst",
    preferred_learning_style: "Hands-on Projects",
    available_hours_per_week: 10.0,
    target_completion_date: "2026-09-01",
    interests: [],
    skills: [],
    experiences: []
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [newInterest, setNewInterest] = useState("");
  const [targetRoleData, setTargetRoleData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Experience form modal / inline add
  const [newExp, setNewExp] = useState({ title: "", organization: "", duration: "", description: "" });
  const [showAddExp, setShowAddExp] = useState(false);

  // Sync active learner into form
  useEffect(() => {
    if (activeLearner) {
      setFormData({
        alias: activeLearner.alias || "",
        current_role: activeLearner.current_role || "",
        education: activeLearner.education || "",
        target_role_id: activeLearner.target_role_id || "data_analyst",
        preferred_learning_style: activeLearner.preferred_learning_style || "Hands-on Projects",
        available_hours_per_week: activeLearner.available_hours_per_week || 10.0,
        target_completion_date: activeLearner.target_completion_date || "",
        interests: activeLearner.interests || [],
        skills: activeLearner.skills ? [...activeLearner.skills] : [],
        experiences: activeLearner.experiences ? [...activeLearner.experiences] : []
      });
    }
  }, [activeLearner]);

  // Load target role framework to populate skills if needed
  useEffect(() => {
    if (formData.target_role_id) {
      api.getRole(formData.target_role_id)
        .then((role) => {
          setTargetRoleData(role);
          // If skills list is empty, initialize from role requirements
          setFormData((prev) => {
            if (prev.skills.length === 0 && role.requirements) {
              const initSkills = role.requirements.map((req) => ({
                skill_name: req.skill,
                current_level: 1,
                proof_url: ""
              }));
              return { ...prev, skills: initSkills };
            }
            return prev;
          });
        })
        .catch(console.error);
    }
  }, [formData.target_role_id]);

  const handleSkillLevelChange = useCallback((skillName, level) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.skill_name === skillName ? { ...s, current_level: level } : s))
    }));
  }, []);

  const handleProofUrlChange = useCallback((skillName, url) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.skill_name === skillName ? { ...s, proof_url: url } : s))
    }));
  }, []);

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (item) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== item)
    }));
  };

  const handleAddExperience = () => {
    if (!newExp.title.trim()) return;
    setFormData((prev) => ({
      ...prev,
      experiences: [...prev.experiences, { ...newExp }]
    }));
    setNewExp({ title: "", organization: "", duration: "", description: "" });
    setShowAddExp(false);
  };

  const handleRemoveExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, idx) => idx !== index)
    }));
  };

  // Step Validation logic
  const validateStep = (stepNumber) => {
    const errors = {};
    if (stepNumber === 1) {
      if (!formData.alias.trim()) {
        errors.alias = "Learner name or alias is required.";
      }
      if (!formData.target_role_id) {
        errors.target_role_id = "Please select a target role framework.";
      }
    }
    if (stepNumber === 2) {
      if (!formData.available_hours_per_week || formData.available_hours_per_week < 1) {
        errors.hours = "Please specify weekly study hours (at least 1 hour/week).";
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goToNextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(4, prev + 1));
    }
  };

  const goToStep = (sNum) => {
    // If going forward, validate current step
    if (sNum > step) {
      if (!validateStep(step)) return;
    }
    setStep(sNum);
  };

  const handleSave = async () => {
    if (!validateStep(1)) {
      setStep(1);
      return;
    }
    try {
      setIsSaving(true);
      if (activeLearnerId) {
        await api.updateLearner(activeLearnerId, formData);
      } else {
        const created = await api.createLearner(formData);
        setActiveLearnerId(created.id);
      }
      await refreshAll();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save learner: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!activeLearnerId) return;
    try {
      setIsDeleting(true);
      await api.deleteLearner(activeLearnerId);
      await refreshAll();
      setShowDeleteModal(false);
      setCurrentPage("home");
    } catch (err) {
      alert("Failed to delete learner: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Group skills by category if targetRoleData is loaded
  const categorizedSkills = useMemo(() => {
    if (!targetRoleData?.requirements) {
      return [{ category: "Core Competencies", skills: formData.skills }];
    }

    const categoryMap = {};
    formData.skills.forEach((skill) => {
      const match = targetRoleData.requirements.find(
        (r) => r.skill.toLowerCase() === skill.skill_name.toLowerCase()
      );
      const cat = match?.category || "Core Requirements";
      if (!categoryMap[cat]) categoryMap[cat] = [];
      categoryMap[cat].push(skill);
    });

    return Object.entries(categoryMap).map(([category, skills]) => ({
      category,
      skills
    }));
  }, [formData.skills, targetRoleData]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#29384F] pb-4">
        <div>
          <div className="text-[11px] font-semibold text-[#22C5E5] uppercase tracking-wider">
            Self-Assessment & Profiling
          </div>
          <h1 className="text-2xl font-bold text-[#F1F5F9] flex items-center gap-2 mt-0.5">
            <UserCheck className="w-6 h-6 text-[#22C5E5]" />
            <span>Learner Profile Studio</span>
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Capture role objectives, self-assessed competency baselines, proof artifacts, and weekly pacing.
          </p>
        </div>

        {/* Top Action Bar */}
        <div className="flex items-center gap-2.5">
          {activeLearnerId && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#F87171] hover:text-white bg-[#F87171]/10 hover:bg-[#F87171]/20 border border-[#F87171]/30 transition-all focus:ring-1 focus:ring-[#F87171]"
              title="Permanently remove learner profile"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete My Data</span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#22C5E5] hover:bg-[#06B6D4] text-[#0B1220] shadow-sm active:scale-95 transition-all focus:ring-2 focus:ring-[#22C5E5]"
          >
            {saveSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-[#0B1220]" />
            ) : (
              <Save className="w-4 h-4 text-[#0B1220]" />
            )}
            <span>{isSaving ? "Saving..." : saveSuccess ? "Saved Successfully" : "Save Profile"}</span>
          </button>
        </div>
      </div>

      {/* Desktop Horizontal Stepper */}
      <div className="hidden sm:grid grid-cols-4 gap-2">
        {STEP_DEFINITIONS.map((s) => {
          const isCurrent = step === s.num;
          const isDone = step > s.num;

          return (
            <button
              key={s.num}
              onClick={() => goToStep(s.num)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isCurrent
                  ? "bg-[#1A2940] border-[#22C5E5] shadow-glow-accent"
                  : isDone
                  ? "bg-[#141F32] border-[#34D399]/40 hover:border-[#34D399]"
                  : "bg-[#141F32] border-[#29384F] hover:border-[#3D506E] opacity-70"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                  isCurrent ? "text-[#22C5E5]" : isDone ? "text-[#34D399]" : "text-[#94A3B8]"
                }`}>
                  Step 0{s.num}
                </span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />}
              </div>
              <div className={`text-xs font-bold truncate ${isCurrent ? "text-[#F1F5F9]" : "text-[#F1F5F9]"}`}>
                {s.title}
              </div>
              <div className="text-[10px] text-[#94A3B8] truncate">{s.subtitle}</div>
            </button>
          );
        })}
      </div>

      {/* Mobile Compact Progress Bar */}
      <div className="sm:hidden bg-[#141F32] border border-[#29384F] rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#F1F5F9]">
            Step {step} of 4: <span className="text-[#22C5E5]">{STEP_DEFINITIONS[step - 1].title}</span>
          </span>
          <span className="text-[11px] text-[#94A3B8]">{Math.round((step / 4) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-[#0B1220] h-1.5 rounded-full overflow-hidden border border-[#29384F]">
          <div
            className="bg-[#22C5E5] h-full rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Identity & Target Role */}
      {step === 1 && (
        <div className="bg-[#141F32] border border-[#29384F] rounded-2xl p-6 sm:p-7 space-y-5 shadow-subtle">
          <div className="border-b border-[#29384F] pb-3">
            <h2 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#22C5E5]" />
              <span>Identity & Career Objective</span>
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Establish your target career framework to initialize standard competency benchmarks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] mb-1">
                Learner Name / Alias <span className="text-[#F87171]">*</span>
              </label>
              <input
                type="text"
                value={formData.alias}
                onChange={(e) => {
                  setFormData({ ...formData, alias: e.target.value });
                  if (validationErrors.alias) setValidationErrors({ ...validationErrors, alias: null });
                }}
                placeholder="e.g. Jordan Miller or Alex Chen"
                className={`w-full bg-[#0B1220] border rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none transition-colors ${
                  validationErrors.alias
                    ? "border-[#F87171] focus:ring-1 focus:ring-[#F87171]"
                    : "border-[#29384F] focus:border-[#22C5E5] focus:ring-1 focus:ring-[#22C5E5]"
                }`}
              />
              {validationErrors.alias && (
                <p className="text-[11px] text-[#F87171] mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{validationErrors.alias}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] mb-1">Current Role / Academic Status</label>
              <input
                type="text"
                value={formData.current_role}
                onChange={(e) => setFormData({ ...formData, current_role: e.target.value })}
                placeholder="e.g. Retail Store Operations Manager or CS Senior"
                className="w-full bg-[#0B1220] border border-[#29384F] focus:border-[#22C5E5] focus:ring-1 focus:ring-[#22C5E5] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] mb-1">Educational Background</label>
              <input
                type="text"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                placeholder="e.g. B.A. in Business Administration"
                className="w-full bg-[#0B1220] border border-[#29384F] focus:border-[#22C5E5] focus:ring-1 focus:ring-[#22C5E5] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] mb-1">
                Target Role Framework <span className="text-[#F87171]">*</span>
              </label>
              <select
                value={formData.target_role_id}
                onChange={(e) => setFormData({ ...formData, target_role_id: e.target.value, skills: [] })}
                className="w-full bg-[#0B1220] border border-[#29384F] focus:border-[#22C5E5] focus:ring-1 focus:ring-[#22C5E5] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none cursor-pointer"
              >
                {roles.map((r) => (
                  <option key={r.role_id} value={r.role_id} className="bg-[#141F32] text-[#F1F5F9]">
                    {r.title} — {r.source.split("(")[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Schedule & Preferences */}
      {step === 2 && (
        <div className="bg-[#141F32] border border-[#29384F] rounded-2xl p-6 sm:p-7 space-y-6 shadow-subtle">
          <div className="border-b border-[#29384F] pb-3">
            <h2 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#22C5E5]" />
              <span>Weekly Pacing & Learning Preferences</span>
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              The scheduler enforces this weekly commitment to ensure you are never overloaded.
            </p>
          </div>

          {/* Interactive Weekly Hours Slider */}
          <div className="p-4 rounded-xl bg-[#0B1220] border border-[#29384F] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-[#F1F5F9]">Weekly Study Commitment</label>
                <div className="text-[11px] text-[#94A3B8]">Strict schedule invariant: ∑ Task Hours ≤ Capacity</div>
              </div>
              <div className="text-lg font-extrabold text-[#22C5E5] bg-[#1A2940] px-3 py-1 rounded-lg border border-[#29384F]">
                {formData.available_hours_per_week} hrs/week
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={formData.available_hours_per_week}
              onChange={(e) => setFormData({ ...formData, available_hours_per_week: parseFloat(e.target.value) })}
              className="w-full h-2 bg-[#1A2940] rounded-lg appearance-none cursor-pointer accent-[#22C5E5]"
            />

            <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono">
              <button type="button" onClick={() => setFormData({ ...formData, available_hours_per_week: 3 })} className="hover:text-[#22C5E5]">
                3 hrs (Paced)
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, available_hours_per_week: 6 })} className="hover:text-[#22C5E5]">
                6 hrs (Jordan's Baseline)
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, available_hours_per_week: 15 })} className="hover:text-[#22C5E5]">
                15 hrs (Alex's Intensive)
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, available_hours_per_week: 30 })} className="hover:text-[#22C5E5]">
                30 hrs (Accelerated)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] mb-1">Preferred Learning Methodology</label>
              <select
                value={formData.preferred_learning_style}
                onChange={(e) => setFormData({ ...formData, preferred_learning_style: e.target.value })}
                className="w-full bg-[#0B1220] border border-[#29384F] focus:border-[#22C5E5] focus:ring-1 focus:ring-[#22C5E5] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none cursor-pointer"
              >
                <option value="Hands-on Projects" className="bg-[#141F32] text-[#F1F5F9]">Hands-on Projects & Guided Building</option>
                <option value="Documentation & Books" className="bg-[#141F32] text-[#F1F5F9]">Technical Documentation & Deep Reading</option>
                <option value="Video Tutorials" className="bg-[#141F32] text-[#F1F5F9]">Video Courses & Interactive Labs</option>
                <option value="Mixed" className="bg-[#141F32] text-[#F1F5F9]">Multimodal Approach</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] mb-1">Target Completion Date</label>
              <CalendarDropdown
                value={formData.target_completion_date}
                onChange={(dateStr) => setFormData({ ...formData, target_completion_date: dateStr })}
                placeholder="Choose target date..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Skills Self-Rating (Categorized) */}
      {step === 3 && (
        <div className="bg-[#141F32] border border-[#29384F] rounded-2xl p-6 sm:p-7 space-y-6 shadow-subtle">
          <div className="border-b border-[#29384F] pb-3">
            <h2 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#22C5E5]" />
              <span>Skill Competency Ratings & Evidence</span>
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Rate your current level (1 to 5). Skills backed by public links (GitHub, live demo, certificate) earn verified status.
            </p>
          </div>

          <div className="space-y-6">
            {categorizedSkills.map((group) => (
              <div key={group.category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#22C5E5] uppercase tracking-wider">
                    {group.category}
                  </span>
                  <div className="h-[1px] flex-1 bg-[#29384F]" />
                  <span className="text-[10px] text-[#94A3B8] font-mono">
                    {group.skills.length} Competencies
                  </span>
                </div>

                <div className="space-y-3">
                  {group.skills.map((skill) => (
                    <SkillCompetencyCard
                      key={skill.skill_name}
                      skill={skill}
                      onLevelChange={handleSkillLevelChange}
                      onProofChange={handleProofUrlChange}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Interests & Prior Experience */}
      {step === 4 && (
        <div className="bg-[#141F32] border border-[#29384F] rounded-2xl p-6 sm:p-7 space-y-6 shadow-subtle">
          {/* Interests section */}
          <div className="space-y-3">
            <div className="border-b border-[#29384F] pb-3">
              <h2 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#22C5E5]" />
                <span>Declared Interests (+15% Priority Bonus)</span>
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Tasks matching your declared interests receive a multiplier in the sequencing algorithm.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[36px]">
              {formData.interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#1A2940] text-[#22C5E5] border border-[#29384F]"
                >
                  <span>{interest}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(interest)}
                    className="hover:text-[#F87171] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add domain tag (e.g. Retail Analytics, CI/CD, SQL Optimization)..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddInterest();
                  }
                }}
                className="flex-1 bg-[#0B1220] border border-[#29384F] focus:border-[#22C5E5] focus:ring-1 focus:ring-[#22C5E5] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="px-4 py-2 bg-[#1A2940] hover:bg-[#1E3250] text-[#F1F5F9] border border-[#29384F] rounded-lg text-xs font-semibold transition-colors"
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Prior Experience & Projects */}
          <div className="space-y-3 pt-4 border-t border-[#29384F]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#22C5E5]" />
                  <span>Prior Work History & Projects</span>
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Documented background context for career pivot evaluation.
                </p>
              </div>

              {!showAddExp && (
                <button
                  type="button"
                  onClick={() => setShowAddExp(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1A2940] hover:bg-[#1E3250] text-[#22C5E5] border border-[#29384F]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Experience</span>
                </button>
              )}
            </div>

            {/* List of existing experiences */}
            <div className="space-y-2">
              {formData.experiences.length === 0 && !showAddExp && (
                <div className="text-xs text-[#94A3B8] italic p-4 bg-[#0B1220] rounded-xl border border-[#29384F] text-center">
                  No prior experience records attached. Click "Add Experience" to document previous roles or internships.
                </div>
              )}

              {formData.experiences.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#0B1220] border border-[#29384F] flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-[#F1F5F9] text-sm">{exp.title}</div>
                    <div className="text-[#22C5E5] font-medium text-xs">
                      {exp.organization} • <span className="text-[#94A3B8]">{exp.duration}</span>
                    </div>
                    {exp.description && (
                      <p className="text-[#94A3B8] text-[11px] leading-relaxed pt-1">{exp.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(idx)}
                    className="text-[#94A3B8] hover:text-[#F87171] p-1 rounded transition-colors shrink-0"
                    title="Remove experience"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Inline Add Experience Form */}
              {showAddExp && (
                <div className="p-4 rounded-xl bg-[#0B1220] border border-[#22C5E5]/40 space-y-3">
                  <div className="font-bold text-xs text-[#F1F5F9]">Add New Role or Project</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Title (e.g. Operations Lead)..."
                      value={newExp.title}
                      onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                      className="bg-[#141F32] border border-[#29384F] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Organization (e.g. Apex Corp)..."
                      value={newExp.organization}
                      onChange={(e) => setNewExp({ ...newExp, organization: e.target.value })}
                      className="bg-[#141F32] border border-[#29384F] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Duration (e.g. 2021 - 2024)..."
                      value={newExp.duration}
                      onChange={(e) => setNewExp({ ...newExp, duration: e.target.value })}
                      className="bg-[#141F32] border border-[#29384F] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
                    />
                  </div>
                  <textarea
                    placeholder="Short description of deliverables, responsibilities, or tools used..."
                    value={newExp.description}
                    onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                    rows={2}
                    className="w-full bg-[#141F32] border border-[#29384F] rounded-lg p-2 text-xs text-[#F1F5F9] focus:outline-none"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddExp(false)}
                      className="px-3 py-1 rounded-lg text-xs text-[#94A3B8] hover:text-[#F1F5F9]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddExperience}
                      className="px-3 py-1 bg-[#22C5E5] hover:bg-[#06B6D4] text-[#0B1220] rounded-lg text-xs font-bold"
                    >
                      Save Entry
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Stepper Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-[#29384F]">
        <button
          onClick={() => setStep((prev) => Math.max(1, prev - 1))}
          disabled={step === 1}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1A2940] hover:bg-[#1E3250] disabled:opacity-40 text-[#94A3B8] hover:text-[#F1F5F9] border border-[#29384F] rounded-lg text-xs font-semibold transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Step</span>
        </button>

        {step < 4 ? (
          <button
            onClick={goToNextStep}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#22C5E5] hover:bg-[#06B6D4] text-[#0B1220] rounded-lg text-xs font-bold shadow-sm transition-all focus:ring-2 focus:ring-[#22C5E5]"
          >
            <span>Next: {STEP_DEFINITIONS[step].title}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              handleSave().then(() => setCurrentPage("comparison"));
            }}
            className="flex items-center gap-2 px-5 py-2 bg-[#22C5E5] hover:bg-[#06B6D4] text-[#0B1220] font-bold rounded-lg text-xs shadow-sm transition-all focus:ring-2 focus:ring-[#22C5E5]"
          >
            <span>Save & View Role Comparison</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal Dialog */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-[#0B1220]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#141F32] border border-[#29384F] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-elevated">
            <div className="flex items-center gap-3 text-[#F87171]">
              <div className="w-10 h-10 rounded-xl bg-[#F87171]/10 border border-[#F87171]/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#F87171]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F1F5F9]">Permanently Delete Learner?</h3>
                <p className="text-xs text-[#94A3B8]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-[#F1F5F9]">{formData.alias || "this profile"}</strong> and all associated competency ratings, roadmaps, and logged hours from the SQLite database?
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-[#1A2940] hover:bg-[#1E3250] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#29384F] rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-[#F87171] hover:bg-rose-600 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                {isDeleting ? "Deleting..." : "Yes, Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
