# Lab 4 — Peer Review Record

**Author:** Chanya Poolketkij — GitHub: @chanya06  
**Peer reviewer:** Peer Reviewer — GitHub: @lmaybelgracel  
**Partner reviewed by author:** Titaya — GitHub: @titayaaa  

---

## 1. Pull Requests I Authored (Reviewed by Partner @lmaybelgracel)

| PR # | Branch | Scope / Description | Reviewer Verdict | Status |
| :--- | :--- | :--- | :--- | :--- |
| [PR #72](https://github.com/chanya06/toktickit/pull/72) | `feature/29-spec-and-tests` | Sprint 4 Engineering Contract (`specification.md`, `tests.md`, `ui-spec.md`, `api-spec.md`) | Approved & Merged | Merged |
| [PR #81](https://github.com/chanya06/toktickit/pull/81) | `feature/30-db-schema-actions-taken` | Prisma Schema for `ActionTaken`, Database Migration & Seed Data | Changes Requested (Resolved) | In Review |
| [PR # (Pending)] | `feature/31-actions-taken-api` | Actions Taken REST API, Authorization & Concurrency | Pending | Planned |
| [PR # (Pending)] | `feature/32-actions-taken-ui` | Actions Taken UI on Ticket Detail Screen & Responsive Cards | Pending | Planned |
| [PR # (Pending)] | `feature/33-dashboard-api` | Role Dashboards REST API (Requester & IT Staff Metrics) | Pending | Planned |
| [PR # (Pending)] | `feature/34-dashboard-ui` | Role Dashboards UI (Metric Cards, Recent Lists, Quick Actions & Drill-down) | Pending | Planned |
| [PR # (Pending)] | `feature/35-ticket-workflow-hardening` | Ticket Workflow Hardening, Resolution Gate & Stale Update Handling | Pending | Planned |
| [PR # (Pending)] | `feature/36-qa-regression-and-deliverables` | QA Automated Tests, Regression Suite, Screenshots & Final PDF Deliverable | Pending | Planned |
| [PR # (Pending)] | `lab4-staging` | Release Integration PR into `main` | Pending | Planned |

---

## 2. Pull Requests I Reviewed for Partner (@titayaaa)

| PR # | Branch | Scope / Description | Reviewer Verdict | Status |
| :--- | :--- | :--- | :--- | :--- |
| [PR # (Pending)] | `feature/29-spec-and-tests` | Sprint 4 Specifications and Test Contracts | Pending Review | Open |

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
