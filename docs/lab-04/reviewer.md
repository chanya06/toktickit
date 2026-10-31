# Lab 4 — Peer Review Record

**Author:** Chanya Poolketkij — GitHub: @chanya06  
**Peer reviewer:** Peer Reviewer — GitHub: @lmaybelgracel  
**Partner reviewed by author:** Titaya — GitHub: @titayaaa  

---

## 1. Pull Requests I Authored (Reviewed by Partner @lmaybelgracel)

| PR # | Branch | Scope / Description | Reviewer Verdict | Status |
| :--- | :--- | :--- | :--- | :--- |
| [PR #72](https://github.com/chanya06/toktickit/pull/72) | `feature/29-spec-and-tests` | Sprint 4 Engineering Contract (`specification.md`, `tests.md`, `ui-spec.md`, `api-spec.md`) | Approved & Merged | Merged |
| [PR #81](https://github.com/chanya06/toktickit/pull/81) | `feature/30-db-schema-actions-taken` | Prisma Schema for `ActionTaken`, Database Migration & Seed Data | Approved & Merged | Merged |
| [PR #82](https://github.com/chanya06/toktickit/pull/82) | `feature/31-actions-taken-api` | Actions Taken REST API, Authorization & Concurrency | Approved & Merged | Merged |
| [PR #83](https://github.com/chanya06/toktickit/pull/83) | `feature/32-actions-taken-ui` | Actions Taken UI on Ticket Detail Screen & Responsive Cards | Approved & Merged | Merged |
| [PR #84](https://github.com/chanya06/toktickit/pull/84) | `feature/33-dashboard-api` | Role Dashboards REST API (Requester & IT Staff Metrics) | Changes Requested (Resolved) | In Review |
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
