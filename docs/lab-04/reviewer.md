# Lab 4 — Peer Review Record

**Author:** Chanya Poolketkij — GitHub: @chanya06  
**Peer reviewer:** Peer Reviewer — GitHub: @lmaybelgracel  
**Partner reviewed by author:** Phatthidawadi — GitHub: @phatthidawadi  

---

## 1. Pull Requests I Authored (Reviewed by Partner @lmaybelgracel)

| PR # | Branch | Scope / Description | Reviewer Verdict | Status |
| :--- | :--- | :--- | :--- | :--- |
| [PR #72](https://github.com/chanya06/toktickit/pull/72) | `feature/29-spec-and-tests` | Sprint 4 Engineering Contract (`specification.md`, `tests.md`, `ui-spec.md`, `api-spec.md`) | Approved & Merged | Merged |
| [PR #81](https://github.com/chanya06/toktickit/pull/81) | `feature/30-db-schema-actions-taken` | Prisma Schema for `ActionTaken`, Database Migration & Seed Data | Approved & Merged | Merged |
| [PR #82](https://github.com/chanya06/toktickit/pull/82) | `feature/31-actions-taken-api` | Actions Taken REST API, Authorization & Concurrency | Approved & Merged | Merged |
| [PR #83](https://github.com/chanya06/toktickit/pull/83) | `feature/32-actions-taken-ui` | Actions Taken UI on Ticket Detail Screen & Responsive Cards | Approved & Merged | Merged |
| [PR #84](https://github.com/chanya06/toktickit/pull/84) | `feature/33-dashboard-api` | Role Dashboards REST API (Requester & IT Staff Metrics) | Approved & Merged | Merged |
| [PR #85](https://github.com/chanya06/toktickit/pull/85) | `feature/34-dashboard-ui` | Role Dashboards UI (Metric Cards, Recent Lists, Quick Actions & Drill-down) | Approved & Merged | Merged |
| [PR #86](https://github.com/chanya06/toktickit/pull/86) | `feature/35-ticket-workflow-hardening` | Ticket Workflow Hardening, Resolution Gate & Stale Update Handling | Approved & Merged | Merged |
| [PR #87](https://github.com/chanya06/toktickit/pull/87) | `feature/36-qa-regression-and-deliverables` | QA Automated Tests, Regression Suite, Screenshots & Final PDF Deliverable | Approved & Merged | Merged |
| [PR #88](https://github.com/chanya06/toktickit/pull/88) | `lab4-staging` | Release Sprint 4 (Lab 4): TokTickIT Actions Taken, Dashboards, and Final Regression | Pending Review | Open |

---

## 2. Pull Requests I Reviewed for Partner (@phatthidawadi)

| PR # | Branch | Scope / Description | Reviewer Verdict | Status |
| :--- | :--- | :--- | :--- | :--- |
| [phatthidawadi/toktickit#72](https://github.com/phatthidawadi/toktickit/pull/72) | `feature/26-doc-spec-tests` | Sprint 4 Engineering Contract Documentation (Issue #26) | Approved (Round 1 & 2: Changes Requested, Round 3: Approved) | Merged |
| [phatthidawadi/toktickit#73](https://github.com/phatthidawadi/toktickit/pull/73) | `feature/27-actions-taken-foundation` | Actions Taken Foundation — Migration, Model, Seed, APIs, AuthZ, Tests (Issue #27) | Approved with comments | Merged |
| [phatthidawadi/toktickit#74](https://github.com/phatthidawadi/toktickit/pull/74) | `feature/28-actions-taken-ui` | Actions Taken UI — Ticket Detail Section (Issue #28) | Approved with comments | Merged |
| [phatthidawadi/toktickit#75](https://github.com/phatthidawadi/toktickit/pull/75) | `feature/29-ticket-workflow-and-resolution` | Ticket Workflow and Resolution Gate (Issue #29) | Approved (Round 1: Changes Requested, Round 2: Approved) | Merged |
| [phatthidawadi/toktickit#76](https://github.com/phatthidawadi/toktickit/pull/76) | `feature/30-role-based-dashboards` | Role-Based Dashboards — API, UI Components, and Default Landing Navigation (Issue #30) | Approved (Round 1: Changes Requested, Round 2: Approved) | Merged |
| [phatthidawadi/toktickit#77](https://github.com/phatthidawadi/toktickit/pull/77) | `feature/31-e2e-automated-testing-and-screenshots` | Playwright Multi-Viewport E2E Test Suite, Performance-Smoke Tests, and Visual Screenshots (Issue #31) | Approved (Round 1: Changes Requested, Round 2: Approved) | Merged |
| [phatthidawadi/toktickit#78](https://github.com/phatthidawadi/toktickit/pull/78) | `feature/32-visual-style-accessibility-hardening` | Zen Green Visual Style, Accessibility, Regression, and Final Hardening (Issue #32) | Approved (Round 1: Changes Requested, Round 2: Approved) | Merged |
| [phatthidawadi/toktickit#79](https://github.com/phatthidawadi/toktickit/pull/79) | `feature/33-doc-reviewer-ai-use` | Sprint 4 Peer Reviewer Documentation, AI Usage Reflection, and Release Integration (Issue #33) | Approved with comments | Merged |
| [phatthidawadi/toktickit#80](https://github.com/phatthidawadi/toktickit/pull/80) | `lab4-staging` | Release Sprint 4 (Lab 4): Actions Taken, Dashboards, and Final Regression | Pending Final Merge | Open |

---

## 3. Verbatim Review Comments Received & Author Responses

### Reviewer Comments on [PR #72](https://github.com/chanya06/toktickit/pull/72) (feature/29-spec-and-tests)

> **Reviewer:** `@lmaybelgracel` — **Verdict:** CHANGES REQUESTED  
> จากการตรวจสอบเอกสารสัญญาทางวิศวกรรมใน `docs/lab-04/` เทียบกับข้อกำหนดในคู่มือปฏิบัติการ Lab 4 อย่างละเอียด พบข้อบกพร่องสำคัญ 4 จุดที่ขัดต่อเกณฑ์การประเมินของอาจารย์ เอกสารชุดนี้ยังไม่สามารถอนุมัติให้ผ่านได้ และต้องได้รับการแก้ไขในสาขา `feature/29-spec-and-tests` ให้ครบถ้วนก่อนการ Merge:  
> 
> 1. **การขาดฟิลด์ผู้รับมอบหมายงาน (assigneeId) ในโมเดลและ API**  
>    - *เกณฑ์บังคับ:* Handout Section 9.1 (AC-01) ระบุว่าต้องบันทึกทั้ง authenticated creator และ approved assignee และ Handout Section 14 (Answer Part 6) ระบุให้ทดสอบ assign งานและ inactive-assignee rejection  
>    - *ข้อผิดพลาด:* ใน `specification.md` (หัวข้อ 7.1) และ `api-spec.md` (หัวข้อ 2) มีเฉพาะฟิลด์ `performedById` String ทำให้ไม่สามารถแยกผู้รับมอบหมายงาน และไม่สามารถทดสอบกรณี Inactive Assignee Rejection ตามเกณฑ์ได้  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มฟิลด์ `assigneeId: String?` เชื่อมโยงกับโมเดล User ควบคู่กับ `performedById: String` ทั้งใน Prisma Schema และ API Payloads  
> 
> 2. **การขาดขั้นตอน Rollback และแผนการกู้คืนฐานข้อมูล**  
>    - *เกณฑ์บังคับ:* Handout Section 5.2 กำหนดให้ต้องมีการระบุและทดสอบขั้นตอนการย้อนกลับสกีมา (Migration Rollback) และการกู้คืนข้อมูล (Recovery Approach)  
>    - *ข้อผิดพลาด:* ใน `specification.md` หัวข้อ 7 มีเพียงการอธิบายเหตุผลเรื่อง Nullable Legacy Support แต่ไม่มีเนื้อหาขั้นตอนการทำ Rollback หรือ Disaster Recovery หากการ Migration ล้มเหลว  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มหัวข้อย่อยใน Section 7 ของ `specification.md` ระบุคำสั่งและขั้นตอนการทำ Migration Rollback และแนวทางการกู้คืนฐานข้อมูล  
> 
> 3. **การขาดเคสทดสอบบังคับในตาราง Traceability Matrix**  
>    - *เกณฑ์บังคับ:* Handout Section 10 กำหนดให้แผนการทดสอบต้องครอบคลุม Unit, Integration, UI Component, UI Style, Responsive, Authorization, Workflow, Migration/Regression และ Performance-Smoke  
>    - *ข้อผิดพลาด:* ตารางใน `tests.md` มีเฉพาะเคสฟังก์ชันทั่วไป แต่ขาดแถวการทดสอบเฉพาะทางที่อาจารย์ระบุ  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มแถวการทดสอบใน `tests.md` ให้ครบถ้วน:  
>      - *UI Style & Responsive:* การตรวจสอบ Zero Horizontal Overflow บนหน้าจอมือถือความกว้าง 375px  
>      - *Accessibility:* การตรวจสอบ Visible Focus Rings และการนำทางด้วยคีย์บอร์ดตามเกณฑ์ WCAG AA  
>      - *Performance-Smoke:* การตรวจสอบเวลาในการ Query และรวมข้อมูลของแดชบอร์ด  
>      - *Migration & Rollback:* การตรวจสอบความถูกต้องของการ Migration และการย้อนกลับข้อมูล  
> 
> 4. **การขาดพฤติกรรมกรณีไร้ข้อมูล (Empty Behavior) และเงื่อนไข Resolution Gate**  
>    - *เกณฑ์บังคับ:* Handout Section 4.6 และ 6.2 ระบุว่าการ์ดแดชบอร์ดต้องระบุพฤติกรรมเมื่อไม่มีข้อมูล (Empty Behavior) และเป้าหมายการ Drill-down และ Section 4.5 ระบุว่าการเปลี่ยนสถานะตั๋วสู่ RESOLVED ต้องผ่านการตรวจสอบงานจริงของ IT Staff  
>    - *ข้อผิดพลาด:* ยังไม่ได้ระบุการแสดงผลของการ์ดเมตริกเมื่อค่าเป็น 0 หรือตารางแดชบอร์ดเมื่อไม่มีตั๋ว และกฎ BR-08 ยังไม่ได้ระบุเงื่อนไขความสัมพันธ์ระหว่างการ Resolve ตั๋วกับสถานะของ Actions Taken  
>    - *สิ่งที่ต้องแก้ไข:* ระบุ Empty State ของการ์ดและตารางแดชบอร์ดใน `specification.md` และ `ui-spec.md` และระบุเงื่อนไขในกฎ BR-08 ให้ชัดเจนว่าการเปลี่ยนสถานะตั๋วเป็น RESOLVED จะต้องไม่มี Action Taken ค้างอยู่ในสถานะ PENDING หรือ IN_PROGRESS  

---

### Author Response & Action Plan (`@chanya06`):
ขอบคุณสำหรับคอมเมนต์รีวิวที่ละเอียดและตรงจุด ได้ดำเนินการแก้ไขในสาขา `feature/29-spec-and-tests` ครบทั้ง 4 ประเด็นเรียบร้อยแล้ว:

1. **เพิ่มฟิลด์ `assigneeId: String?` ในโมเดลและ API:**
   - ใน `docs/lab-04/specification.md` (FR-01, FR-05, BR-02, BR-05, Section 7.1 Prisma Schema, Section 8, AC-01, AC-05) เพิ่ม `assigneeId: String?` พร้อม `@relation("ActionAssignee")` เชื่อมโยงกับ `User` ควบคู่กับ `performedById: String` (`@relation("ActionPerformer")`)
   - ใน `docs/lab-04/api-spec.md` (Section 2.1, 2.2, 2.3) ปรับ Request/Response ให้รองรับ `assigneeId` และ `assignee` object พร้อมกฎ Reject Inactive Assignee ด้วย 422 Unprocessable Entity
   - ใน `docs/lab-04/ui-spec.md` เพิ่มคอลัมน์ "Assigned To" ในตาราง Actions Taken และตัวเลือก Assignee ใน Create/Edit Modal
2. **เพิ่มขั้นตอน Migration Rollback & Disaster Recovery (Section 7.3):**
   - เพิ่มหัวข้อ 7.3 ใน `docs/lab-04/specification.md` ระบุคำสั่ง Reverse Migration DDL (`DROP TABLE "ActionTaken" CASCADE; DROP TYPE "ActionTakenStatus";`), คำสั่ง `npx prisma migrate resolve --rolled-back`, ขั้นตอนการสำรองข้อมูลล่วงหน้าด้วย `pg_dump` และการกู้คืน Point-in-time Recovery ด้วย `pg_restore`
3. **เพิ่มเคสทดสอบเฉพาะทางใน Test Traceability Matrix (`docs/lab-04/tests.md`):**
   - เพิ่มเคส `STYLE-01` (Zero horizontal overflow ที่ 375px)
   - เพิ่มเคส `A11Y-01` (Visible focus rings `#006B3C` และ WCAG AA keyboard navigation)
   - เพิ่มเคส `PERF-01` (Performance-smoke สำหรับแดชบอร์ด query latency ต่ำกว่า 100ms)
   - เพิ่มเคส `MIGR-01` (Forward migration & rollback verification โดยไม่สูญเสียข้อมูลตั๋วเดิม)
4. **ระบุ Empty Behavior และเงื่อนไข Action Completion ใน Resolution Gate:**
   - ใน `specification.md` และ `ui-spec.md` ระบุพฤติกรรมการแสดงผลเมื่อค่าการ์ดเป็น 0 (แสดงเลข 0 สี Slate ปิดเส้นไฮไลท์พร้อมให้คลิก Drill-down เข้าสู่ Empty State ของหน้ารายการ) และข้อความ Empty State สำหรับตาราง Recent Tickets
   - ใน `specification.md` (BR-08) และ `api-spec.md` (Section 4.2) ระบุเงื่อนไข Resolution Gate อย่างเข้มงวด: ตั๋วจะเปลี่ยนเป็น `RESOLVED` ได้ก็ต่อเมื่อไม่มี Action Taken ค้างอยู่ในสถานะ `PENDING` หรือ `IN_PROGRESS` (ต้องเป็น `COMPLETED` หรือ `CANCELLED` ทั้งหมด) หากยังมีค้างอยู่ API จะ Reject ด้วย 422 Unprocessable Entity ทันที


---

### Reviewer Comments on [PR #81](https://github.com/chanya06/toktickit/pull/81) (feature/30-db-schema-actions-taken)

> **Reviewer:** `@lmaybelgracel` — **Verdict:** CHANGES REQUESTED  
> จากการตรวจสอบโค้ดและการออกแบบใน PR #81 (สาขา feature/30-db-schema-actions-taken) เทียบกับเกณฑ์บังคับของอาจารย์ใน Handout Lab 4 (Section 4.5, 5.2, 5.3, 10, 14) อย่างละเอียด พบข้อบกพร่องที่ต้องปรับปรุงแก้ไข 4 จุด ดังนี้:  
> 
> 1. **ข้อบกพร่องในชุดทดสอบ MIGR-01d เรื่องการทดสอบ Rollback DDL:**  
>    - *เกณฑ์บังคับ:* Handout Section 5.2 และ 10 กำหนดว่าขั้นตอนการทำ Migration Rollback ต้องได้รับการบันทึกและทดสอบการทำงานจริง (documented and tested)  
>    - *ข้อผิดพลาด:* ในไฟล์ `server/tests/lab-04/migration-rollback.test.ts` เคส MIGR-01d ไม่ได้ทดสอบคำสั่ง Rollback จริง แต่สร้างตารางจำลอง `ActionTaken_RollbackTest` ที่มีเพียงคอลัมน์ id และ ticketId แล้วสั่ง Drop ทำให้ไม่ได้ทดสอบการ Drop ตาราง `ActionTaken` จริงที่มี Foreign Keys ครบถ้วน รวมถึงไม่ได้ทดสอบคำสั่ง `DROP TYPE IF EXISTS "ActionTakenStatus"`  
>    - *สิ่งที่ต้องแก้ไข:* ปรับปรุงเคส MIGR-01d ให้ทดสอบโครงสร้างตารางจริง หรือสร้างตารางจำลองที่มีโครงสร้างและประเภทข้อมูล ActionTakenStatus พร้อม Foreign Key ครบถ้วนตามสกีมาจริง เพื่อยืนยันว่าคำสั่ง Down-migration ใน Section 7.3 ทำงานได้โดยไม่ติด Constraint Error  
> 
> 2. **การขาดข้อมูลตั๋วสถานะ REOPENED และ CANCELLED ใน Seed Data:**  
>    - *เกณฑ์บังคับ:* Handout Section 4.5 และ 5.3 กำหนดว่า Seed Data ต้องครอบคลุมสถานะหลักของตั๋วทั้งหมด (All major statuses) รวมถึงสถานะ Reopened และ Cancelled เพื่อรองรับการคำนวณแดชบอร์ดตามสถานะ (Tickets by status)  
>    - *ข้อผิดพลาด:* ใน `server/prisma/seed.ts` มีตั๋วตัวอย่างเพียง 6 ใบ ครอบคลุมเฉพาะ NEW, OPEN, IN_PROGRESS, RESOLVED, WAITING_FOR_REQUESTER, CLOSED ขาดสถานะ REOPENED และ CANCELLED  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มตั๋วจำลองสถานะ REOPENED (เช่น TKT-2026-000007 มี Action แจ้ง Reopen) และ CANCELLED (เช่น TKT-2026-000008) พร้อม Action Taken ที่เกี่ยวข้อง เพื่อให้ชุดข้อมูลตั้งต้นครอบคลุมวงจรชีวิตของตั๋วครบตาม Handout Section 4.5  
> 
> 3. **การขาดหัวข้อบันทึกการรีวิว PR #81 ใน docs/lab-04/reviewer.md:**  
>    - *เกณฑ์บังคับ:* Handout Section 14 (Part 1) กำหนดให้เอกสาร reviewer.md ต้องบันทึกหลักฐานการรีวิวของทุก PR ประกอบด้วย ตัวตนผู้ตรวจ ลิงก์ PR ข้อคิดเห็น/ข้อบกพร่องที่พบ (Comments) การตอบกลับของผู้พัฒนา (Responses) และผลการอนุมัติ (Approvals)  
>    - *ข้อผิดพลาด:* ใน `docs/lab-04/reviewer.md` มีการอัปเดตเฉพาะตารางสรุปด้านบน แต่ยังไม่มีหัวข้อเนื้อหา Review Round 2 สำหรับ PR #81 ที่บันทึกข้อคิดเห็นและแผนการแก้ไข  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มหัวข้อ Review Round 2: PR #81 ใน `docs/lab-04/reviewer.md` บันทึกประเด็นที่ต้องแก้ไขและเปิดพื้นที่ให้ผู้พัฒนาตอบกลับแผนการดำเนินงาน  
> 
> 4. **คำอธิบายการตัดสินใจทางสถาปัตยกรรมด้าน Database Constraints ใน specification.md:**  
>    - *เกณฑ์บังคับ:* Handout Section 5.1 กำหนดว่าต้องระบุเหตุผลในการตัดสินใจออกแบบฐานข้อมูลอย่างน้อย 2 ข้อ (At least two database-design decisions must be justified in specification.md)  
>    - *ข้อผิดพลาด:* ในโมเดล `ActionTaken` ฟิลด์ `followUpRequired` มีความสัมพันธ์เชิงธุรกิจกับ `followUpNote` แต่สกีมาไม่ได้ใช้ Database Check Constraint ในระดับ PostgreSQL  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มข้อความชี้แจงใน Section 7.2 หรือ 11 ของ `specification.md` ระบุเหตุผลการตัดสินใจทางสถาปัตยกรรมว่าเหตุใดจึงจัดการความสอดคล้องของ followUpNote ในระดับ Application Layer / Zod Validation แทนการใช้ Database Check Constraint  

---

### Author Response & Action Plan (`@chanya06`):
ขอบคุณสำหรับข้อเสนอแนะที่ละเอียดและช่วยเพิ่มความสมบูรณ์ของระบบ ได้แก้ไขในสาขา `feature/30-db-schema-actions-taken` ครบทั้ง 4 ประเด็นเรียบร้อยแล้ว:

1. **ปรับปรุงเคส MIGR-01d ใน `server/tests/lab-04/migration-rollback.test.ts`:**
   - ปรับปรุงการทดสอบให้สร้างสกีมาจำลองที่มีโครงสร้างเทียบเท่าจริง 100%: ทั้งประเภทข้อมูล Enum `ActionTakenStatus_RollbackSim`, คอลัมน์ครบทุกฟิลด์, Foreign Key Constraints ไปยัง `Ticket(id)` (CASCADE) และ `User(id)` (RESTRICT / SET NULL), และ Index 3 ตัว
   - ทำการ Insert ข้อมูลจริงที่มีการผูก Foreign Key เพื่อทดสอบว่า Constraint ทำงาน
   - รันคำสั่ง Down-migration Rollback DDL: `DROP TABLE IF EXISTS "ActionTaken_RollbackSim" CASCADE;` และ `DROP TYPE IF EXISTS "ActionTakenStatus_RollbackSim";`
   - ตรวจสอบผ่าน `information_schema.tables` และ `pg_type` เพื่อยืนยันว่า Table, Type, และ Constraints ถูก Drop สะอาดหมดจดโดยไม่เกิดข้อผิดพลาดใด ๆ (Test Pass 100%)
2. **เพิ่มตั๋วสถานะ `REOPENED` และ `CANCELLED` ใน Seed Data (`server/prisma/seed.ts`):**
   - เพิ่มตั๋ว `TKT-2026-000007` (สถานะ `REOPENED`) กรณี Wi-Fi ดับซ้ำ พร้อม Action Taken บันทึกการวิเคราะห์คลื่น 5GHz และ Flag งานติดตามผล
   - เพิ่มตั๋ว `TKT-2026-000008` (สถานะ `CANCELLED`) กรณีตั๋วแจ้งซ้ำ พร้อม Action Taken บันทึกเหตุผลการยกเลิกโดย IT Staff
   - อัปเดต `seedTicketNumbers` ครอบคลุม 8 ใบ ทำให้ชุดข้อมูลตั้งต้นรองรับสถานะตั๋วครบทั้ง 8 สถานะตาม Handout Section 4.5 อย่างสมบูรณ์และเป็น Idempotent (ทดสอบรันซ้ำได้ผล 8 ตั๋ว, 9 Actions คงที่)
3. **บันทึกหลักฐานการรีวิว PR #81 ใน `docs/lab-04/reviewer.md`:**
   - เพิ่มเนื้อหาข้อคิดเห็นของผู้ตรวจและการตอบกลับของผู้พัฒนาสำหรับ PR #81 ครบถ้วนตามเกณฑ์ Handout Section 14 (Part 1)
4. **เพิ่มเหตุผลการตัดสินใจทางสถาปัตยกรรม (Decision 4) ใน `docs/lab-04/specification.md`:**
   - เพิ่มข้อ "4. Decision 4: Application-Layer Enforcement of Conditional Follow-up Invariants over Database CHECK Constraints" ในหัวข้อ 7.2
   - ชี้แจงเหตุผลว่าการตรวจสอบ `followUpRequired => followUpNote` ในระดับ Application Layer ช่วยให้ส่งรหัส HTTP 400 พร้อมข้อความแจ้งเตือนที่ระบุฟิลด์ชัดเจนสู่ UI Component (แทนการติด Error 23514 / 500 จาก Database) และช่วยรักษาความยืดหยุ่นของ ORM Schema ให้ Portable ต่อการทดสอบ


---

### Reviewer Comments on [PR #82](https://github.com/chanya06/toktickit/pull/82) (feature/31-actions-taken-api)

> **Reviewer:** `@lmaybelgracel` — **Verdict:** CHANGES REQUESTED  
> จากการตรวจทานโค้ดสถาปัตยกรรม REST API การควบคุมการเข้าถึง และการจัดการความสอดคล้องของข้อมูลใน PR #82 (สาขา feature/31-actions-taken-api) เทียบกับเกณฑ์บังคับของอาจารย์ใน Handout Lab 4 (Sections 4.1, 4.2, 5.1, 6.1, 10 และ 14) พบข้อบกพร่องสำคัญ 4 จุดที่ต้องได้รับการแก้ไขก่อนการอนุมัติ:  
> 
> 1. **การละเมิดกฎสถานะสิ้นสุดในคำสั่ง PUT (`PUT /api/tickets/:id/actions/:actionId`):**  
>    - *เกณฑ์บังคับ:* Handout Section 4.2 และ Business Rule BR-03 กำหนดว่าสถานะ COMPLETED และ CANCELLED เป็นสถานะสิ้นสุดของประวัติการดำเนินงาน (Final read-only audit trail) ไม่สามารถเปิดใหม่ แก้ไข หรือเปลี่ยนสถานะกลับได้  
>    - *ข้อผิดพลาด:* โค้ดในเส้นทาง actionsRouter.put ไม่มีการตรวจสอบสถานะเดิมของ existingAction.status ทำให้ไคลเอนต์สามารถส่งคำสั่ง PUT เพื่อแก้ไขเนื้อหาและเปลี่ยนสถานะของ Action ที่ COMPLETED หรือ CANCELLED ไปแล้วกลับมาเป็น PENDING หรือ IN_PROGRESS ได้ ซึ่งทำให้กลไกการป้องกันในคำสั่ง PATCH ถูกหลีกเลี่ยง  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มเงื่อนไขตรวจสอบในคำสั่ง PUT ว่าหาก existingAction.status เป็น COMPLETED หรือ CANCELLED ให้ปฏิเสธคำขอด้วยรหัส HTTP 422 Unprocessable Entity ทันที  
> 
> 2. **การบังคับใช้ Transition Matrix ของกฎ BR-03 ในคำสั่ง PATCH ไม่ครบถ้วน:**  
>    - *เกณฑ์บังคับ:* ข้อกำหนด BR-03 (Action Taken Status Machine) ใน specification.md กำหนดให้สถานะ PENDING สามารถเปลี่ยนผ่านได้เฉพาะ IN_PROGRESS หรือ CANCELLED เท่านั้น (ห้ามเปลี่ยนข้ามขั้นเป็น COMPLETED โดยไม่ผ่านการลงมือปฏิบัติงาน)  
>    - *ข้อผิดพลาด:* ใน actionsRouter.patch มีการดักจับเฉพาะกรณีสถานะเดิมเป็น COMPLETED หรือ CANCELLED แต่ยังขาดการตรวจสอบสถานะ PENDING ส่งผลให้สามารถส่งคำสั่งเปลี่ยนจาก PENDING ไปเป็น COMPLETED ได้โดยตรง  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มเงื่อนไขตรวจสอบสถานะต้นทาง PENDING ไม่ให้อนุญาตการเปลี่ยนสู่ COMPLETED โดยตรง และตอบกลับด้วย HTTP 422 เมื่อเกิดการเปลี่ยนผ่านที่ผิดกฎ  
> 
> 3. **การขาดหัวข้อบันทึกการรีวิว PR #82 ในเอกสารกระบวนการวิศวกรรม (`docs/lab-04/reviewer.md`):**  
>    - *เกณฑ์บังคับ:* Handout Section 14 (Answer Part 1) กำหนดให้เอกสาร reviewer.md ต้องปรากฏหลักฐานการรีวิวของทุก Pull Request ประกอบด้วยลิงก์ PR, ข้อคิดเห็น/ข้อบกพร่องที่พบ (Comments), การตอบกลับ (Responses) และการอนุมัติ (Approvals)  
>    - *ข้อผิดพลาด:* ใน docs/lab-04/reviewer.md มีเพียงการระบุสถานะในตารางสรุป แต่ยังไม่มีหัวข้อเนื้อหา Review Round 3: PR #82 (feature/31-actions-taken-api) ที่บันทึกรายละเอียดข้อคิดเห็นการตรวจทาน  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มหัวข้อ Review Round 3: PR #82 ใน reviewer.md บันทึกข้อเสนอแนะในการปรับปรุง และเปิดพื้นที่ให้ผู้พัฒนาตอบกลับแผนการแก้ไข  
> 
> 4. **การขาดเคสทดสอบอัตโนมัติสำหรับ Terminal State Protection ในคำสั่ง PUT:**  
>    - *เกณฑ์บังคับ:* Handout Section 10 กำหนดให้การบังคับใช้กฎทางธุรกิจ (Business Rules) ต้องมีชุดทดสอบอัตโนมัติรองรับอย่างครอบคลุม  
>    - *ข้อผิดพลาด:* ในไฟล์ server/tests/lab-04/actions-taken.api.test.ts มีเฉพาะเคสทดสอบการปฏิเสธในคำสั่ง PATCH (API-04) แต่ยังขาดการทดสอบยืนยันว่าคำสั่ง PUT จะต้องปฏิเสธการแก้ไข Action ที่อยู่ในสถานะ COMPLETED หรือ CANCELLED  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มเคสทดสอบอัตโนมัติใน actions-taken.api.test.ts เพื่อยืนยันว่าการส่ง PUT ไปยัง Action ที่ปิดงานแล้วจะได้รับรหัส HTTP 422 เสมอ  

---

### Author Response & Action Plan (`@chanya06`):
ขอบคุณสำหรับผลการตรวจสอบที่ละเอียดและตรงจุด ได้ดำเนินการปรับปรุงแก้ไขในสาขา `feature/31-actions-taken-api` ครบทั้ง 4 ประเด็นเรียบร้อยแล้ว:

1. **เพิ่มการป้องกัน Terminal State ในคำสั่ง PUT (`server/src/routes/actions.ts`):**
   - เพิ่มการตรวจสอบ `existingAction.status === ActionTakenStatus.COMPLETED || existingAction.status === ActionTakenStatus.CANCELLED` ใน `actionsRouter.put`
   - หากตรวจพบ จะปฏิเสธทันทีด้วยรหัส HTTP `422 Unprocessable Entity` พร้อมแจ้งข้อความ `"Cannot modify a completed or cancelled action: record is in a terminal read-only state"` ป้องกันการแก้ไขเนื้อหาหรือหลีกเลี่ยงกฎสถานะสิ้นสุด
2. **บังคับใช้ Transition Matrix ของกฎ BR-03 ในคำสั่ง PATCH อย่างสมบูรณ์ (`server/src/routes/actions.ts`):**
   - เพิ่มการตรวจสอบกรณี `currentStatus === ActionTakenStatus.PENDING && newStatus === ActionTakenStatus.COMPLETED`
   - ปฏิเสธการเปลี่ยนข้ามขั้นโดยไม่ผ่าน `IN_PROGRESS` ด้วยรหัส HTTP `422 Unprocessable Entity` ตามข้อกำหนด BR-03
3. **บันทึกหลักฐานการรีวิว PR #82 ใน `docs/lab-04/reviewer.md`:**
   - เพิ่มหัวข้อ Review Round 3 สำหรับ PR #82 พร้อมบันทึกข้อคิดเห็นของ `@lmaybelgracel` และการตอบกลับของ `@chanya06` ครบถ้วนตามเกณฑ์ Handout Section 14 (Part 1)
4. **เพิ่มเคสทดสอบอัตโนมัติครอบคลุม Terminal State และ Transition Matrix ใน `server/tests/lab-04/actions-taken.api.test.ts`:**
   - เพิ่มเคสทดสอบยืนยันคำสั่ง PUT บน Action สถานะ `COMPLETED` ได้รับ HTTP 422
   - เพิ่มเคสทดสอบยืนยันคำสั่ง PUT บน Action สถานะ `CANCELLED` ได้รับ HTTP 422
   - เพิ่มเคสทดสอบยืนยันคำสั่ง PATCH เปลี่ยนสถานะจาก `PENDING` ข้ามไป `COMPLETED` ได้รับ HTTP 422
   - ทุกเคสทดสอบผ่าน 100% (รวม 26 tests ใน actions-taken.api.test.ts)


---

### Reviewer Comments on [PR #83](https://github.com/chanya06/toktickit/pull/83) (feature/32-actions-taken-ui)

> **Reviewer:** `@lmaybelgracel` — **Verdict:** CHANGES REQUESTED  
> จากการตรวจทานโค้ดส่วนติดต่อผู้ใช้ Actions Taken บนหน้าจอ Ticket Detail และชุดทดสอบใน PR #83 (สาขา feature/32-actions-taken-ui) เทียบกับเกณฑ์บังคับของอาจารย์ใน Handout Lab 4 (Sections 6, 8.3, 10 และ 14) พบข้อบกพร่องสำคัญ 4 จุดที่ต้องได้รับการแก้ไขก่อนการอนุมัติ:  
> 
> 1. **ข้อจำกัดในการสาธิตและทดสอบการปฏิเสธผู้รับมอบหมายที่ถูกระงับสิทธิ์ (Inactive-Assignee Rejection):**  
>    - *เกณฑ์บังคับ:* Handout Section 14 (Answer Part 6: Working Actions Taken UI) กำหนดให้ต้องสาธิตการทำงานของ "inactive-assignee rejection, role restrictions, safe failures" บนหน้าจอ UI  
>    - *ข้อผิดพลาด:* ใน ActionsTakenSection.tsx ตัวเลือกใน Dropdown มอบหมายงาน (#action-assignee) มีการใส่แอตทริบิวต์ disabled={assignee.isActive === false} ทำให้ผู้ใช้ไม่สามารถคลิกเลือกผู้ใช้ที่ถูกปิดใช้งานเพื่อทดสอบการตอบสนองความผิดพลาด HTTP 422 ของระบบได้  
>    - *สิ่งที่ต้องแก้ไข:* ปลดแอตทริบิวต์ disabled ออก และแสดงป้ายกำกับให้ชัดเจน เช่น (Staff - Inactive) เพื่อให้สามารถคลิกเลือกส่งคำขอไปยังระบบ และเปิดให้ระบบแสดงการปฏิเสธ HTTP 422 Unprocessable Entity ตามเกณฑ์การประเมิน Answer Part 6  
> 
> 2. **การขาดการไฮไลต์ฟิลด์ที่เกิดข้อผิดพลาดแบบเฉพาะเจาะจง (Field-Level Inline Error Highlighting):**  
>    - *เกณฑ์บังคับ:* Handout Section 14 (Answer Part 9) และ ui-spec.md กำหนดเรื่อง "validation placement, keyboard focus, and safe-failure feedback"  
>    - *ข้อผิดพลาด:* เมื่อเกิด Validation Error หรือ API ส่งข้อผิดพลาดแบบระบุฟิลด์กลับมา (field: "followUpNote" หรือ field: "actionDescription") ใน Modal มีเพียงการแสดงกล่อง Alert ด้านบนรวมกันจุดเดียว แต่ไม่มีการทำขอบสีแดงหรือคลาส is-invalid ที่ตัว Input หรือ Textarea ของฟิลด์นั้นโดยตรง  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มการผูกคลาส is-invalid หรือขอบสีแดงที่ฟิลด์ที่ระบุ เพื่อความชัดเจนในการแก้ไขข้อมูลและสอดคล้องกับเกณฑ์ Accessibility และ UI Polish  
> 
> 3. **การขาดหัวข้อบันทึกการรีวิว PR #83 ในเอกสารกระบวนการวิศวกรรม (`docs/lab-04/reviewer.md`):**  
>    - *เกณฑ์บังคับ:* Handout Section 14 (Answer Part 1: Git Use with Engineering Workflow) กำหนดให้เอกสาร reviewer.md ต้องปรากฏหลักฐานการรีวิวของทุก PR ประกอบด้วย ตัวตนผู้ตรวจ ลิงก์ PR ข้อคิดเห็น/ข้อบกพร่องที่พบ (Comments) การตอบกลับของผู้พัฒนา (Responses) และผลการอนุมัติ (Approvals)  
>    - *ข้อผิดพลาด:* ใน docs/lab-04/reviewer.md มีเพียงการอัปเดตบรรทัด PR #83 ในตารางสรุปด้านบน แต่ยังไม่มีหัวข้อเนื้อหา Review Round 4: PR #83 (feature/32-actions-taken-ui)  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มหัวข้อ Review Round 4 สำหรับ PR #83 ใน reviewer.md บันทึกข้อเสนอแนะและเปิดพื้นที่ให้ผู้พัฒนาตอบกลับแผนการดำเนินงาน  
> 
> 4. **การขาดเคสทดสอบอัตโนมัติสำหรับ Inactive Assignee Rejection ในชุดทดสอบหน้าบ้าน (ActionsTaken.test.tsx):**  
>    - *เกณฑ์บังคับ:* Handout Section 10 กำหนดให้ Acceptance Criteria และ Safe Failure ต้องได้รับการทดสอบอย่างครอบคลุม  
>    - *ข้อผิดพลาด:* ใน client/tests/lab-04/ActionsTaken.test.tsx มีการจำลองผู้ใช้ { id: 99, fullName: "Inactive Staff", isActive: false } ไว้ใน mockAssignees แล้ว แต่ยังไม่มีเคสทดสอบที่ยืนยันพฤติกรรมเมื่อเลือกผู้ใช้ที่ถูกปิดใช้งานหรือการจัดการกับข้อผิดพลาด 422 ของ Assignee  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มเคสทดสอบอัตโนมัติใน ActionsTaken.test.tsx ยืนยันการแสดงผลแจ้งเตือนความผิดพลาดเมื่อเลือกผู้ใช้ที่ถูกระงับสิทธิ์  

---

### Author Response & Action Plan (`@chanya06`):
ขอบคุณสำหรับผลการตรวจสอบส่วนติดต่อผู้ใช้ที่ละเอียดและครอบคลุม ได้ดำเนินการปรับปรุงแก้ไขในสาขา `feature/32-actions-taken-ui` ครบทั้ง 4 ประเด็นเรียบร้อยแล้ว:

1. **ปลดล็อกตัวเลือก Inactive Assignee ให้สามารถเลือกเพื่อทดสอบ Safe Failure ได้ (`client/src/components/ActionsTakenSection.tsx`):**
   - นำแอตทริบิวต์ `disabled={assignee.isActive === false}` ออกจากแท็ก `<option>` ใน Dropdown มอบหมายงาน (`#action-assignee`)
   - แสดงป้ายกำกับชัดเจน เช่น `Alex Chen (Staff)` หรือ `Inactive Staff (Staff - Inactive)` เพื่อให้สามารถคลิกเลือกส่งคำขอได้จริง
   - เมื่อส่งคำขอ ระบบจะส่ง HTTP 422 Unprocessable Entity กลับมาตามเกณฑ์ Handout Section 14 (Answer Part 6) เพื่อสาธิตกลไก Safe Failure บน UI ได้อย่างสมบูรณ์
2. **เพิ่มการแสดงผลข้อผิดพลาดระดับฟิลด์ (Field-Level Inline Error Highlighting) ใน Modal (`client/src/components/ActionsTakenSection.tsx`):**
   - เพิ่ม State `modalErrorField` สำหรับติดตามฟิลด์ที่เกิดข้อผิดพลาด (`"actionDescription" | "followUpNote" | "result" | "assigneeId" | "actionDateTime"`)
   - ผูกคลาส `is-invalid` (ขอบสีแดงตามมาตรฐาน Bootstrap / WCAG AA) เข้ากับ Form Control ของฟิลด์นั้นโดยตรง
   - เพิ่มบล็อก `<div className="invalid-feedback d-block">` ใต้ฟิลด์ที่เกิดข้อผิดพลาดเพื่อแสดงข้อความระบุสาเหตุแบบ Inline สอดคล้องกับเกณฑ์ Accessibility และ UI Polish
   - มีการเคลียร์สถานะข้อผิดพลาดของฟิลด์โดยอัตโนมัติเมื่อผู้ใช้แก้ไขข้อมูลในฟิลด์นั้น
3. **บันทึกหลักฐานการรีวิว PR #83 ใน `docs/lab-04/reviewer.md`:**
   - เพิ่มเนื้อหา Review Round 4: PR #83 ใน `docs/lab-04/reviewer.md` ครบถ้วนตามเกณฑ์ Handout Section 14 (Answer Part 1)
   - อัปเดตสถานะในตารางสรุปเป็น `Changes Requested (Resolved) | In Review`
4. **เพิ่มเคสทดสอบอัตโนมัติสำหรับ Inactive Assignee Rejection ใน `client/tests/lab-04/ActionsTaken.test.tsx`:**
   - เพิ่มเคสทดสอบ `"handles inactive assignee rejection with HTTP 422 and field-level error highlighting"`
   - ทดสอบการเลือก Assignee ที่ถูกระงับสิทธิ์ (Option ไม่ถูก disable, สามารถเลือกได้)
   - จำลอง API ตอบกลับด้วยรหัส HTTP 422 `{ error: "Assignee must be an active IT Staff or Administrator account", field: "assigneeId" }`
   - ตรวจสอบว่า Dropdown มีคลาส `is-invalid` ขอบสีแดง และมีข้อความ Invalid Feedback แสดงผลแจ้งเตือนอย่างถูกต้อง (16/16 tests ใน ActionsTaken.test.tsx ผ่าน 100%)

---

### Reviewer Comments on [PR #84](https://github.com/chanya06/toktickit/pull/84) (feature/33-dashboard-api) - Review Round 5

> **Reviewer:** `@lmaybelgracel` — **Verdict:** CHANGES REQUESTED  
> จากการตรวจทานโค้ดระบบคำนวณเมตริกแดชบอร์ด (Requester & IT Staff Dashboard REST APIs) และชุดทดสอบวัดประสิทธิภาพใน PR #84 (สาขา feature/33-dashboard-api) เทียบกับเกณฑ์บังคับของอาจารย์ใน Handout Lab 4 (Sections 4.6, 5.3, 10 และ 14) พบข้อบกพร่องสำคัญ 4 จุดที่ต้องได้รับการแก้ไขก่อนการอนุมัติ:  
> 
> 1. **การนับรวมตั๋วสถานะสิ้นสุดในเมตริก Unassigned และ My Assigned Tickets (ขัดต่อกฎ BR-10):**  
>    - *เกณฑ์บังคับ:* ข้อกำหนด Business Rule BR-10 (IT Staff Dashboard Metric Boundaries) ใน specification.md ระบุไว้อย่างชัดเจนว่า:
>      - Unassigned Tickets: ต้องนับเฉพาะตั๋วที่ยัง Active และ `ownerId IS NULL` โดย `status NOT IN ('RESOLVED', 'CLOSED', 'CANCELLED')`
>      - My Assigned Tickets: ต้องนับเฉพาะตั๋วที่ยัง Active และ `ownerId === authUserId` โดย `status NOT IN ('RESOLVED', 'CLOSED', 'CANCELLED')`  
>    - *ข้อผิดพลาด:* ในไฟล์ `server/src/routes/dashboard.ts` (ฟังก์ชัน `computeStaffOperationalMetrics`) การคิวรี `unassignedTickets` และ `myAssignedTickets` มีเฉพาะเงื่อนไขตรวจสอบ `ownerId` แต่ขาดการกรองสถานะตั๋ว ส่งผลให้ตั๋วที่ถูกยกเลิก (เช่น TKT-2026-000008) หรือตั๋วที่ปิดไปแล้วถูกนับรวมเข้าไปในยอดงานค้างปฏิบัติงาน  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มเงื่อนไข `status: { notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.CANCELLED] }` ในทั้งสองคิวรีให้ถูกต้องตามกฎ BR-10  
> 
> 2. **การขาดการกรองสถานะตั๋วที่ยัง Active ในการคำนวณสถิติความสำคัญ (Priority Distribution):**  
>    - *เกณฑ์บังคับ:* กฎ BR-10 กำหนดให้การแจกแจงสถิติตามความสำคัญ (byPriority) สะท้อนเฉพาะภาระงานปัจจุบันที่ต้องจัดการ (Active Operational Workload)  
>    - *ข้อผิดพลาด:* คิวรี `prisma.ticket.groupBy` สำหรับ `itPriority` ไม่ได้ระบุตัวกรองสถานะ ส่งผลให้สถิตินำเอาตั๋วในประวัติศาสตร์ที่ปิดเสร็จสิ้นไปแล้วมาคำนวณรวมด้วย  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มเงื่อนไข `where: { status: { notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.CANCELLED] } }` ในคำสั่ง `groupBy` ของ `itPriority`  
> 
> 3. **การขาดหัวข้อบันทึกการรีวิว PR #84 ในเอกสารกระบวนการวิศวกรรม (`docs/lab-04/reviewer.md`):**  
>    - *เกณฑ์บังคับ:* Handout Section 14 (Answer Part 1: Git Use with Engineering Workflow) กำหนดให้เอกสาร reviewer.md ต้องปรากฏหลักฐานการรีวิวของทุก PR ประกอบด้วย ตัวตนผู้ตรวจ ลิงก์ PR ข้อคิดเห็น/ข้อบกพร่องที่พบ (Comments) การตอบกลับของผู้พัฒนา (Responses) และผลการอนุมัติ (Approvals)  
>    - *ข้อผิดพลาด:* ใน `docs/lab-04/reviewer.md` มีเพียงการอัปเดตสถานะบรรทัด PR #84 ในตารางสรุปด้านบน แต่ยังไม่มีหัวข้อเนื้อหา Review Round 5: PR #84 (feature/33-dashboard-api)  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มหัวข้อ Review Round 5 สำหรับ PR #84 ใน reviewer.md บันทึกข้อเสนอแนะในการปรับปรุง และเปิดพื้นที่ให้ผู้พัฒนาตอบกลับแผนการแก้ไข  
> 
> 4. **การขาดเคสทดสอบอัตโนมัติสำหรับ Terminal State Exclusion ใน `staff-dashboard.api.test.ts`:**  
>    - *เกณฑ์บังคับ:* Handout Section 10 กำหนดให้การบังคับใช้ Business Rules ต้องมีชุดทดสอบอัตโนมัติรองรับอย่างครอบคลุม  
>    - *ข้อผิดพลาด:* ในไฟล์ `server/tests/lab-04/staff-dashboard.api.test.ts` ยังไม่มีการทดสอบยืนยันว่าการสร้างตั๋วสถานะ CLOSED, RESOLVED หรือ CANCELLED จะต้องไม่ถูกนับเข้าไปเพิ่มในเมตริก `unassignedTickets`, `myAssignedTickets` และ `byPriority`  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มเคสทดสอบอัตโนมัติใน `staff-dashboard.api.test.ts` เพื่อยืนยันการคัดกรองตั๋วสถานะสิ้นสุดออกจากเมตริกการดำเนินงาน  

---

### Author Response & Action Plan (`@chanya06`):
ขอบคุณสำหรับผลการตรวจทานการคำนวณแดชบอร์ดที่เฉียบคมและแม่นยำ ได้ดำเนินการปรับปรุงแก้ไขในสาขา `feature/33-dashboard-api` ครบถ้วนทั้ง 4 ประเด็นเรียบร้อยแล้ว:

1. **คัดกรองสถานะสิ้นสุดออกจาก `unassignedTickets` และ `myAssignedTickets` ตามกฎ BR-10 (`server/src/routes/dashboard.ts`):**
   - เพิ่มเงื่อนไข `status: { notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.CANCELLED] }` ในทั้งคิวรี `unassignedTickets` (ตั๋วที่ไม่มีผู้รับผิดชอบและยัง Active) และ `myAssignedTickets` (ตั๋วที่มอบหมายให้ตนเองและยัง Active)
   - ป้องกันไม่ให้ตั๋วที่ยกเลิกหรือปิดเสร็จสิ้นแล้วหลุดเข้ามาปะปนในยอดค้างปฏิบัติงาน
2. **จำกัดสถิติแจกแจงตามความสำคัญ (`byPriority`) ให้สะท้อนเฉพาะ Active Operational Workload (`server/src/routes/dashboard.ts`):**
   - เพิ่ม `where: { status: { notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.CANCELLED] } }` ในคำสั่ง `prisma.ticket.groupBy` สำหรับ `itPriority`
   - ทำให้สถิติความสำคัญสะท้อนเฉพาะภาระงานปัจจุบันที่ต้องจัดการจริงตามกฎ BR-10 ในขณะที่ `byStatus` ยังคงแสดงผลสถิติภาพรวมครบทุกสถานะในระบบ
3. **บันทึกหลักฐานการรีวิว PR #84 ใน `docs/lab-04/reviewer.md`:**
   - เพิ่มหัวข้อ Review Round 5 สำหรับ PR #84 บันทึกข้อคิดเห็นของ `@lmaybelgracel` และแผนการแก้ไขของผู้พัฒนา `@chanya06` ครบถ้วนตามเกณฑ์ Handout Section 14 (Answer Part 1)
   - อัปเดตสถานะในตารางสรุปเป็น `Changes Requested (Resolved) | In Review`
4. **เพิ่มเคสทดสอบอัตโนมัติ `API-08i` ใน `server/tests/lab-04/staff-dashboard.api.test.ts`:**
   - เพิ่มเคสทดสอบ `"API-08i: strictly excludes terminal tickets (RESOLVED, CLOSED, CANCELLED) from unassignedTickets, myAssignedTickets, and byPriority (BR-10)"`
   - ตรวจสอบว่าการสร้างตั๋วสถานะ `CANCELLED`, `RESOLVED`, และ `CLOSED` จะไม่ทำให้ยอด `unassignedTickets`, `myAssignedTickets` และ `byPriority` (URGENT, HIGH, LOW) เพิ่มขึ้น
   - ยืนยันว่า `byStatus` ยังคงสะท้อนจำนวนตั๋วสถานะสิ้นสุดในภาพรวมได้อย่างถูกต้อง
   - ปรับปรุงการตรวจสอบในเคส `API-08b` ให้กรองเฉพาะ Active Tickets เพื่อให้สอดคล้องกับกฎ BR-10 อย่างสมบูรณ์
   - ชุดทดสอบ `staff-dashboard.api.test.ts` ผ่าน 100% (9/9 tests) และชุดทดสอบฝั่งเซิร์ฟเวอร์ทั้งหมดผ่านครบ 20/20 files (199/199 tests)

---

### Reviewer Comments on [PR #85](https://github.com/chanya06/toktickit/pull/85) (feature/34-dashboard-ui) - Review Round 6

> **Reviewer:** `@lmaybelgracel` — **Verdict:** CHANGES REQUESTED  
> จากการตรวจทานการออกแบบส่วนต่อประสานผู้ใช้ของแดชบอร์ด (Role Dashboards UI) และกลไก Drill-down ใน PR #85 (สาขา feature/34-dashboard-ui) เทียบกับเกณฑ์บังคับของอาจารย์ใน Handout Lab 4 (Sections 6, 8.3, 10 และ 14) และสัญญาข้อกำหนด ui-spec.md พบข้อบกพร่องสำคัญ 4 จุดที่ต้องได้รับการปรับปรุงแก้ไขก่อนการอนุมัติ:  
> 
> 1. **การขาดตัวเลือกสถานะ WAITING_FOR_REQUESTER, REOPENED, และ CANCELLED ในฟิลเตอร์ของ MyTicketsView:**  
>    - *เกณฑ์บังคับ:* Handout Section 4.5, 6.2 และ ui-spec.md กำหนดว่าเมื่อคลิก Drill-down จากการ์ด "Waiting for Input" ใน Requester Dashboard ระบบต้องนำทางไปยังหน้ารายการตั๋วพร้อมคัดกรองสถานะ WAITING_FOR_REQUESTER ให้โดยอัตโนมัติ  
>    - *ข้อผิดพลาด:* ในไฟล์ `client/src/components/MyTicketsView.tsx` ตัวแปร `STATUSES` (บรรทัดที่ 21) มีเพียง 6 สถานะเดิม (NEW, OPEN, IN_PROGRESS, PENDING, RESOLVED, CLOSED) ขาด WAITING_FOR_REQUESTER, REOPENED, และ CANCELLED ส่งผลให้เมื่อรับค่า `initialStatusFilter: ["WAITING_FOR_REQUESTER"]` เข้ามา ตัวเลือกใน Dropdown ไม่สามารถจับคู่ป้ายกำกับได้ และผู้ใช้ไม่สามารถเลือกหรือยกเลิกตัวเลือกสถานะดังกล่าวบน UI ได้  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มสถานะ WAITING_FOR_REQUESTER, REOPENED, และ CANCELLED ในอาเรย์ `STATUSES` ของ `MyTicketsView.tsx` ให้ครอบคลุมครบทั้ง 9 สถานะของระบบ  
> 
> 2. **การขาดการซิงค์ State เมื่อค่า Props ฟิลเตอร์เริ่มต้นเปลี่ยนแปลง (Filter State Synchronization):**  
>    - *เกณฑ์บังคับ:* Handout Section 6.2 กำหนดให้การ์ดแดชบอร์ดทุกใบสามารถคลิก Drill-down สลับเงื่อนไขการกรองได้ตลอดเวลา  
>    - *ข้อผิดพลาด:* ใน `MyTicketsView.tsx` และ `StaffTicketQueue.tsx` มีการตั้งค่าเริ่มต้นของฟิลเตอร์ผ่าน `useState(initialStatusFilter || [])` และ `useState(initialFilters?.status || "")` เพียงครั้งเดียวขณะ Mount โดยไม่มี `useEffect` ดักจับการเปลี่ยนแปลงของ Props ส่งผลให้เมื่อผู้ใช้นำทางสลับไปมาระหว่างการ์ดต่าง ๆ บนแดชบอร์ด (เช่น จาก My Open Tickets ไปยัง Recently Resolved) ค่าฟิลเตอร์ใหม่จะไม่ถูกซิงค์ลงใน State ภายในของคอมโพเนนต์  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่ม `useEffect` ใน `MyTicketsView.tsx` และ `StaffTicketQueue.tsx` เพื่อตรวจสอบและอัปเดต State ภายในเมื่อ `initialStatusFilter` หรือ `initialFilters` มีการเปลี่ยนแปลง  
> 
> 3. **การขาดหัวข้อบันทึกการรีวิว PR #85 ในเอกสารกระบวนการวิศวกรรม (`docs/lab-04/reviewer.md`):**  
>    - *เกณฑ์บังคับ:* Handout Section 14 (Answer Part 1: Git Use with Engineering Workflow) กำหนดให้เอกสาร reviewer.md ต้องปรากฏหลักฐานการรีวิวของทุก PR ประกอบด้วย ตัวตนผู้ตรวจ ลิงก์ PR ข้อคิดเห็น/ข้อบกพร่องที่พบ (Comments) การตอบกลับของผู้พัฒนา (Responses) และผลการอนุมัติ (Approvals)  
>    - *ข้อผิดพลาด:* ใน `docs/lab-04/reviewer.md` มีเพียงการอัปเดตบรรทัด PR #85 ในตารางสรุปด้านบน แต่ยังไม่มีหัวข้อเนื้อหา Review Round 6 สำหรับ PR #85 ที่บันทึกข้อคิดเห็นการตรวจทาน  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มหัวข้อ Review Round 6: PR #85 ใน `docs/lab-04/reviewer.md` บันทึกรายละเอียดข้อเสนอแนะและเปิดพื้นที่ให้ผู้พัฒนาตอบกลับแผนการดำเนินงาน  
> 
> 4. **การขาดเคสทดสอบอัตโนมัติสำหรับการ Drill-Down สถานะ WAITING_FOR_REQUESTER ใน MyTicketsView:**  
>    - *เกณฑ์บังคับ:* Handout Section 10 กำหนดให้การบูรณาการระบบนำทางและการ Drill-down ต้องได้รับการทดสอบอย่างครอบคลุม  
>    - *ข้อผิดพลาด:* ในชุดทดสอบหน้าบ้าน มีเพียงการทดสอบปุ่มในระดับคอมโพเนนต์ `RequesterDashboard.test.tsx` แต่ยังขาดเคสทดสอบใน `MyTicketsView.test.tsx` ที่ยืนยันว่าการส่ง `initialStatusFilter: ["WAITING_FOR_REQUESTER"]` สามารถกรองและแสดงผลตั๋วสถานะดังกล่าวได้อย่างถูกต้อง  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มเคสทดสอบอัตโนมัติในชุดทดสอบฝั่งหน้าบ้านเพื่อยืนยันพฤติกรรมการกรองสถานะ WAITING_FOR_REQUESTER ผ่าน `initialStatusFilter`  
> 
> ---
> 
> ### Author Response & Action Plan (`@chanya06`):
> ขอบคุณสำหรับข้อเสนอแนะในการตรวจสอบส่วนต่อประสานผู้ใช้และการ Drill-down ที่ละเอียดและมีประโยชน์อย่างยิ่ง ได้ดำเนินการปรับปรุงแก้ไขในสาขา `feature/34-dashboard-ui` ครบทั้ง 4 ประเด็นเรียบร้อยแล้ว:
> 
> 1. **เพิ่มสถานะ `WAITING_FOR_REQUESTER`, `REOPENED`, และ `CANCELLED` ใน `MyTicketsView.tsx` และ `server/src/app.ts`:**
>    - ใน `client/src/components/MyTicketsView.tsx` เพิ่มทั้ง 3 สถานะลงในอาเรย์ `STATUSES` ทำให้ตัวเลือกใน Dropdown แสดงผลครบทั้ง 9 สถานะของระบบ รองรับการเลือก/ยกเลิกตัวเลือก และจับคู่ป้ายกำกับของปุ่ม Multi-select Filter ได้อย่างสมบูรณ์
>    - อัปเดตฟังก์ชัน `getStatusBadgeClass` ใน `MyTicketsView.tsx` ให้แสดง Badge สอดคล้องกับสถานะใหม่ (`WAITING_FOR_REQUESTER` สี Amber, `REOPENED` สี Danger, `CANCELLED` สี Secondary)
>    - อัปเดต `VALID_STATUSES` ใน `server/src/app.ts` ให้ครอบคลุมครบ 9 สถานะ ป้องกันข้อผิดพลาด HTTP 400 Bad Request เมื่อคิวรีกรองสถานะจากฝั่ง Server
> 2. **ซิงโครไนซ์ State ของฟิลเตอร์เมื่อ Props มีการเปลี่ยนแปลง (Filter State Synchronization):**
>    - ใน `client/src/components/MyTicketsView.tsx` เพิ่ม `useEffect` ตรวจสอบการเปลี่ยนแปลงของ `initialStatusFilter` (ผ่าน Sorted Key Dependency พร้อม Guard `isFirstRender`) เพื่ออัปเดต `selectedStatuses` และรีเซ็ต `page` เป็น 1 เมื่อมีการคลิก Drill-down จากการ์ดใด ๆ บน Dashboard
>    - ใน `client/src/components/StaffTicketQueue.tsx` เพิ่ม `useEffect` ตรวจสอบการเปลี่ยนแปลงของ `initialFilters` (`category`, `status`, `priority`, `owner`) เพื่ออัปเดต State ภายในและรีเซ็ต `page` เป็น 1 เมื่อเจ้าหน้าที่คลิกสลับการ์ด Drill-down บน Staff Dashboard
> 3. **บันทึกหลักฐานการรีวิว PR #85 ใน `docs/lab-04/reviewer.md`:**
>    - บันทึกรายละเอียด Review Round 6 สำหรับ PR #85 ครบถ้วนตามเกณฑ์ Handout Section 14 (Answer Part 1)
>    - อัปเดตสถานะ PR #85 ในตารางสรุปเป็น `Changes Requested (Resolved) | In Review`
> 4. **เพิ่มเคสทดสอบอัตโนมัติสำหรับการ Drill-down ในชุดทดสอบหน้าบ้าน:**
>    - เพิ่มเคส `"filters and fetches tickets with WAITING_FOR_REQUESTER when initialStatusFilter is provided"` ใน `client/tests/lab-02/MyTickets.test.tsx`
>    - เพิ่มเคส `"synchronizes status filter when initialStatusFilter prop changes dynamically (drill-down)"` ใน `client/tests/lab-02/MyTickets.test.tsx`
>    - เพิ่มเคส `"includes all 9 statuses in the status filter dropdown options"` ใน `client/tests/lab-02/MyTickets.test.tsx`
>    - เพิ่มเคส `"synchronizes filter states when initialFilters prop changes dynamically"` ใน `client/tests/lab-03/StaffTicketQueue.test.tsx`
>    - ชุดทดสอบ Client ทั้งหมด 18 ไฟล์ (153 tests) ผ่านครบ 100%



---

### Reviewer Comments on [PR #86](https://github.com/chanya06/toktickit/pull/86) (feature/35-ticket-workflow-hardening) - Review Round 7

> **Reviewer:** `@lmaybelgracel` — **Verdict:** CHANGES REQUESTED  
> จากการตรวจทานการบังคับใช้กฎวงจรสถานะตั๋ว (Ticket Workflow Hardening), กลไก Resolution Gate และการควบคุมการทำงานพร้อมกัน (Concurrency Control) ใน PR [#86](https://github.com/chanya06/toktickit/pull/86) (สาขา feature/35-ticket-workflow-hardening) เทียบกับเกณฑ์บังคับของอาจารย์ใน Handout Lab 4 (Sections 4.5, 6.2, 10 และ 14) และสัญญาข้อกำหนด specification.md / ui-spec.md พบข้อบกพร่องสำคัญ 4 จุดที่ต้องได้รับการปรับปรุงแก้ไขก่อนการอนุมัติ:  
> 
> 1. **การขาดปุ่มหรือส่วนควบคุมให้ Requester ทำการ Reopen ตั๋วที่สถานะเป็น RESOLVED บนหน้าจอ TicketDetailView (FR-13 / AC-10):**  
>    - *เกณฑ์บังคับ:* Handout Section 4.5, 6.2 และ specification.md (FR-13 / AC-10) กำหนดให้ผู้แจ้งตั๋ว (Requester) มีสิทธิ์เปิดตั๋วใหม่ (Reopen) จากสถานะ RESOLVED ได้เมื่อปัญหาเกิดขึ้นซ้ำ  
>    - *ข้อผิดพลาด:* ฝั่งเซิร์ฟเวอร์มีการสร้างเส้นทาง PATCH /api/tickets/:id/status อนุญาตให้ Requester ส่งคำขอเปลี่ยนสถานะตั๋วจาก RESOLVED เป็น REOPENED เรียบร้อยแล้ว แต่ในฝั่งหน้าบ้าน `client/src/components/TicketDetailView.tsx` กล่องการจัดการตั๋ว (`staff-operations-panel`) ถูกจำกัดการแสดงผลเฉพาะ IT Staff และ Admin (`isStaffOrAdmin`) เท่านั้น โดยไม่มีปุ่มหรือการควบคุมใด ๆ ให้ Requester กด Reopen บนหน้าจอเมื่อตั๋วมีสถานะเป็น RESOLVED  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มปุ่ม "Reopen Ticket" (พร้อมช่องกรอกหรือคำยืนยันระบุเหตุผล) ให้แสดงผลสำหรับผู้ใช้ที่เป็นเจ้าของตั๋ว (Requester) เมื่อตั๋วอยู่ในสถานะ RESOLVED บน `TicketDetailView.tsx`  
> 
> 2. **การขาดช่องกรอกเหตุผลการปิดงาน (Resolution Note Input) เมื่อเปลี่ยนสถานะตั๋วสู่ RESOLVED บน UI:**  
>    - *เกณฑ์บังคับ:* Handout Section 4.5, 6.2 และ specification.md กำหนดว่าเมื่อเปลี่ยนสถานะตั๋วเป็น RESOLVED ต้องสามารถบันทึกข้อความสรุปการแก้ไขปัญหา (Resolution Note) ซึ่งจะถูกบันทึกเป็น Public Comment ต่อท้ายตั๋วโดยอัตโนมัติ  
>    - *ข้อผิดพลาด:* ใน `server/src/routes/staff.ts` และ `client/src/api.ts` ฟังก์ชัน `updateTicketStatus` รองรับพารามิเตอร์ `resolutionNote` เรียบร้อยแล้ว แต่ใน `TicketDetailView.tsx` เมื่อผู้ใช้เลือกสถานะถัดไปเป็น RESOLVED ไม่มีช่อง Input หรือ Modal ให้กรอก `resolutionNote` และฟังก์ชัน `handleExecuteStatusTransition` ไม่มีการส่ง `resolutionNote` ไปยัง API  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มช่องกรอก `resolutionNote` (หรือ Modal ยืนยันการปิดงาน) บน `TicketDetailView.tsx` เมื่อผู้ใช้เลือกเปลี่ยนสถานะเป็น RESOLVED และส่งค่านั้นไปยัง `updateTicketStatus`  
> 
> 3. **การขาดหัวข้อบันทึกการรีวิว PR [#86](https://github.com/chanya06/toktickit/pull/86) ในเอกสารกระบวนการวิศวกรรม (`docs/lab-04/reviewer.md`):**  
>    - *เกณฑ์บังคับ:* Handout Section 14 (Answer Part 1: Git Use with Engineering Workflow) กำหนดให้เอกสาร reviewer.md ต้องปรากฏหลักฐานการรีวิวของทุก PR ประกอบด้วย ตัวตนผู้ตรวจ ลิงก์ PR ข้อคิดเห็น/ข้อบกพร่องที่พบ (Comments) การตอบกลับของผู้พัฒนา (Responses) และผลการอนุมัติ (Approvals)  
>    - *ข้อผิดพลาด:* ใน `docs/lab-04/reviewer.md` มีเพียงการอัปเดตบรรทัด PR [#86](https://github.com/chanya06/toktickit/pull/86) ในตารางสรุปด้านบน (Pending Review | In Review) แต่ยังไม่มีหัวข้อเนื้อหา Review Round 7 สำหรับ PR [#86](https://github.com/chanya06/toktickit/pull/86) ที่บันทึกข้อคิดเห็นการตรวจทาน  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มหัวข้อ Review Round 7: PR [#86](https://github.com/chanya06/toktickit/pull/86) ใน `docs/lab-04/reviewer.md` บันทึกรายละเอียดข้อเสนอแนะและเปิดพื้นที่ให้ผู้พัฒนาตอบกลับแผนการดำเนินงาน  
> 
> 4. **การขาดเคสทดสอบอัตโนมัติสำหรับ Requester Reopen Action ในชุดทดสอบหน้าบ้าน (`TicketWorkflow.test.tsx`):**  
>    - *เกณฑ์บังคับ:* Handout Section 10 กำหนดให้การทำงานของ Workflow และการอนุญาตตามบทบาทผู้ใช้บน UI ต้องมีชุดทดสอบอัตโนมัติรองรับอย่างครอบคลุม  
>    - *ข้อผิดพลาด:* ใน `client/tests/lab-04/TicketWorkflow.test.tsx` มีเฉพาะเคส UI-06h ที่ทดสอบว่าซ่อน staff-operations-panel เมื่อผู้ใช้เป็น Requester แต่ยังขาดเคสทดสอบยืนยันว่าเมื่อ Requester เปิดดูตั๋วสถานะ RESOLVED จะต้องมองเห็นและสามารถกดปุ่ม Reopen เพื่อเรียก API เปลี่ยนสถานะเป็น REOPENED ได้  
>    - *สิ่งที่ต้องแก้ไข:* เพิ่มเคสทดสอบอัตโนมัติใน `TicketWorkflow.test.tsx` ยืนยันการแสดงผลปุ่ม Reopen และการเรียกใช้ API ของ Requester สำหรับตั๋วสถานะ RESOLVED  
> 
> ---
> 
> ### Author Response & Action Plan (`@chanya06`):
> ขอบคุณสำหรับข้อเสนอแนะการตรวจทานเชิงลึกของวงจรสถานะตั๋วและสิทธิ์ผู้ใช้งาน ได้ดำเนินการปรับปรุงแก้ไขในสาขา `feature/35-ticket-workflow-hardening` ครบทั้ง 4 ประเด็นเรียบร้อยแล้ว:
> 
> 1. **เพิ่มปุ่มและ Modal สำหรับ Requester ในการ Reopen ตั๋วสถานะ RESOLVED บน `TicketDetailView.tsx`:**
>    - เพิ่มการตรวจสอบสิทธิ์ `canRequesterReopen = (!user || user.role === "REQUESTER") && ticket?.status === "RESOLVED"`
>    - เพิ่มปุ่ม "Reopen Ticket" บน Header Action Bar (`reopen-ticket-btn`) และแบนเนอร์แจ้งเตือนสถานะตั๋วปิดงานสำหรับ Requester (`requester-reopen-banner` และ `banner-reopen-ticket-btn`)
>    - เพิ่ม Reopen Ticket Modal (`reopen-ticket-modal`) พร้อมช่องกรอกเหตุผลการเปิดตั๋วใหม่ (`reopen-reason-input`) เมื่อยืนยันจะเรียก `updateTicketStatus(ticketId, "REOPENED", ticket.updatedAt, reason)` และบันทึก Reopen Reason เป็น Public Comment
>    - ปรับปรุง `client/src/api.ts` ในฟังก์ชัน `updateTicketStatus` ให้เรียก Endpoint `${API_URL}/api/tickets/${ticketId}/status` ซึ่งรองรับสิทธิ์ของ Requester แทนเส้นทาง staff-only
> 2. **เพิ่มช่องกรอก Resolution Note เมื่อเปลี่ยนสถานะเป็น RESOLVED บน UI:**
>    - เพิ่ม Textarea `resolution-note-input` ภายใต้การควบคุมสถานะใน Staff Operations Panel ซึ่งจะแสดงผลทันทีเมื่อเจ้าหน้าที่เลือกสถานะถัดไปเป็น `RESOLVED`
>    - ปรับปรุงฟังก์ชัน `handleExecuteStatusTransition` ให้ส่ง `resolutionNote` เป็นอาร์กิวเมนต์ที่ 4 ไปยัง `updateTicketStatus` เพื่อให้เซิร์ฟเวอร์นำไปบันทึกเป็น Public Comment ต่อท้ายตั๋วโดยอัตโนมัติ
> 3. **บันทึกหลักฐานการรีวิว PR #86 ใน `docs/lab-04/reviewer.md`:**
>    - บันทึกรายละเอียด Review Round 7 สำหรับ PR #86 ครบถ้วนตามเกณฑ์ Handout Section 14 (Answer Part 1)
>    - อัปเดตสถานะ PR #86 ในตารางสรุปเป็น `Changes Requested (Resolved) | In Review`
> 4. **เพิ่มเคสทดสอบอัตโนมัติสำหรับ Requester Reopen และ Resolution Note ใน `TicketWorkflow.test.tsx`:**
>    - เพิ่มเคส `UI-06i`: ทดสอบการแสดงผลปุ่ม Reopen Ticket และ Requester Reopen Banner เมื่อ Requester ดูตั๋วสถานะ RESOLVED
>    - เพิ่มเคส `UI-06j`: ทดสอบการเปิด Reopen Modal, การกรอกเหตุผล และการส่งคำขอเปลี่ยนสถานะตั๋วเป็น REOPENED พร้อมตรวจสอบ Argument ที่ส่งไปยัง `updateTicketStatus`
>    - เพิ่มเคส `UI-06k`: ทดสอบการแสดงผลช่อง Resolution Note เมื่อเลือก RESOLVED และตรวจสอบการส่ง Note ร่วมกับการเปลี่ยนสถานะ
>    - ชุดทดสอบ Client ทั้งหมด 19 ไฟล์ (164 tests) และ Server ทั้งหมด 21 ไฟล์ (207 tests) ผ่านครบ 100% (รวม 371 tests)

---

### Reviewer Approval on [PR #87](https://github.com/chanya06/toktickit/pull/87) (feature/36-qa-regression-and-deliverables)

> **Reviewer:** `@lmaybelgracel` — **Verdict:** APPROVED  
> ### Peer Review: QA Automated Tests, Regression Suite, Screenshots & Release Deliverable (PR #87) - Approved  
> ได้ทำการตรวจทานโค้ด ชุดทดสอบ E2E ภาพหลักฐานการทดสอบ และเล่มเอกสารส่งงานฉบับสมบูรณ์ใน PR #87 อย่างละเอียดครบถ้วน:  
> 1. **Playwright E2E Test Suites (`e2e/lab-04/`):** ชุดทดสอบอัตโนมัติทั้ง 3 มิติ (`dashboards.spec.ts`, `actions-taken-flow.spec.ts`, `ticket-resolution.spec.ts`) ครอบคลุมการทำงานตั้งแต่การแสดงผล Metric Cards, Drill-down, วงจร Action Taken, การป้องกัน Safe Failure (BR-04, BR-05), Resolution Gate Preconditions (BR-08) ไปจนถึง Requester Reopen Flow (FR-13 / AC-10) อย่างสมบูรณ์และเป็น Idempotent  
> 2. **Visual Proofs & Responsive Audit (`artifacts/lab-04/screenshots/`):** มีไฟล์ภาพหลักฐานครบทั้ง 26 ภาพ ครอบคลุม 3 Viewports (Desktop, Tablet, Mobile) พร้อมภาพยืนยันการไม่มี Horizontal Overflow บนหน้าจอมือถือ 375px และ Keyboard Focus Indicators ตามเกณฑ์ WCAG AA  
> 3. **Engineering Deliverables (`docs/lab-04/`):** เอกสาร `final-deliverable.md` จัดทำเนื้อหาครอบคลุม Answer Parts 1–9 ครบถ้วนตาม Handout Section 14 และไฟล์เล่มรายงาน `final-deliverable.pdf` (ขนาด 4.8 MB) ถูกสร้างและจัดหน้าอย่างประณีต พร้อมสำหรับการส่งมอบงาน  
> 4. **Test & Build Integrity:** ชุดทดสอบ Regression รวมทั้งระบบ (375 tests) ผ่านครบ 100% และผ่านการทดสอบ Production Build ไร้ข้อผิดพลาด  
> 
> อนุมัติ (APPROVE) ให้ Merge เข้าสู่สาขา `lab4-staging` ได้ทันที

---

## 4. Verbatim Review Comments Provided to Partner (@phatthidawadi)

### My Review Comment on Partner PR [#72](https://github.com/phatthidawadi/toktickit/pull/72):
> โดยรวมเอกสารครอบคลุมโจทย์ Lab 4 ดี โดยเฉพาะ Actions Taken, dashboard, UI spec และ traceability ของ test plan
>
> มี 4 จุดที่อยากให้แก้ก่อน approve:
> 1. Ticket transition กับ authorization ยังไม่ตรงกัน
>    ใน specification.md ระบุว่า Requester สามารถเปลี่ยนสถานะ RESOLVED → CLOSED/REOPENED ได้ แต่ api-spec.md ระบุว่า endpoint เปลี่ยน status ใช้ได้เฉพาะ IT Staff/Admin และ UI เป็นแนวให้ Requester ดูข้อมูลอย่างเดียว
>    อยากให้เลือก behavior ที่ต้องการให้ชัด แล้วปรับ specification, API spec, UI spec และ tests ให้ตรงกัน
> 2. Optimistic locking ยังไม่ชัด
>    BR-10 บอกว่า mutation ทุกตัวต้องส่ง version แต่ API spec ของ status update เขียนว่า version optional และ resolve-ack / cancel ยังไม่มี version ใน request contract
>    ควรกำหนดให้ชัดว่า endpoint ไหนต้องใช้ version แล้วทำให้ request, response, error และ test สอดคล้องกัน
> 3. Test plan ยังขาด performance-smoke coverage
>    ตาม handout ต้องมี performance-smoke test แต่ใน tests.md ยังไม่เห็น test กลุ่มนี้
>    แนะนำเพิ่ม test สำหรับ dashboard query หรือ action list โดยมีเกณฑ์ตรวจสอบที่ชัดเจน
> 4. ไฟล์ประกอบ Lab 4 ยังไม่ครบ
>    Handout ระบุให้มี docs/lab-04/reviewer.md และ docs/lab-04/ai-use.md เพิ่มด้วย ตอนนี้ PR มีเฉพาะ 4 ไฟล์หลัก
>    ถ้าตั้งใจแยกไป PR ถัดไปก็ได้ แต่ควรวางแผนให้ครบก่อนส่งงาน

### Partner Response (@phatthidawadi on PR #72):
> ดำเนินการแก้ไขและปรับความสอดคล้องทั้ง 4 จุดเรียบร้อยแล้วใน commit 3d7531a:
>
> 1. **Ticket Transition & Authorization Alignment:**
>    - กำหนดให้การเปลี่ยนสถานะตั๋วอย่างเป็นทางการ (Formal Status Transition) รวมถึง `RESOLVED -> CLOSED` และ `RESOLVED -> REOPENED` ดำเนินการโดย **`IT_STAFF` และ `ADMINISTRATOR` เท่านั้น** ผ่าน `PATCH /api/staff/tickets/:id/status` (Requesters ได้รับ HTTP 403 Forbidden)
>    - บทบาทของ Requester ต่อสถานะตั๋วมีเพียง:
>      - ยกเลิกตั๋วของตนเองเมื่ออยู่ในสถานะ `NEW`: `NEW -> CANCELLED` ผ่าน `PATCH /api/tickets/:id/cancel`
>      - ส่งความเห็นเชิงแนะนำผ่าน Toggle "Problem Appears Resolved" ผ่าน `PATCH /api/tickets/:id/resolve-ack` ซึ่งเป็นเพียง Advisory indicator (`isRequesterResolved = true`) แต่ไม่เปลี่ยนสถานะตั๋ว
>      - ระบบ auto-transition ตั๋วจาก `WAITING_FOR_REQUESTER -> IN_PROGRESS` อัตโนมัติเมื่อ Requester ตอบคอมเมนต์ (BR-09)
>    - ปรับปรุงให้สอดคล้องกันครบทั้ง `specification.md` (ตาราง 5.1, 5.2), `api-spec.md` (§3.1), `ui-spec.md` (§3.5), และ `tests.md`
>
> 2. **Optimistic Locking & Mandatory Versioning:**
>    - กำหนดให้ทุก mutation บน Ticket (`/api/staff/tickets/:id/status`, `/api/tickets/:id/resolve-ack`, `/api/tickets/:id/cancel`) และ Action Taken (`/api/actions/:id`) ต้องส่ง `"version": <integer>` เป็น **Mandatory field** ใน Request body เสมอ
>    - หาก `version` ไม่ตรงกับฐานข้อมูลจะถูก reject ด้วย HTTP `409 Conflict` (`CONCURRENCY_CONFLICT`)
>    - อัปเดต contracts, error schema และ test cases (`ACT-API-09`, `FLOW-API-06`, `FLOW-API-07`, `FLOW-API-08`) ครบถ้วน
>
> 3. **Performance-Smoke Test Coverage:**
>    - เพิ่มหมวด Performance-Smoke Tests ใน `tests.md` (§2.4) ได้แก่:
>      - `PERF-SMK-01`: Dashboard queries benchmark (`/api/dashboard/requester`, `/api/dashboard/staff`) latency p95 < 200ms ภายใต้ฐานข้อมูล 100+ tickets
>      - `PERF-SMK-02`: Actions Taken query latency (`/api/tickets/:id/actions`) latency p95 < 150ms สำหรับ ticket ที่มี 20+ action lines
>      - `PERF-SMK-03`: Burst concurrency conflict throughput (10 concurrent requests) latency เฉลี่ย < 300ms
>    - เพิ่ม `AC-17 (Performance-Smoke Benchmarks)` ใน `specification.md` และแมปลงใน Traceability Matrix (100% covered)
>
> 4. **ไฟล์ประกอบ Lab 4:**
>    - ได้เพิ่มไฟล์ `docs/lab-04/reviewer.md` และ `docs/lab-04/ai-use.md` เข้ามาใน PR นี้เรียบร้อยแล้ว ทำให้โครงสร้างโฟลเดอร์ `docs/lab-04/` มีครบทั้ง 6 ไฟล์ตามเกณฑ์ Handout Section 12
>
> รบกวนตรวจสอบอีกครั้งนะ

---

### My Round 2 Review Comment on Partner PR [#72](https://github.com/phatthidawadi/toktickit/pull/72):
> ตรวจรอบล่าสุดแล้ว 4 ประเด็นหลักแก้ได้ดีขึ้นมาก โดยเฉพาะ mandatory versioning, performance-smoke tests และการเพิ่มไฟล์ประกอบ Lab 4  
>
> เหลือขอแก้อีก 3 จุดก่อน approve:
> 1. PATCH /api/tickets/:id/cancel ยังระบุสิทธิ์ไม่ตรงกันระหว่าง api-spec.md กับ specification.md ว่า Staff/Admin ใช้ได้หรือไม่
> 2. reviewer.md ระบุว่า PR #72 “Approved with comments” แล้ว แต่ตอนนี้ยังอยู่ระหว่างรีวิว ขอให้เปลี่ยนเป็น Changes requested หรือ Under review ก่อน
> 3. เพิ่ม Performance-Smoke Tests แล้ว แต่ tests.md และ ai-use.md ยังระบุว่ามีเพียง 8 coverage layers ควรอัปเดตเป็น 9 layers
> แก้ 3 จุดนี้แล้วส่งมาได้เลย

### Partner Round 2 Response (@phatthidawadi on PR #72):
> ดำเนินการปรับปรุงแก้ไขทั้ง 3 จุดเรียบร้อยแล้วใน commit a50f408:
>
> 1. **ปรับสิทธิ์ `PATCH /api/tickets/:id/cancel` ให้ตรงกัน:**
>    - ปรับใน `api-spec.md` (§3.3) ให้ตรงกับ `specification.md` (BR-08, §8.2) และ `ui-spec.md` (§3.5) อย่างสมบูรณ์:
>      - `PATCH /api/tickets/:id/cancel` กำหนด Authorized Role เป็น **`REQUESTER` (owned ticket in `NEW` status only)** สำหรับการถอนตั๋วก่อน triage
>      - ระบุหมายเหตุชัดเจนว่า `IT_STAFF` และ `ADMINISTRATOR` ทำการ cancel ตั๋วผ่าน endpoint หลัก `PATCH /api/staff/tickets/:id/status` ด้วย payload `{ "status": "CANCELLED", "version": <int> }` ซึ่งรองรับการยกเลิกจากหลายสถานะ (`NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`) ตาม Transition Matrix
>
> 2. **อัปเดตสถานะใน `reviewer.md`:**
>    - ปรับสถานะของ PR #72 ในตารางเป็น **`Under review (Changes requested)`** และ Status เป็น **`Under Review`** ให้ตรงกับสถานะจริงในระหว่างรีวิว และเพิ่มบันทึก Round 2 logs เรียบร้อยครับ
>
> 3. **อัปเดต Coverage Layers เป็น 9 Layers ครบทุกจุด:**
>    - ใน `docs/lab-04/tests.md`:
>      - อัปเดต §1 เป็น **9 Coverage Layers** โดยเพิ่มข้อ *9. Performance-Smoke Tests: Latency benchmarks across dashboard aggregations (< 200ms), actions chronological queries (< 150ms), and burst concurrency conflict throughput under operational loads.*
>      - อัปเดตเกณฑ์ความครอบคลุมเป็น `FR-01` ถึง `FR-12`, `BR-01` ถึง `BR-16`, และ `AC-01` ถึง `AC-17`
>    - ใน `docs/lab-04/ai-use.md`:
>      - อัปเดตข้อความใน Prompt log และ Reflection ให้ระบุ 9 coverage layers สอดคล้องกันทั้งหมด
>
> ตอนนี้เนื้อหาครบถ้วนและสอดคล้องกัน 100% แล้ว รบกวนตรวจสอบอีกครั้ง

---

### My Approval Verdict on Partner PR [#72](https://github.com/phatthidawadi/toktickit/pull/72):
> ตรวจแล้ว 3 จุดที่เหลือแก้ครบและสอดคล้องกันแล้ว:
> - cancel endpoint จำกัดเฉพาะ Requester เจ้าของ ticket ที่สถานะ NEW; Staff/Admin ใช้ status endpoint หลัก
> - reviewer.md เปลี่ยนเป็น Under review (Changes requested) แล้ว
> - tests.md และ ai-use.md อัปเดตเป็น 9 coverage layers และครอบคลุม AC-17 แล้ว

---

### My Review Comment on Partner PR [#73](https://github.com/phatthidawadi/toktickit/pull/73):
> ตรวจสอบโค้ดจริงของ PR #73 ครอบคลุม Prisma Schema, Migration SQL, Database Seed, REST APIs และ Automated Tests เทียบกับข้อกำหนด Lab 4 Handout และ engineering contract ใน `docs/lab-04/`:
>
> 1. **Data Model & Migration:**
>    - โมเดล `ActionTaken` มีฟิลด์ครบตาม Handout Section 4.1 (`actionDateTime`, `description`, `result`, `performedById`, `followUpRequired`, `followUpNote`, `attachmentNotes`, `assigneeId`, `status`)
>    - Foreign Keys ถูกต้อง: `ticket` (Cascade delete), `performedBy` (Restrict), `assignee` (SetNull)
>    - Migration `20261015000000_init_lab4_actions_taken` ปลอดภัย เป็น non-destructive มี `IF NOT EXISTS` ไม่กระทบข้อมูลเดิม
>
> 2. **Seed Data:**
>    - `server/prisma/seed.ts` มี sample tickets ครบทั้ง 3 กรณีตาม Handout §5.3:
>      - Ticket 1 (`TKT-2026-000001`): มี 2 actions (Completed 1, In Progress 1)
>      - Ticket 2 (`TKT-2026-000002`): Legacy ticket มี 0 actions
>      - Ticket 3 (`TKT-2026-000003`): Resolved ticket มี 1 action
>    - Seed logic ทำงานแบบ idempotent (`findFirst` check)
>
> 3. **REST APIs & Authorization:**
>    - `POST /api/tickets/:id/actions`: ป้องกัน Requester ด้วย 403, `performedById` ดึงจาก Session Token อัตโนมัติ, ตรวจสอบ assignee ต้องเป็น active IT Staff หรือ Admin
>    - `GET /api/tickets/:id/actions`: Requester ดูได้เฉพาะตั๋วที่ตนเองเป็นเจ้าของ (ดูของคนอื่นตอบ 403 `FORBIDDEN`), เรียงลำดับ `actionDateTime ASC, id ASC` สม่ำเสมอ
>    - `PATCH /api/actions/:id`: ตรวจสอบ version mismatch แล้วส่ง `409 CONCURRENCY_CONFLICT` ตาม BR-10
>
> 4. **Automated Tests:**
>    - `server/tests/lab-04/actions-taken.api.test.ts` มี 10 test cases (`ACT-API-01` ถึง `ACT-API-09` และ `MIG-API-01`) ยืนยันพฤติกรรมครบทุกเงื่อนไข
>
> **ข้อเสนอแนะเพิ่มเติม (Non-blocking):**
> - ใน `PATCH /api/actions/:id` สามารถปรับให้ version check เป็น atomic update ผ่าน `updateMany` ในระดับ database ได้
> - อัปเดตตารางใน `docs/lab-04/reviewer.md` ให้ใส่ลิงก์ `[PR #73]`

### Partner Response (@phatthidawadi on PR #73):
> ขอบคุณสำหรับคำแนะนำและการตรวจทานโค้ดอย่างละเอียดครับ ได้ดำเนินการปรับปรุงทั้ง 2 จุดตามข้อเสนอแนะเรียบร้อยแล้ว:
>
> 1. **Atomic Version Check ใน `PATCH /api/actions/:id`:**
>    - ปรับปรุงการอัปเดตข้อมูลให้ใช้ `prisma.actionTaken.updateMany` โดยกำหนดเงื่อนไข `where: { id: actionId, version }` และ `version: { increment: 1 }` โดยตรงในระดับฐานข้อมูล ทำให้การตรวจสอบและเพิ่มค่า version เกิดขึ้นแบบ Atomic Operation ป้องกัน Concurrency Race Condition ระหว่าง concurrent requests ได้ 100%
>
> 2. **อัปเดตตารางใน `reviewer.md`:**
>    - บันทึกลิงก์ `[PR #73]` และระบุผลการตรวจทานเป็น `Approved with comments` พร้อมบันทึกข้อคิดเห็นจากรีวิวและการตอบกลับอย่างครบถ้วน

---

### My Approval Verdict on Partner PR [#73](https://github.com/phatthidawadi/toktickit/pull/73):
> ### Re-review — PR #73 (Round 2) — 
> 
> ตรวจ head ล่าสุด commit `0412dc5` และยืนยันผลจากโค้ดจริงทุกจุดเรียบร้อยแล้วค่ะ จุดที่ให้ข้อเสนอแนะไว้ในรอบแรกแก้ไขได้ถูกต้อง รัดกุม และสมบูรณ์แบบมากค่ะ:
> 
> 1. ✅ **Atomic Optimistic Concurrency Update (`server/src/app.ts`)**:
>    - ปรับ `PATCH /api/actions/:id` มาใช้ `prisma.actionTaken.updateMany` โดยระบุเงื่อนไข `where: { id: actionId, version }` และ `version: { increment: 1 }`
>    - ตรวจจับ `updateResult.count === 0` ตอบกลับ `409 CONCURRENCY_CONFLICT` ทันที ทำให้การล็อกและตรวจสอบ version เป็น Atomic Operation ในระดับฐานข้อมูล PostgreSQL ป้องกัน Concurrency Race Condition ระหว่าง concurrent requests ได้ 100%
> 
> 2. ✅ **Peer Review Record Updated (`docs/lab-04/reviewer.md`)**:
>    - อัปเดตตารางสถานะของ `[PR #73]` เป็น **`Approved with comments`** เรียบร้อย
>    - บันทึกรายละเอียดข้อเสนอแนะจาก Reviewer และคำชี้แจงการแก้ไขจาก Author ครบถ้วนตามมาตรฐานกระบวนการของรายวิชา
> 
> 3. ✅ **Test Suite & Verification**:
>    - ชุดทดสอบ Actions Taken API (`ACT-API-01` ถึง `ACT-API-09` และ `MIG-API-01`) ผ่านครบ 10/10 tests
>    - ชุดทดสอบ Full Regression ฝั่ง Server ผ่าน 94/94 tests ครอบคลุม 19 test files และ Client Production Build ผ่านสมบูรณ์

---

### My Review Comment on Partner PR [#74](https://github.com/phatthidawadi/toktickit/pull/74):
> ตรวจทานโค้ดจริงทั้งหมดใน branch `feature/28-actions-taken-ui` เทียบกับ **Lab 4 Handout (§4.3, §8.3)**, `specification.md`, `ui-spec.md` และ `tests.md` อย่างละเอียดเรียบร้อยแล้ว:
>
> 1. ✅ **Component Integration & Role-Based Visibility**:
>    - นำคอมโพเนนต์ `ActionsTakenSection` ไปฝังในทั้ง `StaffTicketDetail.tsx` (Staff/Admin) และ `TicketDetailView.tsx` (Requester) ได้อย่างถูกต้อง
>    - แยกสิทธิ์ชัดเจน: Requester เห็นประวัติการทำงานแบบ Read-only (ซ่อนปุ่มสร้างและแก้ไขทั้งหมด) ขณะที่ Staff/Admin มีปุ่ม `+ Record Action` และปุ่ม `Edit` ครบถ้วนตาม Handout §4.3
>
> 2. ✅ **Responsive Design & Dual Layout**:
>    - รองรับการแสดงผลแบบตารางบน Desktop/Tablet ($\ge$ 768px) และสลับเป็น Stacked Cards บน Mobile (< 768px) อัตโนมัติ ป้องกันปัญหาหน้าจอล้น (No horizontal scrolling)
>    - ปุ่มกดสำคัญผ่านเกณฑ์ Touch Target $\ge$ 44px และมี Visible Focus Ring (`2px solid #0B7A46`) ตามมาตรฐาน Zen Green Theme
>
> 3. ✅ **Validation & Dynamic UX**:
>    - ตรวจสอบฟิลด์บังคับ Description และ Result (1–2,000 ตัวอักษร) พร้อม Toggle กล่องข้อความ Follow-up Note สีเหลืองอำพัน (`#FEF3C7`) เฉพาะเมื่อต้องการงานติดตามต่อ
>    - เชื่อมต่อ Dropdown ผู้รับผิดชอบกับ Endpoint `GET /api/staff/assignees` ที่กรองเฉพาะ active IT Staff/Admin อย่างรัดกุม
>
> 4. ✅ **Optimistic Concurrency Conflict Handling (HTTP 409)**:
>    - จัดการ Conflict ในระดับ UI ได้อย่างนุ่มนวล โดยแสดงแบนเนอร์แจ้งเตือนพร้อมปุ่ม `Reload Latest Data` เพื่อดึงเวอร์ชันล่าสุดมาให้แก้ไขใหม่โดยไม่ทำลายข้อมูลที่ผู้ใช้พิมพ์ค้างไว้
>
> 5. ✅ **Automated Tests**:
>    - ชุดทดสอบ `client/tests/lab-04/ActionsTaken.test.tsx` ครอบคลุมครบทั้ง 5 เคส (`UI-ACT-01` ถึง `UI-ACT-05`) ผ่าน 100%
>
> **ข้อเสนอแนะเพิ่มเติม (Non-blocking):**
> - ใน `docs/lab-04/api-spec.md` แนะนำเพิ่มการบันทึก Endpoint ใหม่ `GET /api/staff/assignees` ที่เพิ่มเข้ามาใน PR นี้ เพื่อให้เอกสารสัญญาตรงกับโค้ดจริง
> - สามารถพิจารณาเพิ่ม Keyboard Event Listener ดักจับปุ่ม `Escape` สำหรับการปิด Modal เพื่อเพิ่มความสะดวกในการใช้งานผ่านคีย์บอร์ด

### Partner Response (@phatthidawadi on PR #74):
> ขอบคุณสำหรับข้อเสนอแนะและการตรวจทานโค้ดอย่างละเอียดครับ ได้ดำเนินการปรับปรุงและตอบสนองทั้ง 2 ข้อเรียบร้อยแล้ว:
>
> 1. **บันทึกเอกสาร API Spec (`GET /api/staff/assignees`):**
>    - เพิ่มการบันทึก Endpoint `GET /api/staff/assignees` ใน `docs/lab-04/api-spec.md` (หัวข้อ 2.4 List Eligible Staff Assignees) พร้อมรายละเอียด Authorized Roles (`IT_STAFF`, `ADMINISTRATOR`), Request Headers และตัวอย่าง JSON Response ของเจ้าหน้าที่ที่พร้อมรับงานอย่างสมบูรณ์
>
> 2. **เพิ่ม Keyboard Event Listener ปิด Modal ด้วยปุ่ม `Escape`:**
>    - เพิ่ม `useEffect` ดักจับ `keydown` Event บน window เพื่อตรวจสอบ `e.key === "Escape"` เมื่อเปิด Record Modal หรือ Edit Modal อยู่ ให้เรียกสั่งปิด `closeModals()` พร้อม Clean-up Event Listener อย่างถูกต้องตามมาตรฐาน WCAG 2.1 AA Keyboard Accessibility
>
> ได้รันชุดทดสอบ Client Tests ผ่าน 5/5 tests และ Client Production Build ผ่าน 100% เรียบร้อยครับ

---

### My Approval Verdict on Partner PR [#74](https://github.com/phatthidawadi/toktickit/pull/74):
> ### Review — PR #74: Actions Taken UI (Issue #28)
> 
> ตรวจโค้ดจริงบน branch `feature/28-actions-taken-ui` รวมทั้ง commit `a4fc2d7` ล่าสุดเรียบร้อยแล้วค่ะ:
> 
> - ✅ **Actions Taken UI**: คอมโพเนนต์ `ActionsTakenSection` เชื่อมต่อกับหน้ารายละเอียดตั๋วทั้ง 2 ฝั่งถูกต้อง (Requester เป็น Read-only, Staff/Admin บันทึกและแก้ไขได้)
> - ✅ **Responsive & Theme**: แสดงผลแบบ Table บนจอใหญ่ และปรับเป็น Stacked Cards บนจอมือถือ (< 768px) ป้องกันหน้าจอล้น สไตล์และสีตรงตาม Zen Green Theme
> - ✅ **Optimistic Locking**: จัดการ 409 Conflict ได้นุ่มนวล มีปุ่ม Reload ข้อมูลล่าสุดโดยไม่ทำลายข้อมูลที่กรอกค้างไว้
> - ✅ **Accessibility & Contract**: มีการดักปุ่ม `Escape` เพื่อปิด Modal ครบถ้วน และเอกสาร `docs/lab-04/api-spec.md` บันทึก endpoint `GET /api/staff/assignees` ครบถ้วนแล้ว
> - ✅ **Tests**: ชุดทดสอบ `client/tests/lab-04/ActionsTaken.test.tsx` ผ่านครบ 5/5 tests

---

### My Review Comment on Partner PR [#75](https://github.com/phatthidawadi/toktickit/pull/75):
> ตรวจทานโค้ดจริงบน branch `feature/29-ticket-workflow-and-resolution` เทียบกับ **Lab 4 Handout (§4.5, §8.4)** และ **Specification (§5.1)** แล้ว ภาพรวมการทำ Resolution Gate, Optimistic Locking และหน้าบ้านทำมาได้ดีมาก
>
> แต่พบ **1 จุดที่เป็น Spec Deviation ที่ฝั่ง Backend** ที่อยากให้ปรับแก้ให้ตรงกันก่อน:
>
> **`server/src/utils/workflow.ts` (L3, L7) ยังมี Transition ที่ไม่อนุญาตตามสเปกค้างอยู่:**
> - ใน `specification.md` §5.1 และใน `StaffTicketDetail.tsx`:
>   - `OPEN` สามารถเปลี่ยนได้แค่ `["IN_PROGRESS", "WAITING_FOR_REQUESTER", "CANCELLED"]` เท่านั้น (ไม่อนุญาตให้ข้ามไป `RESOLVED` โดยตรงตามหลัก Resolution Gate)
>   - `REOPENED` สามารถเปลี่ยนได้แค่ `["IN_PROGRESS"]` เท่านั้น
> - แต่ใน `server/src/utils/workflow.ts` ตอนนั้นยังเป็น:
>   - `OPEN: { to: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"] }`
>   - `REOPENED: { to: ["IN_PROGRESS", "RESOLVED", "CANCELLED"] }`
>   ทำให้ถ้ามีการยิง API ตรง Backend จะยังยอมให้ `OPEN -> RESOLVED` ได้อยู่
>
> **จุดแนะนำเพิ่มเติม (Non-blocking):**
> - ใน `TicketDetailView.tsx` สามารถเพิ่ม Escape key handler สำหรับปิด Cancel Confirmation Modal ได้

### Partner Response (@phatthidawadi on PR #75):
> ดำเนินการแก้ไขทั้ง 2 จุดเรียบร้อยแล้วใน commit `b4d2b57`:
>
> 1. **แก้ Transition Matrix ใน `server/src/utils/workflow.ts` ให้ตรงกับ specification.md §5.1:**
>    - ปรับ `OPEN` ให้มี `to` เป็น `["IN_PROGRESS", "WAITING_FOR_REQUESTER", "CANCELLED"]` เท่านั้น โดยเอา `"RESOLVED"` ออก เพื่อบังคับให้ตั๋วต้องผ่านสถานะ `IN_PROGRESS` หรือ `WAITING_FOR_REQUESTER` ก่อนจะถึง `RESOLVED` ได้ ตามหลัก Resolution Gate
>    - ปรับ `REOPENED` ให้มี `to` เป็น `["IN_PROGRESS"]` เท่านั้น โดยเอา `"RESOLVED"` และ `"CANCELLED"` ออก ทำให้ตั๋วที่ถูก Reopen ต้องกลับไปอยู่สถานะ `IN_PROGRESS` เสมอ
>    - ตอนนี้ workflow.ts, StaffTicketDetail.tsx และ specification.md §5.1 สอดคล้องกัน 100% ป้องกัน `OPEN -> RESOLVED` Bypass ได้ทั้งในระดับ API และ UI
>    - ชุดทดสอบ `ticket-workflow.api.test.ts` ผ่านครบ 10/10 tests
>
> 2. **เพิ่ม Escape Key Handler ใน `TicketDetailView.tsx`:**
>    - เพิ่ม `useEffect` ดักจับ `keydown` Event บน window ตรวจสอบ `e.key === "Escape"` เมื่อ `showCancelModal` เป็น `true` และไม่อยู่ระหว่าง Cancelling เพื่อปิด Modal โดยเรียก `setShowCancelModal(false)` พร้อม Clean-up Event Listener อย่างถูกต้อง สอดคล้องกับ pattern เดียวกับ ActionsTakenSection.tsx

---

### My Approval Verdict on Partner PR [#75](https://github.com/phatthidawadi/toktickit/pull/75):
> ### Re-review — PR #75 (Round 2) —
>
> ตรวจ head ล่าสุด commit `b4d2b57` เรียบร้อยแล้วค่ะ จุดที่ขอให้แก้ไขได้รับการปรับปรุงอย่างถูกต้องและรวดเร็วมาก:
>
> - **Resolution Gate Strictly Enforced**: ปรับปรุง `server/src/utils/workflow.ts` ให้ตัด `RESOLVED` ออกจาก `OPEN` และตัด `RESOLVED`, `CANCELLED` ออกจาก `REOPENED` ทำให้ Transition Matrix สอดคล้องกับ `specification.md` §5.1 และ `StaffTicketDetail.tsx` ครบ 100% ปิดช่องโหว่การ bypass ข้ามขั้นตอนได้อย่างสมบูรณ์
> - **Keyboard Accessibility**: เพิ่ม `Escape` key event listener ใน `TicketDetailView.tsx` สำหรับปิด Cancel Confirmation Modal ช่วยให้การใช้งานผ่านคีย์บอร์ดสะดวกและตรงตามมาตรฐานสเปก
> - **Test Verification**: ยืนยันผลการทดสอบ Server Integration Tests (`ticket-workflow.api.test.ts`) ผ่านครบ 10/10 tests และ Client Component Tests ผ่านครบถ้วน

---


### PR #76 — Issue #30: Role-Based Dashboards (feature/30-role-based-dashboards)

### My Review Comment on Partner PR [#76](https://github.com/phatthidawadi/toktickit/pull/76):
> ตรวจทานโค้ดบนสาขา `feature/30-role-based-dashboards` (commit `31e44a7`) เทียบกับข้อกำหนด Lab 4 Handout, `specification.md` (FR-08 ถึง FR-12, BR-11 ถึง BR-13), `api-spec.md` และ `tests.md` เรียบร้อยแล้ว
>
> **จุดที่ต้องแก้ไข (Request Changes ⛔):**
> 1. **การส่งต่อ Filter State จาก Dashboard ไปยัง Queue/Ticket Views (FR-11, AC-13):**
>    - ใน `client/src/App.tsx` ฟังก์ชัน Callback ของ Dashboard ทั้งสอง (`onNavigateToTickets`, `onNavigateToQueue`) มีการประกาศ parameter `_filter` ไว้ แต่ไม่ได้ส่งต่อไปยัง Component ลูก (`StaffTicketQueue` และ `MyTicketsView`) ทำให้เมื่อผู้ใช้คลิกการ์ดตัวชี้วัด เช่น "Unassigned" หรือ "Urgent Priority" หรือ "Waiting on You" ตัวหน้า Queue/Ticket View ปลายทางไม่ได้ถูก Pre-filter ตามการ์ดที่กดจริง
> 2. **โครงสร้าง Response ในเอกสาร `api-spec.md` ไม่ตรงกับการ Implement จริง (Spec Sync):**
>    - ใน `docs/lab-04/api-spec.md` (§4.1 และ §4.2) ยังระบุตัวอย่าง Response ของทั้ง Requester และ Staff Dashboard ในรูปแบบที่มี wrapper ซ้อนอยู่ (`metrics: { ... }`) และใช้ชื่อฟิลด์เก่า แต่ในโค้ดจริงเป็น Flat object ที่ root (`totalOpenTickets`, `unassignedTickets`, ฯลฯ) และใช้ชื่อฟิลด์ `myRecentTickets`
> 3. **ความสอดคล้องของนิยาม `myAssignedTickets` ในเอกสาร `api-spec.md`:**
>    - ใน `api-spec.md` §4.2 ระบุว่า `myAssignedTickets` นับเฉพาะสถานะ `NOT IN ('CLOSED', 'CANCELLED')` แต่ในโค้ดจริงใช้ `ACTIVE_STATUSES` (ไม่รวม `RESOLVED` ด้วย) อยากให้ปรับคำอธิบายให้ระบุเงื่อนไขให้ตรงกับที่โค้ดทำงานจริง
>
> **คำแนะนำเพิ่มเติม (Suggestions / Non-blocking 💡):**
> - ใน `server/src/app.ts` สำหรับ `GET /api/dashboard/staff` มีการดึง Ticket ทั้งหมดมาวนลูป group by ในหน่วยความจำ ในอนาคตหากมีตั๋วปริมาณมาก การใช้ Database Aggregation โดยตรงจะช่วยลด Memory Footprint ได้ดีขึ้น

### Partner Response (@phatthidawadi on PR #76):
> ดำเนินการปรับปรุงแก้ไขทั้ง 3 จุดเรียบร้อยแล้ว:
>
> 1. **เชื่อมต่อ Drill-Down Filtering ใน `client/src/App.tsx`, `StaffTicketQueue.tsx`, และ `MyTicketsView.tsx` (FR-11, AC-13):**
>    - เพิ่ม state `queueFilter` และ `ticketsFilter` ใน `App.tsx` เพื่อรับ filter key จากการคลิกการ์ดบน `StaffDashboard` และ `RequesterDashboard`
>    - ส่งต่อเป็น prop `initialFilter` ไปยัง `StaffTicketQueue` และ `MyTicketsView`
>    - เพิ่ม helper `resolveInitialFilters` ใน `StaffTicketQueue` เพื่อ map filter (`"unassigned"`, `"my-assigned"`, `"urgent"`, `"waiting"`) ไปยัง state ตัวกรอง (`assignedStaffId`, `itPriority`, `status`) ส่งผลให้คิวถูก Pre-filter ทันทีที่เปิดหน้า และเคลียร์ filter เมื่อคลิกเปลี่ยนแท็บจาก Header
>    - เพิ่ม helper `resolveMyTicketsFilter` ใน `MyTicketsView` เพื่อ map filter (`"waiting"`, `"resolved"`) เข้ากับ `selectedStatus` และเพิ่มตัวเลือกสถานะ (`OPEN`, `WAITING_FOR_REQUESTER`, `REOPENED`, `CANCELLED`) ใน status filter dropdown ให้ครบถ้วน
>
> 2. **ปรับปรุง Response Structure ใน `docs/lab-04/api-spec.md` (§4.1 และ §4.2) ให้ตรงกับ Implementation จริง:**
>    - ปรับ JSON Response ตัวอย่างของทั้ง Requester Dashboard (`GET /api/dashboard/requester`) และ Staff Dashboard (`GET /api/dashboard/staff`) ให้เป็น Flat root object โดยนำ wrapper `metrics: {}` ออก
>    - ปรับชื่อฟิลด์จาก `recentTickets` เป็น `myRecentTickets` พร้อมอธิบายโครงสร้างตั๋วที่คืนกลับมา
>    - อัปเดต Zero-State behavior ให้ตรงกับผลลัพธ์จริง (คืนค่าเคาน์เตอร์ 0 ทุกตัว และ `myRecentTickets: []`)
>
> 3. **ปรับแก้คำอธิบายการคำนวณ `myAssignedTickets` และ `ticketsByPriority` ใน `api-spec.md` §4.2:**
>    - ระบุชัดเจนว่านับเฉพาะ Active Workload สถานะ `IN ('NEW', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'REOPENED')` (ตัด RESOLVED/CLOSED/CANCELLED ออก)
>    - ระบุเงื่อนไข `ticketsByPriority` ว่านับเฉพาะ active tickets เพื่อให้สอดคล้องกับพฤติกรรมจริงของระบบ
>
> 4. **การตรวจสอบและชุดทดสอบ:**
>    - Server Integration Tests (`dashboard.api.test.ts` และชุดทดสอบทั้งหมด 21 ไฟล์): ผ่านครบ **112/112 tests**
>    - Client Component Tests (`Dashboard.test.tsx`, `TicketWorkflow.test.tsx`, `ActionsTaken.test.tsx`): ผ่านครบ **13/13 tests**
>    - Client Build (`npm run build`): ผ่านฉลุย (TypeScript + Vite)

### My Approval Verdict on Partner PR [#76](https://github.com/phatthidawadi/toktickit/pull/76):
> **คำตัดสิน: Approved with comments ✅**
>
> ได้รับการตรวจทานซ้ำ (Re-review) หลังจากการปรับปรุงใน commit `b24c6df` และ `e0ff16c` ครบถ้วน:
> 1. เชื่อมต่อ Drill-Down Filtering ใน `App.tsx`, `StaffTicketQueue.tsx`, และ `MyTicketsView.tsx` ได้อย่างสมบูรณ์ รองรับการส่งต่อและรีเซ็ต filter state ตามการคลิกการ์ดตัวชี้วัด (AC-13, FR-11)
> 2. ปรับปรุงเอกสาร `docs/lab-04/api-spec.md` (§4.1 และ §4.2) ให้มีโครงสร้าง Flat JSON Response และชื่อฟิลด์ `myRecentTickets` สอดคล้องกับ Server implementation จริง
> 3. ปรับแก้นิยามการคำนวณ `myAssignedTickets` และ `ticketsByPriority` ให้ชัดเจนว่าประเมินเฉพาะ Active Tickets เท่านั้น
> 4. ยืนยันผลการทดสอบ Server Integration Tests (112/112 tests), Client Component Tests (13/13 tests) และ Client Production Build ผ่านครบถ้วน 100%
>
> อนุมัติการรวมโค้ด (Approved & Ready to Merge) เข้าสู่สาขา `lab4-staging` เรียบร้อยครับ

---

### My Review Comment on Partner PR [#77](https://github.com/phatthidawadi/toktickit/pull/77):

> **คำตัดสิน: Changes Requested**
>
> จากการตรวจทานโค้ดในสาขา `feature/31-e2e-automated-testing-and-screenshots` (commit `d733c56`) พบจุดบกพร่องสำคัญที่ต้องขอให้ปรับปรุงก่อนอนุมัติ ดังนี้:
>
> 1. **[Critical] False Positive Test ใน `ticket-resolution.spec.ts` (E2E-02-B):**
>    - ในบรรทัด 219 มีการ Hardcode URL เรียก `/api/tickets/2/actions` แต่เนื่องจาก `POST /api/test/reset-db` ลบข้อมูลในตาราง Ticket โดยไม่รีเซ็ต SQLite autoincrement sequence ทำให้ ID ของตั๋ว `TKT-2026-000002` เปลี่ยนไปเป็นค่าอื่น
>    - โค้ดได้นำการทดสอบ 409 Concurrency Conflict ไปครอบไว้ใน `if (actionsData && actionsData.length > 0)` เมื่อ API คืนค่าว่าง ตัวเทสต์จึงข้ามการทดสอบ 409 และการ Assert แบนเนอร์แจ้งเตือนไปโดยสิ้นเชิง แต่เทสต์กลับรายงานผลว่าผ่าน (False Positive)
>    - ส่งผลให้รูปภาพ `03-concurrency-conflict-alert-chromium.png` ไม่ได้ถูกสร้างและขาดหายไปจากโฟลเดอร์ `artifacts/lab-04/screenshots/ticket-resolution/`
>    - **วิธีแก้:** ดึง `actionId` จาก attribute ของปุ่ม Edit บนหน้าจอโดยตรง (เช่น `edit-action-btn-${id}`), นำ `if (actionsData && actionsData.length > 0)` ออกเพื่อให้เทสต์ Fail หากไม่พบข้อมูล และรันสร้างรูปภาพ `03-concurrency-conflict-alert-*.png` Commit เข้ามาให้ครบถ้วน
>
> 2. **[Medium] หลีกเลี่ยง Conditional Assertions (`if`) ใน E2E Specs:**
>    - ใน `dashboards.spec.ts` (บรรทัด 66) มีการเขียน `if (await statusSelect.isVisible())` ครอบการ Assert ค่า Filter
>    - ใน `actions-taken-flow.spec.ts` (บรรทัด 206) มีการเขียน `if (await recordBtn.isVisible())` ครอบการตรวจ Touch target 44px
>    - **วิธีแก้:** ปรับเปลี่ยนจากการใช้ `if` เป็นการ Assert `await expect(...).toBeVisible()` โดยตรง เพื่อป้องกันการข้าม Assertion เงียบๆ เมื่อ Element ไม่แสดงผล

### Partner Response (@phatthidawadi on PR #77):

> ดำเนินการปรับปรุงแก้ไขทั้ง 2 จุดตามข้อเสนอแนะของ Reviewer เรียบร้อยแล้ว:
>
> 1. **แก้ไข False Positive และเพิ่มภาพ Screenshot 409 Concurrency Conflict (`ticket-resolution.spec.ts`):**
>    - สกัด `actionId` จาก attribute `id` ของปุ่ม Edit บนหน้าจอ (`edit-action-btn-${id}`) โดยตรง ทำให้ไม่ขึ้นกับ Ticket ID หรือ Autoincrement sequence
>    - นำ conditional wrapper `if (actionsData && actionsData.length > 0)` ออกทั้งหมด เพื่อให้มั่นใจว่าการจำลอง concurrent update และการตรวจสอบ HTTP 409 Concurrency Conflict (`#action-concurrency-conflict`) ถูกรันจริง 100% โดยไม่เกิด False Positive
>    - รันการทดสอบและสร้างไฟล์ภาพหลักฐาน `03-concurrency-conflict-alert-chromium.png` บันทึกเข้าโฟลเดอร์ `artifacts/lab-04/screenshots/ticket-resolution/` ครบถ้วน
>
> 2. **ยกเลิก Conditional Assertions (`if`) ในทุก E2E Spec files:**
>    - ใน `dashboards.spec.ts`: ปรับเป็น `await expect(statusSelect).toBeVisible()` และ `await expect(viewQueueBtn).toBeVisible()` โดยตรง ปราศจากการครอบด้วย `if`
>    - ใน `actions-taken-flow.spec.ts`: ปรับเป็น `await expect(recordBtn).toBeVisible()` ก่อนวัดขนาด Touch Target (>= 44px) ปราศจากการครอบด้วย `if`
>
> 3. **การตรวจสอบผลการทดสอบ (Verification):**
>    - ชุดทดสอบ Playwright E2E ทั้ง 8/8 tests บน Chromium ผ่าน 100%
>    - ชุดทดสอบ Vitest Server ทั้ง 115/115 tests ผ่าน 100%
>    - Client Production Build ผ่าน 0 errors

### My Approval Verdict on Partner PR [#77](https://github.com/phatthidawadi/toktickit/pull/77):

> ### คำตัดสินการตรวจทานรอบสุดท้าย (Final Review Verdict)
>
> ตรวจสอบการปรับปรุงแก้ไขใน commit `1978bb8` ครบถ้วนทุกจุดแล้ว:
>
> 1. **แก้ไข False Positive ใน Concurrency Conflict Test (AC-09, E2E-02-B):**
>    - มีการดึง `actionId` จากปุ่ม Edit บนหน้าจอโดยตรง ทำให้ไม่พึ่งพา Autoincrement sequence ของฐานข้อมูล
>    - นำเงื่อนไข `if` ที่ครอบการทดสอบออกทั้งหมด ทำให้กระบวนการจำลอง HTTP 409 Concurrency Conflict (`#action-concurrency-conflict`) ถูกรันจริงและ Assert ผลอย่างแม่นยำ
>    - เพิ่มไฟล์ภาพหลักฐาน `03-concurrency-conflict-alert-chromium.png` เข้าสู่ Repository เรียบร้อย
>
> 2. **ยกเลิก Conditional Assertions (`if`) ใน E2E Specs:**
>    - ใน `dashboards.spec.ts` และ `actions-taken-flow.spec.ts` มีการ Assert `toBeVisible()` นำหน้าโดยตรง ปราศจากการใช้ `if` ครอบ ทำให้ไม่มีการข้าม Assertion เงียบๆ อีกต่อไป
>
> 3. **ความสมบูรณ์ของการทดสอบและหลักฐาน:**
>    - ชุดทดสอบ Playwright E2E ทั้ง 8/8 tests, Performance-Smoke tests (PERF-SMK-01 ถึง 03) และ Server Vitest 115/115 tests ผ่านครบถ้วน 100%
>    - ภาพหลักฐาน Screenshot ครบทั้ง 12 ภาพครอบคลุม Desktop, Tablet, Mobile และ Concurrency Alert

---

### My Review Comment on Partner PR [#78](https://github.com/phatthidawadi/toktickit/pull/78):

> ### Reviewer Comment (PR #78)
>
> **คำตัดสิน: Changes Requested**
>
> จากการตรวจทานโค้ดในสาขา `feature/32-visual-style-accessibility-hardening` (commit `d131ee7`) พบจุดบกพร่องสำคัญที่ต้องขอให้ปรับปรุงก่อนอนุมัติ ดังนี้:
>
> #### 1. [Medium] ข้อผิดพลาด TypeScript Compilation บน Server (`server/src/app.ts`):
> เมื่อรันการทดสอบ Type checking และ Build ฝั่ง Server ด้วย `npm --prefix server run build` (`tsc`) พบ Type Error 5 จุด ทำให้กระบวนการ Build ล้มเหลว (Exit Code 1):
> ใน `server/src/app.ts` (บรรทัด 2072, 2134, 2137, 2140) ตัวแปร `ACTIVE_STATUSES` และ `ALL_STATUSES` ถูกระบุเป็น `string[]` ทั่วไป ซึ่งไม่ตรงกับ Prisma enum `TicketStatus[]` ที่ Prisma Client กำหนดไว้สำหรับฟิลด์ `currentStatus`
> ใน `server/tests/lab-04/performance-smoke.test.ts` (บรรทัด 61) ค่า `currentStatus` ถูกส่งเป็น `string` ทั่วไป ทำให้เกิด Type Mismatch กับ `TicketStatus`
> **วิธีแก้:** นำเข้า `TicketStatus` จาก `@prisma/client` ใน `server/src/app.ts` และระบุ Type ให้ชัดเจน (`const ACTIVE_STATUSES: TicketStatus[] = ...`, `const ALL_STATUSES: TicketStatus[] = ...`) และ cast ค่าใน `performance-smoke.test.ts` ให้เป็น `TicketStatus` เพื่อให้ `npm --prefix server run build` ผ่าน 0 errors
>
> #### 2. [Low] ขาด Keyboard Focus Trap ใน Modal Dialogs (`ActionsTakenSection.tsx`):
> ใน `ActionsTakenSection.tsx` หน้าต่าง Modal ทั้ง Record Action (`#record-action-modal`) และ Edit Action (`#edit-action-modal`) มีการใส่ `role="dialog"`, `aria-modal="true"` และปุ่มปิด `Escape` ครบถ้วนแล้ว
> อย่างไรก็ตาม เมื่อผู้ใช้กดปุ่ม `Tab` บนคีย์บอร์ดผ่านปุ่มสุดท้ายภายใน Modal ("Save Action Taken" หรือ "Cancel") โฟกัสสามารถหลุดออกไปยัง Element บนหน้าเว็บด้านหลัง Modal ได้ ซึ่งขัดกับมาตรฐาน Accessible Modal Dialog (WCAG 2.4.3 Focus Order)
> **วิธีแก้:** เพิ่มการดักจับ Event `Tab` / `Shift + Tab` ภายใน Modal เพื่อให้ Focus วนลูปอยู่เฉพาะภายใน Interactive Elements ของ Modal Dialog เท่านั้น จนกว่าจะปิดหน้าต่าง

### Partner Response (@phatthidawadi on PR #78):

> ดำเนินการปรับปรุงแก้ไขทั้ง 2 จุดตามข้อเสนอแนะของ Reviewer เรียบร้อยแล้ว:
>
> 1. **แก้ไข TypeScript Compilation Errors ฝั่ง Server (`app.ts` และ `performance-smoke.test.ts`):**
>    - นำเข้า `TicketStatus` enum จาก `@prisma/client` ใน `server/src/app.ts`
>    - ประกาศ Type ชัดเจนให้กับ `ACTIVE_STATUSES: TicketStatus[]` และ `ALL_STATUSES: TicketStatus[]`
>    - Cast ค่า `currentStatus` ใน `server/tests/lab-04/performance-smoke.test.ts` ให้เป็น `TicketStatus`
>    - ยืนยันการรัน `npm --prefix server run build` (`tsc`) ผ่านสมบูรณ์ 0 errors
>
> 2. **เพิ่ม Accessible Keyboard Focus Trap ให้กับ Modal Dialogs (`ActionsTakenSection.tsx`):**
>    - เพิ่มการดักจับ Event `Tab` และ `Shift + Tab` ภายใน `useEffect` ของ `ActionsTakenSection.tsx`
>    - ควบคุมให้ Keyboard Focus วนลูปอยู่เฉพาะภายใน Focusable elements ของ Modal ที่เปิดอยู่ (`#record-action-modal` หรือ `#edit-action-modal`) ป้องกัน Focus หลุดออกไปนอก Modal ตามมาตรฐาน WCAG 2.4.3
>
> 3. **ผลการทดสอบและการ Build:**
>    - `npm --prefix server run build`: ผ่าน 0 errors (Exit code 0)
>    - `npm --prefix client run build`: ผ่าน 0 errors (Exit code 0)
>    - `npm test --prefix server`: ผ่าน 115/115 tests (22 test files)
>    - `npm test --prefix client`: ผ่าน 52/52 tests (22 test files)

### My Approval Verdict on Partner PR [#78](https://github.com/phatthidawadi/toktickit/pull/78):

> ### คำตัดสินการตรวจทานรอบสุดท้าย (Final Review Verdict)
>
> ตรวจสอบการปรับปรุงแก้ไขใน commit `6a5f03a` เรียบร้อยแล้ว ครบถ้วนตามมาตรฐานและข้อกำหนดทุกประการ:
>
> 1. **แก้ไข Server TypeScript Compilation (`app.ts` และ `performance-smoke.test.ts`):**
>    - มีการนำเข้าและระบุ Type ของ `TicketStatus` Prisma enum สำหรับ `ACTIVE_STATUSES` และ `ALL_STATUSES` อย่างชัดเจน
>    - คำสั่ง build ฝั่ง Server (`npm --prefix server run build`) ผ่านสมบูรณ์ 0 errors ปราศจาก Type Error
>
> 2. **เพิ่ม Accessible Modal Focus Trap (`ActionsTakenSection.tsx`):**
>    - มีการดักจับ Event `Tab` และ `Shift + Tab` เพื่อล็อก Keyboard Focus ให้อยู่เฉพาะภายใน Focusable elements ของ Modal Dialog ที่เปิดอยู่
>    - รองรับการวนลูป (Focus Loop) ระหว่าง element แรกและสุดท้ายอย่างถูกต้องตามเกณฑ์มาตรฐาน WCAG 2.4.3 Focus Order
>
> 3. **ความสมบูรณ์ของการทดสอบและหลักฐาน Visual Evidence:**
>    - ทั้ง Server Build และ Client Build ผ่านฉลุย 0 errors
>    - ชุดทดสอบทั้งหมด 115 Server tests, 52 Client tests และ 24 Playwright E2E tests ผ่านครบถ้วน 100%
>    - ภาพหลักฐาน Screenshot ครบทั้ง 36 ภาพครอบคลุม Chromium Desktop, Tablet และ Mobile ทุก Subsystems

### My Approval Verdict on Partner PR [#79](https://github.com/phatthidawadi/toktickit/pull/79):

> ### ผลการตรวจทาน Peer Review
>
> ### สรุปผลการตรวจทานเชิงลึก (Audit Findings)
>
> #### 1. เอกสารบันทึกการรีวิว (`docs/lab-04/reviewer.md`) — ครบถ้วนตามเกณฑ์ Handout §10 & Part 1
> - **ตารางสรุป PRs:** บันทึกและอัปเดตสถานะของ PR ทั้งหมดตั้งแต่ PR #72 ถึง #78 (ได้รับการ Approve พร้อมบันทึก Comment ตรวจรับจริงและการแก้ไข) และระบุ PR #79 เป็นขั้นตอน Final Release Integration ไว้อย่างถูกต้อง
> - **การแบ่งบทบาท:** มีการแยกส่วนระหว่าง **"Tasks Authored"** โดย @phatthidawadi และ **"Tasks Reviewed"** โดยคู่ Partner (@chanya06) ไว้อย่างชัดเจน ถูกต้องตามเกณฑ์การประเมิน Part 1
>
> #### 2. เอกสารบันทึกการใช้งาน AI (`docs/lab-04/ai-use.md`) — สมบูรณ์ตามเกณฑ์ Handout §10 & Part 4
> - **การระบุโมเดล:** ระบุเครื่องมือ LLM ที่ใช้งานจริงอย่างเป็นทางการ (`Gemini 3.8 Flash & Gemini 3.6 Flash via Antigravity`)
> - **Key Prompts ทั้ง 10 ข้อ:** ถอดคำว่า `*(Planned)*` ออกทั้งหมด และบันทึกคำสั่งสำคัญ 10 ข้อที่สะท้อนการตัดสินใจทางสถาปัตยกรรมและการแก้ไขปัญหาหน้างานจริง (เช่น การออกแบบ Schema และ Optimistic Concurrency 409, การบังคับ Status Matrix, การทำ Dynamic DOM Selector แก้ปัญหา SQLite autoincrement ใน E2E, และการใส่ Focus Trap)
> - **บทวิเคราะห์ (Reflection):** มีการถอดบทเรียนเปรียบเทียบระหว่าง **Spec-Agent** และ **Coding-Agent** อย่างลึกซึ้ง ครอบคลุมทั้งประเด็น Type Safety ของ Prisma enums, การดักจับ False Positives ในเทสต์ E2E และการรองรับ Accessibility ตามเกณฑ์ WCAG 2.4.3
>
> #### 3. โครงสร้างไฟล์ทดสอบตรงตามเกณฑ์ 100% (Handout §12 Minimum Structure)
> - ดำเนินการแยกไฟล์ทดสอบ Dashboard ออกเป็น 4 ไฟล์ย่อยตรงตามหน้า 9 ของ Handout:
>   - `server/tests/lab-04/requester-dashboard.api.test.ts` (DASH-API-01 ถึง 04)
>   - `server/tests/lab-04/staff-dashboard.api.test.ts` (DASH-API-05 ถึง 08)
>   - `client/tests/lab-04/RequesterDashboard.test.tsx` (UI-DASH-01 ถึง 03)
>   - `client/tests/lab-04/StaffDashboard.test.tsx` (UI-DASH-04 ถึง 05)
> - เพิ่มไฟล์ `artifacts/lab-04/.gitkeep` ตามข้อกำหนดโครงสร้างขั้นต่ำเรียบร้อย
>
> #### 4. คลังภาพหลักฐาน Visual Evidence (Handout §10 & §14)
> - โฟลเดอร์ `artifacts/lab-04/screenshots/` จัดเก็บภาพหลักฐานครบถ้วน **36 ภาพ** ครอบคลุมทั้ง 4 Subsystems บนทั้ง 3 Viewports (Desktop 1280x720, Tablet 768x1024, Mobile 375x667)
>
> #### 5. สุขภาพของระบบและการทดสอบทั้งหมด (Build & Test Health)
> - **Server Build (`tsc`):** ผ่านสมบูรณ์ 0 errors
> - **Client Build (`vite build`):** ผ่านสมบูรณ์ 0 errors
> - **Server Vitest Tests:** ผ่านครบ 115/115 tests (22 test suites)
> - **Client Vitest Tests:** ผ่านครบ 52/52 tests (22 test suites)
> - **Playwright E2E Tests:** ผ่านครบ 24/24 tests บนทุกเบราว์เซอร์และวิวพอร์ต

