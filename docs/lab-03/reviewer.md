# Lab 3 — Peer Review Record

**Author:** Chanya Poolketkij — GitHub: @chanya06  
**Peer reviewer:** Peer Reviewer — GitHub: @lmaybelgracel  
**Partner reviewed by author:**  - GitHub: @titayaaa  

---

## Pull Requests I authored (reviewed by my partner @lmaybelgracel)

| PR | Branch | Reviewer verdict |
| :--- | :--- | :--- |
| [PR #44](https://github.com/chanya06/toktickit/pull/44) | `feature/17-spec-and-tests` | Approved with comments |

---

### Reviewer comment I received (PR #44):

> ### Peer Review: Sprint 3 Engineering Contract & Specifications (PR [#44](https://github.com/chanya06/toktickit/pull/44))
> ตรวจเอกสารใน docs/lab-03/ ทั้งหมดเทียบกับ Lab 3 Handout เรียบร้อยแล้ว การวางสเปกแบบ Spec DD ก่อนเริ่มโค้ดทำได้ครอบคลุมและมีโครงสร้างที่ดีมาก ครอบคลุมทั้ง FR-01–FR-20, BR-01–BR-18, AC-01–AC-12 และการขยาย UI Zen Green
> มีข้อเสนอแนะเชิงสถาปัตยกรรมและจุดที่อยากให้ปรับเพิ่มในเอกสารก่อนเริ่ม Implementation ดังนี้:
> 
> 1. **ความสอดคล้องของ Data Types ใน Prisma Schema (specification.md Section 7)**  
> ในโมเดลใหม่ PublicComment และ InternalNote มีการกำหนด ticketId String แต่ในโค้ดเดิมของ Lab 2 โมเดล Ticket.id ใช้ประเภท Int (Autoincrement) โจทย์ Section 5 กำหนดว่าต้องรักษาข้อมูลเดิมของ Lab 2 ไว้ ("evolve without discarding existing Ticket or Attachment data") ดังนั้น Foreign Key ticketId ของ Comments และ Notes ควรใช้ประเภท Int ให้ตรงกับ Ticket.id ส่วน User.id หากจะเปลี่ยนจาก Int (ของ DevelopmentRequester เดิม) มาเป็น String (UUID) อยากให้ระบุแผนการทำ Data Migration ลงใน Section 7 ให้ชัดเจนว่าจะแปลง Ticket.requesterId จาก Int เดิมไปเป็น UUID อย่างไร
> 
> 2. **เพิ่ม Endpoint รองรับ "Problem Appears Resolved" ของ Requester (api-spec.md)**  
> ตาม Section 1, 4.3 และ 8.2 ระบุว่า Requester สามารถส่งสัญญาณระบุว่าปัญหาได้รับการแก้ไขแล้วได้ ("indicate that the reported problem appears resolved") โดยไม่ถือเป็นการปิดตั๋วอย่างเป็นทางการ ใน api-spec.md ปัจจุบันมีเฉพาะ Endpoint เปลี่ยนสถานะของ IT Staff/Admin แต่ยังไม่มี Endpoint หรือ Flag สำหรับฝั่ง Requester แนะนำให้เพิ่ม Endpoint เช่น `POST /api/tickets/:id/resolve-indication` เพื่อระบุการทำงานนี้ให้ชัดเจน
> 
> 3. **ระบุ Permitted Roles ใน Status Transition Matrix (specification.md BR-14)**  
> ใน BR-14 มีระบุ Matrix การเปลี่ยนสถานะ 8 สถานะเรียบร้อย แต่ยังไม่ได้ระบุ Role กำกับในแต่ละ Transition เช่น: NEW -> OPEN (ทำได้โดย IT Staff ตอนเคลมตั๋ว), OPEN / IN_PROGRESS -> CANCELLED (ใครทำได้บ้าง), CLOSED -> REOPENED (Requester เปิดตั๋วซ้ำได้หรือไม่) แนะนำให้ระบุ Role ที่อนุญาตให้ทำได้ในแต่ละเส้น Transition ให้ชัดเจนเพื่อป้องกันสิทธิ์หลุดตอนเขียน API
> 
> 4. **ปรับตารางใน docs/lab-03/tests.md ให้ตรง Section 10**  
> ตาราง Planned Tests ใน tests.md ปัจจุบันรวมรายละเอียดไว้ในช่อง Description และยังขาดคอลัมน์ Test ID แนะนำให้ปรับคอลัมน์ตาม Template หน้า 14 ของอาจารย์: `Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final` เพื่อความชัดเจนและง่ายต่อการตรวจคะแนน Test DD
> 
> 5. **เก็บรายละเอียดเล็กน้อยใน ai-use.md และ reviewer.md**  
> ใน docs/lab-03/ai-use.md ช่อง User Input มีตัวอักษรซ้ำค้างอยู่ รบกวนปรับให้เป็นข้อความที่สมบูรณ์ ใน docs/lab-03/reviewer.md ใส่ชื่อ Reviewer เป็น @lmaybelgracel ได้เลย

---

### How I responded (PR #44):

> Thank you @lmaybelgracel for the detailed and insightful architectural review! All 5 feedback points have been addressed and pushed to `feature/17-spec-and-tests` (commit `84bb790`):
> 
> 1. **Data Types & Data Migration Plan (`specification.md` Section 7)**:
>    - Aligned `PublicComment.ticketId` and `InternalNote.ticketId` to `Int` to match `Ticket.id`.
>    - Defined `User.id` as `Int` (autoincrement) evolving from `DevelopmentRequester.id`. This ensures zero foreign key breaks for existing tickets/attachments (`requesterId`, `ownerId`, `removedByRequesterId`) and avoids data loss.
>    - Added a detailed Data Migration plan in Section 7 covering table evolution, role assignment, and initial password hashing.
> 
> 2. **Requester "Problem Appears Resolved" Endpoint (`api-spec.md` Section 3)**:
>    - Added `POST /api/tickets/:id/resolve-indication` allowing Requesters to indicate resolution on owned tickets in `OPEN` or `IN_PROGRESS` status. It sets `isResolutionIndicated: true` and logs a system Public Comment without mutating status to `RESOLVED` directly.
> 
> 3. **Permitted Roles in Status Transition Matrix (`specification.md` BR-14)**:
>    - Explicitly documented permitted roles for all 16 status transition paths in BR-14 (e.g. `NEW -> CANCELLED` by Requester owner/IT Staff/Admin; `OPEN -> RESOLVED` by IT Staff/Admin).
> 
> 4. **Test Traceability Table Layout (`tests.md` Section 1)**:
>    - Reformatted the Planned Tests table to match the exact 7-column schema from Handout Section 10 (`Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final`) and assigned unique Test IDs (`API-01`..`14`, `UI-01`..`05`, `E2E-01`..`03`).
> 
> 5. **AI Use & Reviewer Log (`ai-use.md` & `reviewer.md`)**:
>    - Cleaned up text formatting in `ai-use.md`.
>    - Updated `reviewer.md` with Reviewer ID `@lmaybelgracel` and logged all 5 resolved action items.

---

## Pull Requests I reviewed for my partner (@titayaaa)

| PR | Branch | Reviewer verdict |
| :--- | :--- | :--- |
| *To be updated during peer reviews* | - | - |
