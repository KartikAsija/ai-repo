# 🧭 Your AI Career Navigator

> **Ethical Guidance Notice:** This tool provides guidance, not guarantees. It cannot promise employment, and its assessments are estimates, not measures of your worth or potential.

An intelligent, deterministic career navigation and readiness system that bridges the gap between learner profiles and industry standards (SFIA 8, O*NET, and UK DDaT).

---

## 🚀 Key Features

1. **Role Gap Analysis & Deterministic Scoring**:
   - Compares self-assessed and evidence-backed learner competencies against standardized industry role profiles (Data Analyst, Junior Full-Stack Developer, Cloud/DevOps Associate).
   - Mathematical gap formulas: `gap = max(0, required_level - current_level)`.
   - Weighted readiness percentage bounded between 0% and 100%.

2. **Staged Weekly Roadmapping & Capacity Packing**:
   - Sequential 4-stage roadmap with weekly hours invariant: `∀ week k: ∑ task.est_hours ≤ available_hours_per_week`.
   - Tasks decompose automatically when exceeding weekly availability.

3. **Dynamic Replanning Engine**:
   - Re-evaluates schedules on demand when hours change or target career roles pivot.
   - Computes audited diffs showing rescheduled, newly added, or removed tasks.

4. **Bidirectional Traceability Matrix**:
   - Forward Lineage: Requirement & Gap → Remedial Tasks → Evidence Deliverable.
   - Reverse Lineage: Evidence Deliverable → Task → Addressed Requirement.

5. **Profile Customization & Evidence Tracking**:
   - Interactive gold star rating interface (1-5 scale) with levels displayed.
   - Evidence dropdowns for repository URLs, certifications, or code samples.
   - Smart calendar dropdown with dynamic preset dates.

6. **Automated 2-Learner Walkthrough Demo**:
   - Pre-configured two-learner simulation:
     - **Jordan Miller** (Career Changer, 6h/wk → 3h/wk hours reduction replan).
     - **Alex Chen** (CS Graduate, 15h/wk → Role Pivot to Cloud/DevOps replan).

---

## 🛠️ Tech Stack

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, SQLite, Pydantic v2, Uvicorn
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React icons
- **Theme**: Professional accessible dark theme (`#0B1220` background, `#111C33` cards, `#0F766E` buttons, `#38BDF8` cyan accents)

---

## 🏃 Getting Started (Localhost)

### Option 1: Single Unified Command (Recommended)

Run both frontend and backend on `http://localhost:8001` with one click:

```bash
# Windows
run.bat

# Or using Python directly
python run.py
```

### Option 2: Run Separately (Development Mode)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and automatically proxies API requests to `http://127.0.0.1:8001`.

---

## 🧪 Testing

Run automated backend unit and integration tests:

```bash
cd backend
pytest -v
```

---

## 📄 License & Transparency

All scoring and scheduling logic is 100% deterministic code. Large Language Models (if enabled) are strictly reserved for narrative phrasing and explanations.
