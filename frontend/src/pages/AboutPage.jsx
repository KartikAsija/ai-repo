import React from "react";
import { Info, ShieldAlert, BookOpen, Calculator, Award, AlertTriangle, FileCode, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="border-b border-[#29384F] pb-4">
        <div className="text-[11px] font-semibold text-[#22C5E5] uppercase tracking-wider">
          Transparency, Taxonomy & Limitations
        </div>
        <h1 className="text-2xl font-bold text-[#F1F5F9] flex items-center gap-2 mt-0.5">
          <Info className="w-6 h-6 text-[#22C5E5]" />
          <span>System Methodology & Ethical Principles</span>
        </h1>
        <p className="text-xs text-[#94A3B8] mt-1">
          Detailed documentation of benchmark sources, deterministic scoring formulas, capacity packing, and ethical boundaries.
        </p>
      </div>

      {/* Ethical Safeguard Banner */}
      <div className="rounded-2xl p-5 bg-[#141F32] border border-[#FBBF24]/40 text-[#94A3B8] space-y-2.5 shadow-subtle">
        <div className="flex items-center gap-2 font-bold text-sm text-[#FBBF24]">
          <ShieldAlert className="w-5 h-5 text-[#FBBF24] shrink-0" />
          <span>Persistent Ethical Safeguard & Guidance Notice</span>
        </div>
        <p className="text-xs leading-relaxed text-[#F1F5F9]/90 font-medium">
          "This tool provides guidance, not guarantees. It cannot promise employment, and its assessments are estimates, not measures of your worth or potential."
        </p>
        <p className="text-[11px] text-[#94A3B8] leading-relaxed">
          The system strictly forbids words such as "guaranteed" or "you will get hired". Scores represent <strong className="text-[#F1F5F9]">"readiness against this framework"</strong>, never personal capability, intelligence, or peer rankings.
        </p>
      </div>

      {/* Cited Industry Framework Sources */}
      <div className="bg-[#141F32] border border-[#29384F] rounded-2xl p-6 space-y-4 shadow-subtle">
        <h2 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
          <Award className="w-5 h-5 text-[#22C5E5]" />
          <span>Cited Taxonomy & Benchmark Sources</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-[#1A2940]/60 rounded-xl border border-[#29384F] space-y-2">
            <div className="font-bold text-[#F1F5F9] text-sm">Data Analyst</div>
            <div className="text-[#22C5E5] font-mono text-[11px]">O*NET 15-2051.01 & SFIA 8</div>
            <p className="text-[#94A3B8] text-[11px] leading-relaxed">
              Derived from the U.S. Bureau of Labor Statistics O*NET Business Intelligence Analysts taxonomy and SFIA 8 Business Intelligence (BINT Levels 2-3).
            </p>
          </div>

          <div className="p-4 bg-[#1A2940]/60 rounded-xl border border-[#29384F] space-y-2">
            <div className="font-bold text-[#F1F5F9] text-sm">Junior Full-Stack Dev</div>
            <div className="text-[#22C5E5] font-mono text-[11px]">SFIA 8 & UK DDaT Standard</div>
            <p className="text-[#94A3B8] text-[11px] leading-relaxed">
              Based on SFIA Software Development (PROG Level 2-3), Systems Design (DESN), and the UK Government Digital & Technology Framework for Junior Engineers.
            </p>
          </div>

          <div className="p-4 bg-[#1A2940]/60 rounded-xl border border-[#29384F] space-y-2">
            <div className="font-bold text-[#F1F5F9] text-sm">Cloud/DevOps Associate</div>
            <div className="text-[#22C5E5] font-mono text-[11px]">O*NET 15-1251.00 & Cloud Associate</div>
            <p className="text-[#94A3B8] text-[11px] leading-relaxed">
              Built using O*NET Computer Systems Engineers standards combined with AWS Certified SysOps & Solutions Architect Associate competencies.
            </p>
          </div>
        </div>
      </div>

      {/* Deterministic Scoring Formulas */}
      <div className="bg-[#141F32] border border-[#29384F] rounded-2xl p-6 space-y-5 shadow-subtle">
        <h2 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#22C5E5]" />
          <span>Mathematical Scoring & Scheduling Formulas</span>
        </h2>

        <div className="space-y-4 text-xs text-[#94A3B8]">
          <div className="p-4 bg-[#1A2940]/50 border border-[#29384F] rounded-xl space-y-1.5">
            <span className="font-bold text-[#22C5E5] block text-xs">1. Individual Skill Gap Formula</span>
            <code className="text-[#F1F5F9] font-mono text-[11px] block bg-[#0B1220] border border-[#29384F] p-2.5 rounded-lg">
              gap = max(0, required_level - current_level)
            </code>
            <p className="text-[11px] text-[#94A3B8]">
              Evaluates strictly between 0 and 5. Over-level skills (e.g. current 5 when required is 3) yield a gap of 0 and are labeled as Strengths.
            </p>
          </div>

          <div className="p-4 bg-[#1A2940]/50 border border-[#29384F] rounded-xl space-y-1.5">
            <span className="font-bold text-[#22C5E5] block text-xs">2. Priority Score Formula</span>
            <code className="text-[#F1F5F9] font-mono text-[11px] block bg-[#0B1220] border border-[#29384F] p-2.5 rounded-lg">
              priority = gap × importance_weight × prerequisite_factor × interest_bonus
            </code>
            <ul className="text-[11px] text-[#94A3B8] list-disc list-inside space-y-1 pt-1">
              <li><strong className="text-[#F1F5F9]">Importance weight:</strong> Critical = 3.0, High = 2.0, Medium = 1.0, Nice-to-have = 0.5</li>
              <li><strong className="text-[#F1F5F9]">Prerequisite factor:</strong> Foundational skills carry a 1.3× multiplier</li>
              <li><strong className="text-[#F1F5F9]">Interest bonus:</strong> Declared learner interests receive a 1.15× priority multiplier</li>
            </ul>
          </div>

          <div className="p-4 bg-[#1A2940]/50 border border-[#29384F] rounded-xl space-y-1.5">
            <span className="font-bold text-[#22C5E5] block text-xs">3. Overall Framework Readiness (%)</span>
            <code className="text-[#F1F5F9] font-mono text-[11px] block bg-[#0B1220] border border-[#29384F] p-2.5 rounded-lg">
              Readiness = [ ∑ (min(current_level, required_level) × weight) / ∑ (required_level × weight) ] × 100%
            </code>
            <p className="text-[11px] text-[#94A3B8]">
              Bounded between 0.0% and 100.0%. Reflects total progress against the target benchmark.
            </p>
          </div>

          <div className="p-4 bg-[#1A2940]/50 border border-[#29384F] rounded-xl space-y-1.5">
            <span className="font-bold text-[#22C5E5] block text-xs">4. Weekly Capacity Packing Invariant</span>
            <code className="text-[#F1F5F9] font-mono text-[11px] block bg-[#0B1220] border border-[#29384F] p-2.5 rounded-lg">
              ∀ week k: ∑ (task.est_hours) ≤ available_hours_per_week
            </code>
            <p className="text-[11px] text-[#94A3B8]">
              Tasks are packed into 4 stages sequentially. Tasks exceeding weekly capacity are decomposed into milestone parts so no single week is overloaded.
            </p>
          </div>
        </div>
      </div>

      {/* Limitations */}
      <div className="bg-[#141F32] border border-[#29384F] rounded-2xl p-6 space-y-3 shadow-subtle">
        <h2 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#FBBF24]" />
          <span>Known Limitations</span>
        </h2>
        <ul className="text-xs text-[#94A3B8] space-y-2 list-disc list-inside">
          <li>
            <strong className="text-[#F1F5F9]">Self-reported Bias:</strong> Initial assessments depend on self-rating. Skills without verifiable URLs remain tagged as "unverified" until backed by public evidence.
          </li>
          <li>
            <strong className="text-[#F1F5F9]">Local Labor Market Fluctuations:</strong> Industry frameworks describe generalized global baselines. Specific employers may emphasize proprietary stacks or domain knowledge not captured in a generic taxonomy.
          </li>
          <li>
            <strong className="text-[#F1F5F9]">Non-Evaluative AI Phrasing:</strong> LLMs (if enabled via .env) are used strictly for formatting text and narrative explanations. All scoring, gap sizes, and schedules are 100% deterministic code.
          </li>
        </ul>
      </div>
    </div>
  );
}
