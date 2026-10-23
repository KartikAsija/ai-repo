# Methodology & Limitations: Your AI Career Navigator

## 1. Taxonomic Basis & Citations

The Career Navigator benchmark engine models skill requirements using recognized industry standards:

1. **Data Analyst (`data_analyst.json`)**
   - *Sources*: U.S. Department of Labor O*NET Online (15-2051.01 - Business Intelligence Analysts; 15-2051.00 - Data Scientists) and the Skills Framework for the Information Age (SFIA 8, Business Intelligence BINT Levels 2-3).
   - *Focus*: Relational SQL querying, data manipulation in Python/Pandas, star schema modeling, interactive dashboarding, and stakeholder storytelling.

2. **Junior Full-Stack Developer (`junior_fullstack_dev.json`)**
   - *Sources*: SFIA 8 (Software Development PROG Levels 2-3, Systems Design DESN Level 2) and UK Government Digital, Data and Technology (DDaT) Junior Developer Framework.
   - *Focus*: Modern JavaScript/TypeScript, React state architecture, RESTful API engineering with FastAPI/Node, ORM relational modeling, test-driven development (Pytest/Vitest), and containerization.

3. **Cloud/DevOps Associate (`cloud_devops_associate.json`)**
   - *Sources*: O*NET Online (15-1251.00 - Computer Systems Engineers/DevOps) and AWS/Azure Certified Solutions Architect & SysOps Associate Curricula.
   - *Focus*: Linux system administration, VPC and subnet networking, Infrastructure as Code with Terraform, CI/CD pipeline automation, and production observability.

---

## 2. Mathematical Scoring Formulas

### Skill Gap
$$\text{gap}_i = \max(0, \text{required\_level}_i - \text{current\_level}_i)$$

### Priority Score
$$\text{priority}_i = \text{gap}_i \times \text{importance\_weight}_i \times \text{prerequisite\_factor}_i \times \text{interest\_bonus}_i$$
- **Importance Weights**: Critical (3.0), High (2.0), Medium (1.0), Nice-to-have (0.5)
- **Prerequisite Multiplier**: 1.3× for foundational skills
- **Interest Multiplier**: 1.15× if matching learner's declared interests

### Framework Alignment (Readiness)
$$\text{Readiness} = \frac{\sum_{i=1}^N \min(\text{current\_level}_i, \text{required\_level}_i) \times \text{weight}_i}{\sum_{i=1}^N \text{required\_level}_i \times \text{weight}_i} \times 100\%$$

---

## 3. Staged Scheduling & Packing Invariants

Tasks are packed sequentially across 4 distinct stages:
1. **Stage 1 (Foundations)**: Basic syntax, environment setup, and prerequisite concepts. Concludes with a Self-Assessment Checkpoint.
2. **Stage 2 (Core Skills)**: Framework-specific workflows, testing, and intermediate implementations. Concludes with a Core Competency Audit.
3. **Stage 3 (Applied Projects)**: Multi-requirement capstone implementations producing public repositories. Concludes with an Artifact Verification Milestone.
4. **Stage 4 (Employability)**: Impact-driven CV bullet formulation, technical defense prep, and portfolio curation. Concludes with a Job-Readiness Audit.

**Mathematical Invariant**:
For every scheduled week $k$:
$$\sum_{t \in \text{week}_k} \text{task.est\_hours}_t \le \text{available\_hours\_per\_week}$$

---

## 4. Limitations & Ethical Safeguards

1. **Estimates, Not Guarantees**:
   The application provides directional guidance based on public rubrics. It does not promise hiring, job offers, or placement.
2. **No Ranking**:
   Learners are evaluated strictly against the target framework rubric, never ranked against other learners.
3. **Self-Rating Calibration**:
   Self-assessed skills without external proof URLs are transparently marked as "unverified" in the user interface.
4. **Deterministic Analysis**:
   All gap scoring, prioritization, and task schedules are calculated deterministically. Any optional LLM phrasing is segregated and labeled with an AI tag.
5. **Data Sovereignty**:
   Learners retain complete ownership of their data and can delete their records permanently via cascading database deletion.

