# Lab 4 — Peer Review Record

**Author:** Chanya Poolketkij — GitHub: @chanya06  
**Peer reviewer:** Peer Reviewer — GitHub: @lmaybelgracel  
**Partner reviewed by author:** Titaya — GitHub: @titayaaa  

---

## 1. Pull Requests I Authored (Reviewed by Partner @lmaybelgracel)

| PR # | Branch | Scope / Description | Reviewer Verdict | Status |
| :--- | :--- | :--- | :--- | :--- |
| [PR #72](https://github.com/chanya06/toktickit/pull/72) | `feature/29-spec-and-tests` | Sprint 4 Engineering Contract (`specification.md`, `tests.md`, `ui-spec.md`, `api-spec.md`) | Changes Requested (Resolved) | In Review |
| [PR # (Pending)] | `feature/30-db-schema-actions-taken` | Prisma Schema for `ActionTaken`, Database Migration & Seed Data | Pending | Planned |
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
