# Lab 3 — Peer Review Record

**Author:** Chanya Poolketkij — GitHub: @chanya06  
**Peer reviewer:** Peer Reviewer — GitHub: @lmaybelgracel  
**Partner reviewed by author:**  - GitHub: @titayaaa  

---

## Pull Requests I authored (reviewed by my partner @lmaybelgracel)

| PR | Branch | Reviewer verdict |
| :--- | :--- | :--- |
| [PR #44](https://github.com/chanya06/toktickit/pull/44) | `feature/17-spec-and-tests` | Approved |
| [PR #57](https://github.com/chanya06/toktickit/pull/57) | `feature/18-db-schema-and-seed` | Approved |
| [PR #58](https://github.com/chanya06/toktickit/pull/58) | `feature/19-auth-api` | Approved |
| [PR #59](https://github.com/chanya06/toktickit/pull/59) | `feature/20-auth-ui` | Approved |
| [PR #60](https://github.com/chanya06/toktickit/pull/60) | `feature/21-requester-session` | Approved |
| [PR #61](https://github.com/chanya06/toktickit/pull/61) | `feature/22-staff-queue-api` | Approved |
| [PR #62](https://github.com/chanya06/toktickit/pull/62) | `feature/23-staff-queue-ui` | Approved |
| [PR #63](https://github.com/chanya06/toktickit/pull/63) | `feature/24-staff-operations` | Approved |
| [PR #64](https://github.com/chanya06/toktickit/pull/64) | `feature/25-comments-and-notes` | Approved |
| [PR #65](https://github.com/chanya06/toktickit/pull/65) | `feature/26-admin-user-management` | Approved |
| [PR #66](https://github.com/chanya06/toktickit/pull/66) | `feature/27-admin-user-management-ui` | Approved |
| [PR #67](https://github.com/chanya06/toktickit/pull/67) / [PR #68](https://github.com/chanya06/toktickit/pull/68) | `feature/28-qa-automated-tests-release-integration` | In Review |

---

### Reviewer comment I received (PR #44):

> ### Peer Review: Sprint 3 Engineering Contract & Specifications (PR [#44](https://github.com/chanya06/toktickit/pull/44))
> 
> ตรวจเอกสารใน `docs/lab-03/` ทั้งหมดเทียบกับ Lab 3 Handout เรียบร้อยแล้ว การวางสเปกแบบ Spec DD ก่อนเริ่มโค้ดทำได้ครอบคลุมและมีโครงสร้างที่ดีมาก ครอบคลุมทั้ง FR-01–FR-20, BR-01–BR-18, AC-01–AC-12 และการขยาย UI Zen Green
> 
> มีข้อเสนอแนะเชิงสถาปัตยกรรมและจุดที่อยากให้ปรับเพิ่มในเอกสารก่อนเริ่ม Implementation ดังนี้:
> 
> ---
> 
> #### 1. ความสอดคล้องของ Data Types ใน Prisma Schema (`specification.md` Section 7)
> - ในโมเดลใหม่ `PublicComment` และ `InternalNote` มีการกำหนด `ticketId` `String` แต่ในโค้ดเดิมของ Lab 2 โมเดล `Ticket.id` ใช้ประเภท `Int` (Autoincrement)
> - โจทย์ Section 5 กำหนดว่าต้องรักษาข้อมูลเดิมของ Lab 2 ไว้ (*"evolve without discarding existing Ticket or Attachment data"*) ดังนั้น Foreign Key `ticketId` ของ Comments และ Notes ควรใช้ประเภท `Int` ให้ตรงกับ `Ticket.id`
> - ส่วน `User.id` หากจะเปลี่ยนจาก `Int` (ของ `DevelopmentRequester` เดิม) มาเป็น `String` (UUID) อยากให้ระบุแผนการทำ Data Migration ลงใน Section 7 ให้ชัดเจนว่าจะแปลง `Ticket.requesterId` จาก `Int` เดิมไปเป็น UUID อย่างไร
> 
> ---
> 
> #### 2. เพิ่ม Endpoint รองรับ "Problem Appears Resolved" ของ Requester (`api-spec.md`)
> - ตาม Section 1, 4.3 และ 8.2 ระบุว่า Requester สามารถส่งสัญญาณระบุว่าปัญหาได้รับการแก้ไขแล้วได้ (*"indicate that the reported problem appears resolved"*) โดยไม่ถือเป็นการปิดตั๋วอย่างเป็นทางการ
> - ใน `api-spec.md` ปัจจุบันมีเฉพาะ Endpoint เปลี่ยนสถานะของ IT Staff/Admin แต่ยังไม่มี Endpoint หรือ Flag สำหรับฝั่ง Requester
> - แนะนำให้เพิ่ม Endpoint เช่น `POST /api/tickets/:id/resolve-indication` หรือ `PATCH /api/tickets/:id` เพื่อระบุการทำงานนี้ให้ชัดเจน
> 
> ---
> 
> #### 3. ระบุ Permitted Roles ใน Status Transition Matrix (`specification.md` BR-14)
> - ใน BR-14 มีระบุ Matrix การเปลี่ยนสถานะ 8 สถานะเรียบร้อย แต่ยังไม่ได้ระบุ Role กำกับในแต่ละ Transition เช่น:
>   - `NEW -> OPEN`: ทำได้โดย IT Staff (ตอนเคลมตั๋ว)
>   - `OPEN / IN_PROGRESS -> CANCELLED`: ใครทำได้บ้าง (Requester ยกเลิกตั๋วตัวเองได้ไหม หรือเฉพาะ IT Staff)
>   - `CLOSED -> REOPENED`: Requester เปิดตั๋วซ้ำได้หรือไม่
> - แนะนำให้ระบุ Role ที่อนุญาตให้ทำได้ในแต่ละเส้น Transition ให้ชัดเจนเพื่อป้องกันสิทธิ์หลุดตอนเขียน API
> 
> ---
> 
> #### 4. ปรับตารางใน `docs/lab-03/tests.md` ให้ตรง Section 10
> - ตาราง Planned Tests ใน `tests.md` ปัจจุบันรวมรายละเอียดไว้ในช่อง Description และยังขาดคอลัมน์ `Test ID`
> - แนะนำให้ปรับคอลัมน์ตาม Template หน้า 14 ของอาจารย์: `Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final` เพื่อความชัดเจนและง่ายต่อการตรวจคะแนน Test DD 
> 
> ---
> 
> #### 5. เก็บรายละเอียดเล็กน้อยใน `ai-use.md` และ `reviewer.md`
> - ใน `docs/lab-03/ai-use.md` ช่อง User Input มีตัวอักษร `?????????` ค้างอยู่ รบกวนปรับให้เป็นข้อความที่สมบูรณ์
> - ใน `docs/lab-03/reviewer.md` ใส่ชื่อ Reviewer เป็น `@lmaybelgracel` ได้เลย
> 
> ---
> 
> **Verdict**: สามารถปรับรายละเอียด 5 ข้อด้านบนลงในไฟล์ของ branch `feature/17-spec-and-tests` แล้ว push อัปเดตขึ้นมาได้เลย

---

### How I responded (PR #44):

> ขอบคุณ @lmaybelgracel สำหรับคำแนะนำทางสถาปัตยกรรมที่ถี่ถ้วน ได้ทำการแก้ไขและอัปเดตเอกสารทั้งหมดใน `docs/lab-03/` ครบทั้ง 5 ข้อใน commit `84bb790` เรียบร้อยแล้ว:
> 
> 1. **Data Types & Data Migration Plan (`specification.md` Section 7)**:
>    - ปรับ `PublicComment.ticketId` และ `InternalNote.ticketId` ให้เป็น `Int` ตรงกับ `Ticket.id`
>    - กำหนด `User.id` เป็น `Int` (autoincrement) เพื่อรักษา Foreign Keys เดิมของ Lab 2 (`requesterId`, `ownerId`, `removedByRequesterId`) ไม่ให้เกิดข้อมูลสูญหาย
>    - เพิ่มขั้นตอน Data Migration ใน Section 7 ครอบคลุมการย้ายข้อมูล การกำหนด role และการ hash รหัสผ่านเริ่มต้น
> 
> 2. **Endpoint "Problem Appears Resolved" ของ Requester (`api-spec.md` Section 3)**:
>    - เพิ่ม `POST /api/tickets/:id/resolve-indication` อนุญาตให้ Requester (เจ้าของตั๋ว) ส่งสัญญาณแก้ปัญหาได้ในสถานะ `OPEN` หรือ `IN_PROGRESS` โดยระบบจะบันทึก `isResolutionIndicated: true` และสร้าง Public Comment อัตโนมัติ โดยไม่เปลี่ยนสถานะตั๋วเป็น `RESOLVED` โดยตรง
> 
> 3. **Permitted Roles ใน Status Transition Matrix (`specification.md` BR-14)**:
>    - ระบุ Role ที่อนุญาตครบทั้ง 16 เส้นทาง Transition ใน BR-14 ชัดเจน (เช่น `NEW -> CANCELLED` อนุญาตโดย Requester เจ้าของตั๋ว, IT Staff, Admin; `OPEN -> RESOLVED` อนุญาตโดย IT Staff, Admin)
> 
> 4. **ปรับโครงสร้างตาราง Planned Tests (`tests.md` Section 1)**:
>    - ปรับตารางใน `tests.md` Section 1 ให้เป็นแบบ 7 คอลัมน์ตามเทมเพลตหน้า 14 ของอาจารย์ (`Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final`) พร้อมระบุ Test ID ชัดเจน
> 
> 5. **AI Use & Reviewer Log (`ai-use.md` & `reviewer.md`)**:
>    - แก้ไขการแสดงผลตัวอักษรใน `ai-use.md`
>    - อัปเดต `reviewer.md` ระบุชื่อ Reviewer เป็น `@lmaybelgracel` และลงบันทึกการแก้ไขครบถ้วน

---

### Reviewer approval I received (PR #44 Round 2):

> ### Peer Review: Sprint 3 Engineering Contract & Specifications (PR [#44](https://github.com/chanya06/toktickit/pull/44)) - Round 2
> 
> ตรวจรอบแก้ไขเรียบร้อย ข้อเสนอแนะทั้ง 5 ข้อได้รับการปรับปรุงครบถ้วน:
> 
> * **Schema Continuity**: ปรับ Foreign Key `ticketId` และ `User.id` เป็น `Int` ตรงกับโมเดลเดิมของ Lab 2 และระบุแผน Data Migration ชัดเจน ข้อมูลเดิมไม่สูญหาย
> * **Requester Resolution**: เพิ่ม Endpoint `POST /api/tickets/:id/resolve-indication` และระบุ BR-19 รองรับการกดแจ้งว่าปัญหาได้รับการแก้ไขแล้ว
> * **Authorization Matrix**: ระบุ Permitted Roles ใน Status Transition Matrix (BR-14) ครบทุกสถานะ ป้องกันปัญหาเรื่องสิทธิ์ในชั้น API
> * **Test DD Traceability**: จัดโครงสร้างตาราง 7 คอลัมน์ตาม Section 10 พร้อมระบุ Test ID ครบทั้ง API, UI และ E2E รวม 22 ข้อทดสอบ
> * **Documentation Cleanliness**: แก้ไขข้อความใน `ai-use.md` และอัปเดตบันทึกการรีวิวใน `reviewer.md` เรียบร้อย

---

### Reviewer comment I received (PR #57):

> ### Peer Review: Database Schema & Seed Data (PR [#57](https://github.com/chanya06/toktickit/pull/57))
> ตรวจโค้ดส่วน Database Schema และ Seed Script เรียบร้อยแล้ว โครงสร้างส่วนใหญ่ทำได้ถูกต้องตามสเปก Section 5 ของ Lab 3:
> - **Schema & Relationships**: โมเดล User, Role, PublicComment, InternalNote และการปรับฟิลด์บน Ticket (ownerId, isResolutionIndicated, สถานะใหม่) ถูกต้องสมบูรณ์ รักษาระบบ ID เป็น Int ทำให้ข้อมูลและ Foreign Key เดิมของ Lab 2 ยังใช้งานได้ต่อเนื่อง
> - **Security**: รหัสผ่านเข้ารหัสผ่าน bcrypt (10 salt rounds) ไม่เก็บ Plaintext ใน Database
> - **Seed Requirements**: ข้อมูล Seed เป็น Idempotent มี User ครบตามเกณฑ์ (Requester 4+1, IT Staff 3+1, Admin 1) พร้อมตัวอย่าง Tickets, Public Comments และ Internal Notes ครบถ้วน
> 
> มีจุดที่ต้องปรับเพิ่ม 2 ข้อก่อน Approve & Merge :
> 1. **Commit ไฟล์ Migration**: ยังขาดไฟล์ Migration ของ Lab 3 ใน `server/prisma/migrations/` รบกวนรัน `npx prisma migrate dev --name lab3_db_init` แล้ว commit โฟลเดอร์ migration เข้ามาด้วย
> 2. **Connection Cleanup ใน seed.ts**: เพิ่ม `.finally(async () => { await getPrisma().$disconnect(); })` กลับเข้ามาตรงท้ายไฟล์ `server/prisma/seed.ts` เพื่อปิด Database Connection หลังรัน seed เสร็จ
> 
> ปรับ 2 จุดนี้แล้ว push ขึ้นมาได้เลย

---

### How I responded (PR #57):

> ขอบคุณสำหรับการรีวิว ได้ปรับปรุงแก้ไขครบทั้ง 2 ข้อเรียบร้อยแล้ว:
> 1. **Migration File**: เพิ่มไฟล์ Migration ของ Lab 3 ในโฟลเดอร์ `server/prisma/migrations/20260917000000_lab3_db_init/migration.sql` ครอบคลุมการสร้างตาราง User, Role, PublicComment, InternalNote และการโอนย้ายข้อมูลจาก DevelopmentRequester โดยไม่ให้เกิด foreign key violation
> 2. **Connection Cleanup**: เพิ่ม `.finally(async () => { await getPrisma().$disconnect(); })` ที่ท้ายไฟล์ `server/prisma/seed.ts` เพื่อปิด Database Connection ทุกครั้งหลังรัน Seed เสร็จ

---

### Reviewer comment I received (PR #58):

> ### Peer Review: Authentication Foundation & Password Change (PR [#58](https://github.com/chanya06/toktickit/pull/58))
> ตรวจโค้ดส่วน Authentication และ Password Management เรียบร้อยแล้ว ฟังก์ชันและเทสตรงตามข้อกำหนดของ Lab 3 Section 4.1, 4.4 และ 6:
> - **Authentication & Session**: Endpoint /api/auth/login, /logout, /me และ /change-password ทำงานได้สมบูรณ์ รองรับทั้ง Bearer Token และ HTTP-Only Cookie
> - **Security & Business Rules**: ปฏิบัติตาม BR-01 (สกัดบัญชี Inactive), BR-02 (มี requirePasswordChanged middleware), BR-04 (รหัสผ่านแฮชด้วย bcrypt และไม่ expose hash ออกไปภายนอก) และมีการตรวจสอบ Password Strength ครบทุกเงื่อนไข
> - **Automated Tests**: ครอบคลุม Test ID API-01, API-02, API-03 พร้อม Edge Cases (รหัสผิด, อีเมลไม่มีในระบบ, รหัสใหม่ไม่ปลอดภัย) ครบถ้วน
> 
> ข้อเสนอแนะเพิ่มเติม (Optional):
> - ใน `auth.api.test.ts` อาจเพิ่มการคืนค่ารหัสผ่านเดิมของ user ใน `afterAll` เพื่อให้ชุดเทสรันซ้ำได้โดยไม่ต้อง re-seed
> - เพิ่ม `JWT_SECRET` ใน `server/.env.example`

---

### How I responded (PR #58):

> ขอบคุณสำหรับการรีวิว ได้ปรับปรุงตามข้อเสนอแนะเพิ่มเติมครบถ้วน:
> 1. **Test Teardown / State Reset**: เพิ่ม `afterAll` ใน `server/tests/lab-03/auth.api.test.ts` เพื่อคืนค่ารหัสผ่านและสถานะ `mustChangePassword` ของ `david.lee@example.com` กลับเป็นค่าเริ่มต้น ช่วยให้สามารถรันชุดทดสอบซ้ำกี่ครั้งก็ได้โดยไม่ต้อง re-seed DB
> 2. **Environment Configuration**: เพิ่ม `JWT_SECRET` ลงใน `server/.env.example` เรียบร้อยแล้ว

---

### Reviewer comment I received (PR #59):

> ### Peer Review: Login Screen, Mandatory Password Change & Header Shell (PR [#59](https://github.com/chanya06/toktickit/pull/59))
> ตรวจโค้ดใน PR #59 และรัน Flow เทียบกับสเปก Lab 3 และ UI Spec เรียบร้อยแล้ว ตัว Component UI ทำระบบ Checklist ตรวจรหัสผ่าน และ Badge ของ Role ได้เรียบร้อยดีมาก แต่มีจุดบกพร่องเชิง Logic การทำงานของ Auth และ Routing ที่ต้องปรับแก้ก่อน Merge ดังนี้:
> 1. **แก้ไข Login Bypass จาก `toktickit_dev_requester_id` ใน LocalStorage (`client/src/App.tsx`)**:
>    ใน `App.tsx` เงื่อนไข `isDevRequesterFlow` ไปเช็ค `localStorage.getItem("toktickit_dev_requester_id")` โดยตรง ถ้าเครื่องใครเคยรัน Lab 2 มาก่อน ค่านี้จะค้างอยู่ในเบราว์เซอร์ ทำให้พอเปิดหน้าเว็บขึ้นมาจะหลุดข้ามหน้า Login ไปเข้า UI ของ Lab 2 ทันที
>    สิ่งที่ต้องปรับ: ให้ผูกเงื่อนไขนี้เฉพาะตอนรันโหมดเทสเท่านั้น เช่น:
>    `const isDevRequesterFlow = import.meta.env.MODE === "test" && (Boolean(localStorage.getItem("toktickit_dev_requester_id")) || isModalOpen);`

---

### How I responded (PR #59):

> ขอบคุณสำหรับการรีวิวและตรวจพบจุด Login Bypass ได้ทำการแก้ไขเรียบร้อยแล้ว:
> 1. **ป้องกัน Login Bypass (`client/src/App.tsx`)**: ผูกเงื่อนไข `isDevRequesterFlow` เข้ากับ `import.meta.env.MODE === "test"` ทำให้การเปิดใช้งานบนเบราว์เซอร์ปกติจะบังคับแสดงหน้า Login (`LoginView`) เสมอ แม้จะมีค่า `toktickit_dev_requester_id` หลงเหลืออยู่ใน LocalStorage จาก Lab 2 ก็ตาม ขณะเดียวกันยังคงรักษาความเข้ากันได้กับชุดทดสอบของ Lab 2 ได้ครบถ้วนทั้ง 52 tests

---

### Reviewer comment I received (PR #59 Round 2):

> ### ติดตามผลการรีวิว PR [#59](https://github.com/chanya06/toktickit/pull/59)
> ตรวจเช็ค commit 0a604aa เรียบร้อยแล้ว:
> จุดที่ 1 เรื่อง Login Bypass จากค่า LocalStorage เดิม แก้ไขได้ถูกต้องดีแล้ว ผูกเงื่อนไขกับ import.meta.env.MODE === "test" ช่วยให้เปิดบนเบราว์เซอร์ปกติจะบังคับแสดงหน้า Login เสมอ
> แต่ยังมีอีก 3 จุดที่ยังค้างอยู่ รบกวนช่วยปรับเพิ่มอีกนิด:
> 1. **Initial Tab ตาม Role (`client/src/App.tsx`)**:
>    ตอนนี้ activeTab ตั้งต้นเป็น "my-tickets" ตลอด พอ IT_STAFF หรือ ADMINISTRATOR ล็อกอินเข้ามา จะถูกพาไปหน้า `<MyTicketsView>` ของ Requester และใน Navbar จะไม่มีแท็บไหนถูกเลือก
>    ให้เพิ่ม useEffect เช็ค user?.role เมื่อล็อกอินสำเร็จ เพื่อตั้งแท็บเริ่มต้นให้ตรง Role:
>    - Admin -> "user-management"
>    - IT Staff -> "ticket-queue"
>    - Requester -> "my-tickets"
> 2. **บันทึก Token ใหม่ใน changePassword (`client/src/api.ts` & `AuthContext.tsx`)**:
>    ใน client/src/api.ts ฟังก์ชัน changePassword ยังขาด `if (data.token) setStoredToken(data.token);`
>    ทำให้ Client ยังถือ Token เก่าหลังเปลี่ยนรหัสผ่าน ให้เติมการบันทึก Token และ sync state ใน AuthContext.tsx ด้วย
> 3. **นำ Debug Component ของ Lab 1 ออก (`client/src/App.tsx`)**:
>    นำ `<HomeOverview />` ออกจากหน้า Login และหน้าจอหลัก เพื่อให้ UI ตรงตามสเปกหน้า 8 ของอาจารย์

---

### How I responded (PR #59 Round 2):

> ขอบคุณสำหรับการตรวจทานอย่างละเอียด ได้ทำการปรับปรุงแก้ไขเพิ่มเติมครบทั้ง 3 จุดเรียบร้อยแล้ว:
> 1. **Initial Tab ตาม Role (`client/src/App.tsx`)**:
>    - เพิ่มฟังก์ชัน `getInitialTab` และ `useEffect` ตรวจสอบ `user?.role` เมื่อผู้ใช้เข้าสู่ระบบ เพื่อเปลี่ยนแท็บเริ่มต้นให้ตรงตาม Role ทันที:
>      - `ADMINISTRATOR` -> `"user-management"`
>      - `IT_STAFF` -> `"ticket-queue"`
>      - `REQUESTER` (หรืออื่นๆ) -> `"my-tickets"`
>    - กำหนดค่าเริ่มต้นของ `activeTab` state ด้วย `getInitialTab(user?.role)`
> 2. **บันทึกและซิงก์ Token ใหม่ใน changePassword (`client/src/api.ts` & `client/src/context/AuthContext.tsx`)**:
>    - ใน `client/src/api.ts`: เพิ่ม `if (data.token) setStoredToken(data.token);` เพื่อบันทึก Bearer Token ใหม่ลงใน LocalStorage
>    - ใน `client/src/context/AuthContext.tsx`: เพิ่ม `if (res.token) setToken(res.token);` ในฟังก์ชัน `changePassword` เพื่อซิงก์ Auth state ให้ถือ Token ใหม่อย่างต่อเนื่อง
> 3. **นำ Debug Component ของ Lab 1 ออก (`client/src/App.tsx`)**:
>    - นำ `<HomeOverview />` ออกจากหน้า Login (`LoginView`) และหน้าจอหลักของผู้ใช้ที่ล็อกอินแล้ว เพื่อให้ UI สวยงามและตรงตามสเปกหน้า 8 ของอาจารย์
>    - คงการเรนเดอร์ `<HomeOverview />` ไว้เฉพาะเงื่อนไข `isDevRequesterFlow` ในโหมดการทดสอบ (`import.meta.env.MODE === "test"`) เพื่อให้ชุดทดสอบเดิมของ Lab 1 ยังผ่านครบถ้วน
> 4. **Automated Tests**: เพิ่มชุดทดสอบใน `client/tests/lab-03/AppRoleNav.test.tsx` และ `client/tests/lab-03/ChangePassword.test.tsx` ตรวจสอบการตั้งแท็บตาม Role, การจัดเก็บ Token ใหม่ และความสะอาดของ UI รวมผ่านครบทั้ง 57 tests

---

---

### Reviewer comment I received (PR #60):

> ### Peer Review: Requester Session Regression & Resolution Indication Action (PR [#60](https://github.com/chanya06/toktickit/pull/60))
> 
> ตรวจโค้ดใน PR [#60](https://github.com/chanya06/toktickit/pull/60) เทียบกับสเปก Lab 3, Handout (Section 1, 4.3, 8.2) และ Issue [#49](https://github.com/chanya06/toktickit/issues/49) เรียบร้อยแล้ว
> 
> **จุดเด่นที่ทำได้ดี:**
> - ฝั่ง Backend ทำ Data Isolation รัดกุม ป้องกันไม่ให้ Requester เข้าถึงหรือระบุ requesterId ของผู้ใช้อื่น (403 Forbidden)
> - ฟังก์ชัน POST /api/tickets/:id/resolve-indication ใช้ Prisma $transaction อัปเดตแฟล็ก isResolutionIndicated: true พร้อมสร้าง PublicComment แบบ Atomic ได้ถูกต้องตาม BR-19
> - มีชุดทดสอบครอบคลุมทั้ง API Authorization และ Resolution Indication ครบถ้วน
> 
> **จุดบกพร่องที่ต้องแก้ไขก่อน Merge (Request Changes):**
> 1. **แก้ไข State Wipeout ใน TicketDetailView.tsx หลังกดส่งสัญญาณ Resolution (บรรทัดที่ 43):**
>    - ปัจจุบันมีการเรียก `setTicket(res.ticket);` โดยตรง แต่ API ส่งกลับมาเฉพาะ partial fields (id, ticketNumber, status, isResolutionIndicated) ทำให้ฟิลด์อื่นๆ ทั้งหมด (Summary, Description, Category, Priority, CreatedAt) กลายเป็น undefined ส่งผลให้หน้าจอข้อมูลตั๋วหายเกลี้ยงทันทีที่กดยืนยัน
>    - **วิธีแก้:** ให้ทำ State Merge กับข้อมูลเดิม: `setTicket((prev) => (prev ? { ...prev, ...res.ticket } : res.ticket));`
> 2. **แก้ไขแท็บ Attachments หมุนค้างในหน้าตั๋วของ User ที่ล็อกอิน (AttachmentSection.tsx):**
>    - ใน `client/src/components/AttachmentSection.tsx` ยังไม่ได้เชื่อมต่อกับ AuthContext ยังคงใช้เฉพาะ `const { selectedRequester } = useRequester();`
>    - เมื่อล็อกอินด้วย User จริงใน Lab 3 ค่า `selectedRequester` จะเป็น `null` ทำให้ฟังก์ชัน `loadAttachments` ติดเงื่อนไข `if (!selectedRequester) return;` และค้างสถานะ `loading: true` เกิด Spinner หมุนค้างตลอดกาล
>    - ฟังก์ชัน Upload, Download และ Soft-remove ไม่ทำงานเพราะติดเงื่อนไขเดียวกัน
>    - **วิธีแก้:** ให้ดึง `user` จาก `AuthContext` มาสร้าง `effectiveRequesterId` เช่นเดียวกับใน `TicketDetailView` และ `MyTicketsView`:
>      ```tsx
>      const auth = useContext(AuthContext);
>      const user = auth?.user;
>      const { selectedRequester } = useRequester();
>      const effectiveRequesterId = user ? user.id : selectedRequester?.id;
>      ```
>      แล้วเปลี่ยนเงื่อนไข Guard และการส่ง Request ให้ใช้ `effectiveRequesterId` แทน
> 3. **อัปเดต Traceability Table ใน docs/lab-03/tests.md:**
>    - ในแถว API-14 แก้ชื่อไฟล์ Automated Test ให้ตรงกับไฟล์ที่สร้างจริงเป็น `server/tests/lab-03/requester-resolution.api.test.ts` และเพิ่มการอ้างอิงชุดเทส UI `client/tests/lab-03/RequesterResolution.test.tsx` เพื่อให้คะแนน Traceability ใน Rubric สมบูรณ์

---

### How I responded (PR #60):

> ขอบคุณสำหรับการตรวจทานอย่างละเอียด ได้ดำเนินการปรับปรุงแก้ไขครบทั้ง 3 จุดเรียบร้อยแล้ว:
> 1. **ป้องกัน State Wipeout ใน TicketDetailView (`client/src/components/TicketDetailView.tsx`)**:
>    - ปรับการอัปเดต state ตั๋วหลังกดยืนยันสัญญาณ Resolution เป็น:
>      `setTicket((prev) => (prev ? { ...prev, ...res.ticket } : res.ticket));`
>    - ทำให้ฟิลด์ข้อมูลตั๋วเดิมทั้งหมด (Summary, Description, Category, Related System, Priority, Owner, CreatedAt) ยังคงอยู่ครบถ้วน พร้อมอัปเดตสถานะและแสดง Banner ได้อย่างสมบูรณ์
> 2. **เชื่อมต่อ AuthContext ใน AttachmentSection (`client/src/components/AttachmentSection.tsx`)**:
>    - นำเข้า `useContext(AuthContext)` เพื่อดึง `user` มาคำนวณ `effectiveRequesterId = user ? user.id : selectedRequester?.id`
>    - ปรับปรุง Guard conditions และการส่ง request ใน `loadAttachments`, `handleUpload`, `handleDownload`, และ `handleConfirmSoftRemove` ให้ใช้ `effectiveRequesterId`
>    - แก้ไขปัญหา Spinner หมุนค้าง และทำให้การอัปโหลด/ดาวน์โหลด/Soft-remove ไฟล์แนบสำหรับ Authenticated User ทำงานได้ถูกต้องสมบูรณ์
> 3. **อัปเดต Traceability Table และ Test File Map (`docs/lab-03/tests.md`)**:
>    - ปรับปรุงแถว **API-14** ในตาราง Traceability ให้ระบุไฟล์ทดสอบที่สร้างจริง:
>      - Server API Test: `server/tests/lab-03/requester-resolution.api.test.ts`
>      - Client UI Test: `client/tests/lab-03/RequesterResolution.test.tsx`
>    - อัปเดต Test Suite File Map ใน Section 2 ครอบคลุมทั้งสองไฟล์ทดสอบเพื่อความสมบูรณ์ของคะแนน Traceability ตาม Rubric
> 4. **ผลการทดสอบ & Build**:
>    - Server Tests: ผ่านครบ 79/79 tests (11 suites)
>    - Client Tests: ผ่านครบ 64/64 tests (10 suites)
>    - Client Production Build: ผ่านสะอาดสมบูรณ์ ไม่มี error

---

### Reviewer comment I received (PR #62):

> ### ข้อเสนอแนะเพิ่มเติมสำหรับ PR [#62](https://github.com/chanya06/toktickit/pull/62) (Staff Ticket Queue UI)
> ตรวจเช็คเทียบกับ ui-spec.md และการใช้งานจริงอย่างละเอียดอีกครั้ง พบจุดที่อยากให้ช่วยปรับปรุงเพิ่มเติมอีกเล็กน้อยเพื่อความสมบูรณ์ตามสเปกของอาจารย์:
> 1. **เพิ่มคอลัมน์ Requested Priority ในตาราง Desktop (StaffTicketQueue.tsx):**
>    - ตามสเปก Screen 3 ของ ui-spec.md กำหนดให้ตารางแสดงทั้ง Requested Priority (ที่ผู้ใช้ขอมา) ควบคู่กับ IT Priority (ที่ IT ประเมิน)
>    - ปัจจุบันในตารางมีเฉพาะ IT Priority รบกวนเพิ่มคอลัมน์ Requested Priority พร้อม Badge เข้าไปในตารางด้วย
> 2. **รีเซ็ตหน้ากลับไปหน้า 1 เมื่อเปลี่ยนการ Sort (StaffTicketQueue.tsx):**
>    - ที่ Dropdown queueSortBy และปุ่มสลับลูกศร queueSortDir รบกวนเพิ่ม setPage(1) ด้วยเช่นกัน เพราะถ้าเปิดดูค้างอยู่ที่หน้า 2 หรือ 3 แล้วกดเปลี่ยนการจัดเรียง ลิสต์ควรเริ่มต้นแสดงผลจากหน้าแรก
> 3. **ปรับสี Row Hover Highlight ให้ตรงตาม Zen Green Token:**
>    - ตามสเปกระบุให้แถวตารางเวลาเอาเมาส์ชี้เปลี่ยนเป็นสี #EAF6EF (Pale Highlight) รบกวนเพิ่มสไตล์ hover บนแถวตารางให้ตรงตามโทเคน
> 4. **ปรับเกลี่ยความกว้างคอลัมน์ (Width %) ให้รวมกันได้ 100%:**
>    - ตอนนี้ width รวมใน <th> เกินไปที่ 110% เมื่อเพิ่มคอลัมน์ Requested Priority แล้ว ให้ช่วยเกลี่ยสัดส่วนเปอร์เซ็นต์ให้ลงตัวพอดี 100%

---

### How I responded (PR #62):

> ขอบคุณสำหรับข้อเสนอแนะที่ละเอียดและช่วยให้ UI ตรงตามสเปกอย่างสมบูรณ์ ได้ดำเนินการปรับปรุงแก้ไขครบทั้ง 4 ข้อเรียบร้อยแล้ว:
> 1. **เพิ่มคอลัมน์ Requested Priority (`client/src/components/StaffTicketQueue.tsx`)**:
>    - เพิ่มคอลัมน์ `Req. Priority` ในตาราง Desktop พร้อม Badge สีตามระดับ Priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) และเพิ่ม Badge แสดงใน Mobile Card View ควบคู่กับ IT Priority
> 2. **รีเซ็ตหน้ากลับไปหน้า 1 เมื่อเปลี่ยนการ Sort (`client/src/components/StaffTicketQueue.tsx`)**:
>    - เพิ่มการเรียก `setPage(1)` ทั้งใน `onChange` ของ `queueSortBy` และใน `onClick` ของปุ่มสลับทิศทางการเรียงลำดับ `queueSortDir`
> 3. **ปรับสี Row Hover Highlight ให้ตรงตาม Zen Green Token (`client/src/index.css` & `StaffTicketQueue.tsx`)**:
>    - กำหนด `.table-hover tbody tr:hover` และคลาส `.staff-queue-table` ให้เปลี่ยนสีพื้นหลังเป็น `#EAF6EF` (Pale Highlight Token) พร้อมตั้งค่า `--bs-table-hover-bg: #EAF6EF`
> 4. **ปรับเกลี่ยความกว้างคอลัมน์ในตารางให้รวมกันได้ 100% พอดี**:
>    - Ticket No (13%), Date (11%), Summary (22%), Category (11%), Req. Priority (9%), IT Priority (9%), Status (10%), Owner (9%), Action (6%) รวมกันเท่ากับ 100% พอดี
> 5. **Automated Tests**:
>    - อัปเดตและเพิ่ม Assertions ใน `client/tests/lab-03/StaffTicketQueue.test.tsx` ครอบคลุมคอลัมน์ Requested Priority, การรีเซ็ตหน้าเมื่อสลับ Sort, และ Row Hover
>    - ผลการรันเทส: Client Tests ผ่าน 74/74 (11 suites), Server Tests ผ่าน 96/96 (12 suites), Client Build ผ่านสะอาดสมบูรณ์

---

### Reviewer comment I received (PR #63):

> ### Peer Review for PR [#63](https://github.com/chanya06/toktickit/pull/63): Changes Requested (IT Staff Ticket Operations & Status Matrix)
> ได้ตรวจสอบการทำงานของ PR [#63](https://github.com/chanya06/toktickit/pull/63) (Issue [#52](https://github.com/chanya06/toktickit/issues/52) / Task 24) ทั้ง Backend API, Frontend Operations Panel และชุดทดสอบทั้งหมดอย่างละเอียดเทียบกับ Handout Section 4, specification.md (BR-10 ถึง BR-14), api-spec.md (Section 2) และ ui-spec.md (Screen 4)
> การวางโครงสร้างระบบ Claim, Assign, IT Priority และ Status Transition ทำได้ดีมากและมีชุดทดสอบครอบคลุม แต่พบจุดบกพร่องที่ต้องปรับปรุงแก้ไข 4 จุดดังนี้:
> 1. **เพิ่มสถานะ REOPENED ใน Status Transition Matrix (สำคัญมาก):**
>    - ปัจจุบันใน `PERMITTED_STATUS_TRANSITIONS` (`server/src/routes/staff.ts`) และ `PERMITTED_NEXT_STATUSES` (`client/src/components/TicketDetailView.tsx`) ยังไม่มี Key `[TicketStatus.REOPENED]`
>    - ส่งผลให้เมื่อตั๋วถูก Reopen แล้ว ตัวเลือกสถานะถัดไปจะว่างเปล่า Dropdown ถูก Disable และ API ปฏิเสธด้วย 422 กลายเป็น Dead-end status
>    - รบกวนเพิ่ม Key REOPENED ทั้งฝั่ง Backend และ Frontend เช่น: `[TicketStatus.REOPENED]: [ TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CANCELLED, ]`
> 2. **อัปเดต getStatusBadgeClass ใน TicketDetailView.tsx ให้ครบ 8 สถานะ:**
>    - ปัจจุบันขาดสถานะ `WAITING_FOR_REQUESTER`, `REOPENED` และ `CANCELLED` ทำให้ตกไปเป็นสีเทา (`badge bg-secondary`) ทั้งหมด
>    - รบกวนปรับปรุงให้ครอบคลุมครบถ้วนและใช้สีตาม Zen Design Tokens
> 3. **ปรับข้อความปุ่ม Back ด้านล่าง (TicketDetailView.tsx บรรทัดที่ 729):**
>    - ปุ่มด้านล่างสุดยัง Hardcoded เป็น `&laquo; Back to My Tickets List`
>    - รบกวนปรับให้เปลี่ยนตาม Role เช่นเดียวกับปุ่มด้านบน: `&laquo; {isStaffOrAdmin ? "Back to Ticket Queue" : "Back to My Tickets List"}`
> 4. **เพิ่ม AbortSignal ใน fetchStaffAssignees (TicketDetailView.tsx):**
>    - รบกวนส่ง `AbortController.signal` เข้าไปใน `fetchStaffAssignees()` เพื่อป้องกันปัญหาตอน Component Unmount

---

### How I responded (PR #63):

> ขอบคุณสำหรับข้อเสนอแนะที่ละเอียดและสำคัญมาก ได้ดำเนินการปรับปรุงแก้ไขครบทั้ง 4 จุดเรียบร้อยแล้ว:
> 1. **เพิ่มสถานะ REOPENED ใน Status Transition Matrix (`server/src/routes/staff.ts` & `client/src/components/TicketDetailView.tsx`)**:
>    - เพิ่ม Key `[TicketStatus.REOPENED]: [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CANCELLED]` ใน `PERMITTED_STATUS_TRANSITIONS` ฝั่ง Server
>    - เพิ่ม `REOPENED: ["IN_PROGRESS", "RESOLVED", "CANCELLED"]` ใน `PERMITTED_NEXT_STATUSES` ฝั่ง Client
>    - อัปเดตข้อกำหนด BR-14 ใน `docs/lab-03/specification.md` ให้ครอบคลุมเส้นทาง Transition จาก `REOPENED` ชัดเจน
>    - เพิ่มชุดทดสอบใน `server/tests/lab-03/staff-ticket-detail.api.test.ts` และ `client/tests/lab-03/StaffTicketDetail.test.tsx` ตรวจสอบการเปลี่ยนสถานะจาก `REOPENED` ทั้งหมด
> 2. **อัปเดต Badge ครบ 8 สถานะตาม Zen Design Tokens (`client/src/components/TicketDetailView.tsx`)**:
>    - อัปเดต `getStatusBadgeClass` และเพิ่ม `getStatusBadgeStyle` ครอบคลุมทั้ง 8 สถานะตาม `ui-spec.md`:
>      - `NEW`: Blue (`#DBEAFE` / `#1E40AF`)
>      - `OPEN`: Green (`#DCFCE7` / `#15803D`)
>      - `IN_PROGRESS`: Amber (`#FEF3C7` / `#B45309`)
>      - `WAITING_FOR_REQUESTER`: Purple (`#F3E8FF` / `#6B21A8`)
>      - `RESOLVED`: Emerald (`#D1FAE5` / `#065F46`)
>      - `CLOSED`: Dark Slate (`#E2E8F0` / `#334155`)
>      - `REOPENED`: Orange (`#FFEDD5` / `#C2410C`)
>      - `CANCELLED`: Red (`#FEE2E2` / `#B91C1C`)
> 3. **ปรับปุ่ม Back ด้านล่างให้เป็น Role-Aware Contextual (`client/src/components/TicketDetailView.tsx`)**:
>    - ปรับเป็น `&laquo; {isStaffOrAdmin ? "Back to Ticket Queue" : "Back to My Tickets List"}` ให้สอดคล้องกับปุ่มด้านบนและ Breadcrumbs
> 4. **ส่ง AbortSignal ใน fetchStaffAssignees (`client/src/components/TicketDetailView.tsx`)**:
>    - ใช้ `AbortController` ใน `useEffect` พร้อมส่ง `controller.signal` ไปยัง `fetchStaffAssignees(controller.signal)` และเรียก `controller.abort()` ใน cleanup function ป้องกันปัญหา Memory Leak / Unmounted Component
> 5. **ผลการทดสอบ & Build**:
>    - Server Tests: ผ่านครบ 116/116 tests (13 test files)
>    - Client Tests: ผ่านครบ 90/90 tests (12 test files)
>    - Client Production Build: ผ่านสะอาดสมบูรณ์ ไม่มี error

---

### Reviewer comment I received (PR #64):

> ### ผลการตรวจสอบ PR [#64](https://github.com/chanya06/toktickit/pull/64): REQUEST CHANGES / RECOMMEND IMPROVEMENTS
> ภาพรวมของฟังก์ชันหลัก ระบบความปลอดภัย การจำกัดสิทธิ์ตามบทบาท (RBAC) และ Business Rules ทำงานได้ถูกต้องครบถ้วนตามข้อกำหนด Lab-03 แต่พบจุดบกพร่องด้าน UX และ State ในหน้าบ้านที่ควรพิจารณาแก้ไขก่อนทำการ Merge:
> ประเด็นที่ควรปรับปรุง (Issues to Address):
> 1. **ตัวเลข Badge บนแท็บแสดงเป็น (0) เสมอตอนเข้าหน้ารายละเอียดตั๋ว:**
>    - เนื่องจากแท็บเปิดมาที่ Attachments เป็นค่าเริ่มต้น และใช้ Conditional Rendering ทำให้แท็บ Public Comments และ Internal Notes ยังไม่ถูก Mount ตัวนับ Badge จึงค้างอยู่ที่ 0 ตลอดเวลาจนกว่าผู้ใช้จะคลิกเข้าไป
>    - ข้อเสีย: ทำให้ผู้ใช้หรือ Staff เข้าใจผิดว่าไม่มีข้อความหรือบันทึกภายในอยู่เลย
>    - แนะนำ: ทำ Prefetch ข้อมูลนับจำนวนตั้งแต่ Mount หน้ารายละเอียด หรือย้ายการเรียก API ไปไว้ใน Hook ระดับบน
> 2. **ข้อความที่กำลังพิมพ์หลุดหายเมื่อสลับแท็บ (Draft State Loss):**
>    - การสลับแท็บไปดูรูปภาพแนบหรือดูข้อมูลอื่นจะทำให้ CommentsSection / InternalNotesSection ถูก Unmount ส่งผลให้ข้อความที่กำลังพิมพ์อยู่ใน Textarea หายไปทันที
>    - แนะนำ: ใช้การซ่อนแสดงด้วย `style={{ display: activeTab === '...' ? 'block' : 'none' }}` หรือยก State ของข้อความขึ้นมาเก็บที่ Parent
> 3. **ลำดับแท็บกับแท็บเริ่มต้นไม่สอดคล้องกัน:**
>    - แท็บแรกคือ Public Comments แต่ระบบตั้งค่าเริ่มต้นให้เปิดที่ Attachments (แท็บที่ 3) ควรพิจารณาตั้งค่าเริ่มต้นให้เปิดที่แท็บแรก หรือจัดลำดับให้สอดคล้องกัน
> 4. **การนำ Middleware กลับมาใช้ซ้ำใน Backend (`server/src/routes/comments.ts`):**
>    - ปัจจุบันมีการเขียน `if (!req.user)` และ `if (req.user.mustChangePassword)` เองในทุก Endpoint ควรเปลี่ยนมาใช้ `requireAuth` และ `requirePasswordChanged` จาก `auth.ts` เพื่อความกระชับและเป็นมาตรฐานเดียวกัน

---

### How I responded (PR #64):

> ขอบคุณสำหรับข้อเสนอแนะที่ละเอียดและช่วยยกระดับทั้ง UX และ Code Quality ได้ดำเนินการปรับปรุงแก้ไขครบทั้ง 4 ประเด็นใน commit `071dbbc`:
> 1. **Prefetch ข้อมูลตัวนับ Badge ตั้งแต่ Mount หน้ารายละเอียด (`client/src/components/TicketDetailView.tsx`)**:
>    - ปรับการเรนเดอร์แท็บเนื้อหา (`CommentsSection`, `InternalNotesSection`, `AttachmentSection`) ให้อยู่ใน DOM ตลอดเวลาและควบคุมการแสดงผลผ่าน `style={{ display: activeTab === '...' ? 'block' : 'none' }}`
>    - ส่งผลให้ `useEffect` ภายใน Components ดึงข้อมูลคอมเมนต์และบันทึกภายในทันทีที่โหลดหน้ารายละเอียดตั๋ว ตัวเลข Badge จึงแสดงจำนวนจริงทันทีโดยไม่ต้องรอคลิกแท็บ
>    - คงความปลอดภัยระดับ RBAC อย่างเข้มงวด: `InternalNotesSection` จะถูกเรนเดอร์ลง DOM เฉพาะเมื่อ `isStaffOrAdmin === true` เท่านั้น Requester จะไม่มี Component หรือ API call ของ Notes หลุดออกไปเด็ดขาด
> 2. **ป้องกันข้อความร่างหลุดหายเมื่อสลับแท็บ (Draft State Preservation) (`client/src/components/TicketDetailView.tsx`)**:
>    - ด้วยการใช้ CSS `display: none` แทน Conditional Rendering ทำให้ State ของ Textarea (`newCommentText` และ `newNoteText`) ไม่ถูก Unmount ข้อความที่กำลังพิมพ์อยู่จึงคงอยู่ครบถ้วนเมื่อผู้ใช้สลับไปดู Attachments แล้วสลับกลับมา
> 3. **จัดระเบียบแท็บเริ่มต้นให้สอดคล้องกับแท็บแรก (`client/src/components/TicketDetailView.tsx`)**:
>    - ปรับค่าเริ่มต้นของ `activeTab` จาก `"attachments"` เป็น `"comments"` ให้ตรงกับแท็บแรกในแถบนำทาง
> 4. **นำ Middleware ใน Backend กลับมาใช้ซ้ำอย่างเป็นมาตรฐาน (`server/src/routes/comments.ts`)**:
>    - นำเข้าและใช้งาน `requireAuth`, `requirePasswordChanged`, และ `requireRole(Role.IT_STAFF, Role.ADMINISTRATOR)` จาก `../middleware/auth.js` ในทุก Endpoint ของ Comments และ Internal Notes
>    - กำจัดโค้ดตรวจสอบ `if (!req.user)` และ `if (req.user.mustChangePassword)` ที่ซ้ำซ้อนออกทั้งหมด โดยไม่ส่งผลกระทบต่อ Base Ticket Endpoints
> 5. **ชุดทดสอบและการตรวจสอบความถูกต้อง**:
>    - เพิ่มชุดทดสอบใน `client/tests/lab-03/CommentsNotes.test.tsx` ตรวจสอบการ Prefetch ตัวนับ Badge ตอน Mount, การเปิดที่แท็บ Public Comments เป็นค่าเริ่มต้น, และการรักษาข้อความร่าง Textarea ขณะสลับแท็บ
>    - ผลการรันเทส:
>      - Server Tests: ผ่านทั้งหมด 129/129 tests (14 test files)
>      - Client Tests: ผ่านทั้งหมด 99/99 tests (13 test files)
>      - Client Production Build (`tsc && vite build`): ผ่านสะอาดสมบูรณ์ ปราศจาก error

---

### Reviewer comment I received (PR #65):

> ### ผลการรีวิว PR [#65](https://github.com/chanya06/toktickit/pull/65): REQUEST CHANGES / RECOMMEND IMPROVEMENTS
> ระบบความปลอดภัย การควบคุมสิทธิ์ Router-level RBAC และ Safety Rules (BR-07, BR-08, BR-09) ทำงานได้ถูกต้องและรัดกุมมาก แต่จากการตรวจสอบความเข้ากันได้ของข้อมูลอย่างละเอียด พบจุดที่ควรปรับปรุงแก้ไขก่อนทำการ Merge ดังนี้:
> **ประเด็นที่ต้องปรับปรุงแก้ไข:**
> 1. **ความไม่สอดคล้องของฟิลด์ชื่อในโมเดล User (name vs fullName):**
>    - ใน Prisma schema มีทั้ง `fullName String` และ `name String?` (เพื่อความเข้ากันได้ย้อนหลังกับโค้ด Lab 2)
>    - ปัจจุบันใน `POST /api/admin/users` และ `PATCH /api/admin/users/:id` มีการบันทึกเฉพาะ `fullName` แต่ปล่อยให้ `name` เป็น `null`
>    - **แนะนำ:** ให้กำหนด `name: trimmedName` ควบคู่กับ `fullName: trimmedName` ทั้งในคำสั่ง `prisma.user.create` และ `prisma.user.update` เพื่อให้ข้อมูลชื่อครบถ้วนทั้งสองฟิลด์เหมือนใน `seed.ts`
> 2. **การรองรับฟิลด์แผนก (department):**
>    - ในโมเดล User มีฟิลด์ `department String?` และหน้าบ้านมีการแสดงผลแผนกของผู้ใช้
>    - ปัจจุบันใน `SAFE_USER_SELECT` และ Endpoint การสร้าง/แก้ไขผู้ใช้ยังไม่ได้อ่านค่าหรือส่งคืนฟิลด์ `department`
>    - **แนะนำ:** เพิ่มฟิลด์ `department?: string | null` ใน `CreateAdminUserPayload`, `UpdateAdminUserPayload`, `AdminUserResponse` และใน `SAFE_USER_SELECT` พร้อมทั้งบันทึกลงฐานข้อมูล
> 3. **เอกสารสารบัญไฟล์ทดสอบ (docs/lab-03/tests.md):**
>    - ในตารางที่ 1 มีการแมป API-10..13 ไปที่ `users-admin.api.test.ts` แล้ว แต่ในหัวข้อที่ 2 Test Suite File Map ยังขาดรายการของ `users-admin.api.test.ts`
>    - **แนะนำ:** เพิ่มบรรทัดอธิบายไฟล์ `users-admin.api.test.ts` ใต้หัวข้อ `### Backend Integration & Security Tests`

---

### How I responded (PR #65):

> ขอบคุณสำหรับคำแนะนำและข้อเสนอแนะที่ละเอียดและช่วยเพิ่มความสมบูรณ์ของระบบจัดการผู้ใช้ ได้ดำเนินการปรับปรุงแก้ไขครบทั้ง 3 ประเด็นเรียบร้อยแล้ว:
> 1. **ซิงโครไนซ์ฟิลด์ `name` ควบคู่กับ `fullName` (`server/src/routes/users.ts`)**:
>    - เพิ่มการกำหนด `name: trimmedName` ควบคู่กับ `fullName: trimmedName` ทั้งใน `prisma.user.create` (`POST /api/admin/users`) และ `prisma.user.update` (`PATCH /api/admin/users/:id`) เพื่อความเข้ากันได้แบบย้อนหลัง (Backwards Compatibility) 100% กับสคีมาและโค้ดของ Lab 2
>    - บรรจุ `name: true` ลงใน `SAFE_USER_SELECT` และเพิ่มใน `ALLOWED_SORT_FIELDS`
> 2. **รองรับฟิลด์แผนก `department` ครบวงจร (`server/src/routes/users.ts`, `client/src/api.ts`)**:
>    - เพิ่ม `department: true` ใน `SAFE_USER_SELECT` และ `ALLOWED_SORT_FIELDS`
>    - ปรับปรุง `POST /api/admin/users` ให้อ่านและตรวจสอบ `department` (optional string) แล้วบันทึกลงฐานข้อมูล
>    - ปรับปรุง `PATCH /api/admin/users/:id` ให้รองรับการอัปเดตหรือล้างค่า `department` (string หรือ `null`)
>    - ปรับปรุง TypeScript Interface ใน `client/src/api.ts`: เพิ่ม `department?: string | null` ใน `CreateAdminUserPayload`, `UpdateAdminUserPayload`, และ `AdminUserResponse`
> 3. **อัปเดตสารบัญไฟล์ทดสอบ (`docs/lab-03/tests.md`)**:
>    - เพิ่มรายการ `users-admin.api.test.ts` ในหัวข้อ `### Backend Integration & Security Tests` ใน Section 2 พร้อมระบุขอบเขตการทดสอบครอบคลุม API-10..13, name/fullName sync, department support, password reset และ safety rules
> 4. **ชุดทดสอบและการตรวจสอบความถูกต้อง**:
>    - อัปเดตชุดทดสอบใน `server/tests/lab-03/users-admin.api.test.ts` ทั้งในส่วนสร้างผู้ใช้ (POST) และแก้ไขผู้ใช้ (PATCH) ตรวจสอบการส่งคืนและจัดเก็บลง DB จริงของทั้ง `name`, `fullName`, และ `department`
>    - ผลการรันเทส:
>      - Server Tests: ผ่านทั้งหมด 149/149 tests (15 test files)
>      - Client Tests: ผ่านทั้งหมด 99/99 tests (13 test files)
>      - Client Production Build (`tsc && vite build`): ผ่านสะอาดสมบูรณ์ ปราศจาก error

---

### Reviewer comment I received (PR #66):

> ### ผลการรีวิว PR [#66](https://github.com/chanya06/toktickit/pull/66)
> จากการตรวจสอบการทำงานและซอร์สโค้ดอย่างละเอียด พบจุดบกพร่องด้านการตรวจสอบข้อมูล ความปลอดภัย และความถูกต้องของโค้ดที่จำเป็นต้องแก้ไขก่อนทำการ Merge ดังนี้:
> **ประเด็นที่ต้องแก้ไข (Required Changes):**
> 1. **Regex ตรวจสอบอักขระพิเศษในรหัสผ่านไม่ตรงกับเซิร์ฟเวอร์ (Password Regex Mismatch Bug):**
>    - ใน `UserManagementView.tsx` (บรรทัดที่ 651 และ 1201) ใช้ Regex: `/[!@#$%^&*(),.?":{}|<>]/` ในขณะที่ฝั่งเซิร์ฟเวอร์ `server/src/routes/auth.ts` รองรับอักขระเพิ่มเติม: `_`, `-`, `+`, `=`, `[`, `]`, `\`, `/`
>    - **แนวทางแก้ไข:** อัปเดต Regex ใน `UserManagementView.tsx` ให้ครอบคลุมอักขระพิเศษตามเซิร์ฟเวอร์: `/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/`
> 2. **ป้องกันการลดบทบาทตนเองโดยไม่ตั้งใจ (Self-Demotion Prevention):**
>    - ใน `EditUserModal` เมื่อแก้ไขบัญชีของตนเอง (`isSelf === true`) มีการ disable สวิตช์ `isActive` แล้ว แต่ช่องเลือก Role ยังเปิดให้แก้ไขได้
>    - **แนวทางแก้ไข:** เพิ่มคุณสมบัติ `disabled={isSelf}` ให้กับ `<select data-testid="edit-user-role">` เมื่อแก้ไขบัญชีตนเอง
> 3. **ไฟล์แก้ไขนอกขอบเขตของ PR (Out-of-Scope File):**
>    - มีการแก้ไขไฟล์ `server/src/utils/ticketNumber.ts` ติดเข้ามาใน PR นี้ ซึ่ง PR [#66](https://github.com/chanya06/toktickit/pull/66) มี Scope สำหรับหน้าจอ Admin User Management UI ([#55](https://github.com/chanya06/toktickit/issues/55)) เท่านั้น
>    - **แนวทางแก้ไข:** Revert ไฟล์ `server/src/utils/ticketNumber.ts` กลับคืนตาม `origin/lab3-staging`
> 4. **แก้ไขการตั้งชื่อ `data-testid` ในแถวตาราง:**
>    - มีการใช้ `data-testid={'user-table-row user-row-${u.id}'}` ซึ่งมีเว้นวรรค ทำให้การทดสอบแบบ Exact Match หา Element ไม่พบ
>    - **แนวทางแก้ไข:** ปรับเป็น `data-testid={'user-row-${u.id}'}`
> 5. **ซิงโครไนซ์ชื่อบน Header หลังแก้ไขโปรไฟล์ตนเอง:**
>    - ใน `EditUserModal` จังหวะ `onSuccess` หาก `updated.id === currentUser?.id` ควรเรียกฟังก์ชัน `refreshUser()` จาก `AuthContext` เพื่อให้ชื่อบนแถบ Navigation Bar ด้านบนอัปเดตตามทันที
> 6. **ใส่ Fallback ให้กับชื่อใน Toast Notification:**
>    - ควรปรับเป็น `fullName || name` เพื่อป้องกันกรณีแสดงผลคำว่า "undefined" หากเจอข้อมูลเดิมที่ไม่มีฟิลด์ `fullName`

---

### How I responded (PR #66):

> ขอบคุณสำหรับข้อเสนอแนะและผลการตรวจสอบที่ละเอียดและรอบคอบ ได้ดำเนินการปรับปรุงแก้ไขครบถ้วนทั้ง 6 ประเด็นเรียบร้อยแล้ว:
> 1. **ปรับปรุง Regex อักขระพิเศษให้ตรงกับเซิร์ฟเวอร์ 100% (`client/src/components/UserManagementView.tsx`, `client/src/components/ChangePasswordView.tsx`)**:
>    - อัปเดต Regex เป็น `/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/` ครอบคลุมทั้งเครื่องหมาย `_`, `-`, `+`, `=`, `[`, `]`, `\`, `/` ทำให้สามารถตั้งรหัสผ่านเช่น `Admin_2026` หรือ `Pass-1234!` ได้อย่างถูกต้อง
> 2. **ป้องกันการลดบทบาทตนเอง (Self-Demotion Prevention) (`client/src/components/UserManagementView.tsx`)**:
>    - เพิ่ม `disabled={isSelf}` ให้กับ `<select data-testid="edit-user-role">` ใน `EditUserModal` พร้อมข้อความกำกับ `(Role change disabled on your own logged-in account)` และมี Client-side Safety Check ป้องกันใน `handleSubmit`
> 3. **นำไฟล์นอกขอบเขตออกจาก PR (`server/src/utils/ticketNumber.ts`)**:
>    - Revert ไฟล์ `server/src/utils/ticketNumber.ts` ให้กลับไปตรงกับ `origin/lab3-staging` เพื่อคง Scope ของ PR ให้เจาะจงเฉพาะ Frontend Admin User Management UI ตามที่กำหนด
> 4. **แก้ไข `data-testid` แถวตาราง (`client/src/components/UserManagementView.tsx`)**:
>    - ปรับเป็น `data-testid={`user-row-${u.id}`}` (ไม่มีเว้นวรรค) และใช้ `className="user-table-row"` แทน
> 5. **ซิงโครไนซ์ชื่อบน Header หลังแก้ไขโปรไฟล์ตนเอง (`client/src/components/UserManagementView.tsx`)**:
>    - ใน `onSuccess` ของ `EditUserModal` หาก `updated.id === currentUser?.id` จะเรียก `await refreshUser?.()` จาก `useAuth()` ทันที ทำให้ชื่อผู้ใช้บนแถบนำทาง Header อัปเดตแบบ Real-time
> 6. **เพิ่ม Fallback ให้กับชื่อใน Toast Notifications (`client/src/components/UserManagementView.tsx`)**:
>    - กำหนด `fullName || name` ใน Toast Notification ทุกจุด (`created`, `updated`, `resettingUser`) ป้องกันการแสดงผล "undefined"
> 7. **ชุดทดสอบและการตรวจสอบความถูกต้อง**:
>    - เพิ่มเทสเคสใน `client/tests/lab-03/UserManagement.test.tsx` ตรวจสอบรหัสผ่านที่มี `_` และ `-`, ตรวจสอบการ Disable Role Select และการเรียก `refreshUser()` เมื่อแก้ไขโปรไฟล์ตนเอง
>    - ผลการรันเทส:
>      - Client Tests: ผ่านครบ 116/116 tests (15 test files)
>      - Server Tests: ผ่านครบ 149/149 tests (15 test files)
>      - Client Production Build (`tsc && vite build`): ผ่านสะอาดสมบูรณ์ ปราศจาก error

---

### Reviewer approval I received (PR #66 Round 2):

> ### ผลการตรวจสอบรอบแก้ไข PR [#66](https://github.com/chanya06/toktickit/pull/66) (APPROVED)
> ตรวจสอบโค้ดที่อัปเดตครบทั้ง 6 ข้อเรียบร้อยแล้ว:
> - Regex อักขระพิเศษตรงกับ Server และผ่านทุกเงื่อนไข
> - ป้องกันการลดบทบาทตนเอง (Self-demotion) เรียบร้อย
> - ถอนไฟล์ส่วนเกินออกนอก Scope
> - data-testid ถูกต้องและซิงก์ชื่อ Header ได้แบบ Real-time
> อนุมัติและ Merge เข้า `lab3-staging` เรียบร้อยแล้ว


---

### Reviewer comment I received (PR #67):

> ### ผลการรีวิว PR [#67](https://github.com/chanya06/toktickit/pull/67) (CHANGES REQUESTED)
> จากการตรวจสอบชุดทดสอบ Playwright E2E, ไฟล์คอนฟิก และความเข้ากันได้ของระบบอย่างละเอียด พบประเด็นสำคัญที่ต้องปรับปรุงก่อนทำการ Merge ดังนี้:
> 1. ปรับขอบเขต `testDir` ใน `playwright.config.ts` ให้เจาะจงเฉพาะ Lab 3 (`./e2e/lab-03`)
> 2. แก้ไข Browser Channel ใน `playwright.config.ts` ให้ตรงกับเอกสาร (ปรับเป็น `chromium`)
> 3. เพิ่ม Teardown คืนค่ารหัสผ่านของผู้ใช้ทดสอบใน E2E (Data Hygiene)
> 4. ปรับปรุงตัวเลขจำนวน Screenshots ใน `docs/lab-03/tests.md` เป็น 21 screenshots

---

### How I responded (PR #67):

> ขอบคุณสำหรับข้อเสนอแนะและผลการตรวจสอบที่ละเอียดและตรงจุด ได้ดำเนินการปรับปรุงแก้ไขครบทั้ง 4 ประเด็นเรียบร้อยแล้ว:
> 1. **ปรับขอบเขต `testDir` เป็น `./e2e/lab-03` (`playwright.config.ts`)**:
>    - กำหนด `testDir: "./e2e/lab-03"` ทำให้คำสั่ง `npm run test:e2e` และ Playwright runner โฟกัสเฉพาะชุดทดสอบของ Lab 3 ทั้ง 4 ไฟล์สเปก (12 tests) โดยตรง ไม่ดึงเทสของ Lab 2 มารันปะปน
> 2. **ปรับแต่ง Browser Profile เป็น Chromium มาตรฐาน (`playwright.config.ts`)**:
>    - ปรับโปรเจกต์เป็น `{ name: "chromium", use: { ...devices["Desktop Chrome"] } }` และนำ `channel: "msedge"` ออก เพื่อให้สอดคล้องกับเอกสาร `docs/lab-03/tests.md` และสามารถรันได้ทุกระบบปฏิบัติการรวมถึง Linux/CI Runners
> 3. **เพิ่ม Teardown คืนค่ารหัสผ่านใน E2E Suites (`e2e/lab-03/staff-ticket-flow.spec.ts`, `e2e/lab-03/user-administration.spec.ts`)**:
>    - ใน `staff-ticket-flow.spec.ts`: เพิ่ม `test.afterAll` เรียก Admin API รีเซ็ตรหัสผ่านของ Lisa Martinez (`lisa.martinez@toktickit.com`) กลับคืนเป็น `InitialPass123!`
>    - ใน `user-administration.spec.ts`: เพิ่ม `test.afterAll` เรียก Admin API รีเซ็ตรหัสผ่านของ Michael Brown (`michael.brown@example.com`) กลับคืนเป็น `InitialPass123!`
>    - รักษา Data Hygiene และความบริสุทธิ์ของข้อมูลในฐานข้อมูลให้พร้อมรันซ้ำได้โดยไม่ต้อง re-seed
> 4. **ปรับแก้จำนวน Screenshots ในเอกสาร (`docs/lab-03/tests.md`)**:
>    - ปรับตัวเลขในตาราง Execution Summary เป็น **21 screenshots** ครบถ้วนตามไฟล์หลักฐานจริงใน `artifacts/lab-03/screenshots/` (Screen 1: 3 ภาพ, Screen 2: 3 ภาพ, Screen 3: 3 ภาพ, Screen 4: 6 ภาพ, Screen 5: 6 ภาพ)
> 5. **ผลการทดสอบ & Build**:
>    - `npm run test:e2e`: ผ่านครบทั้ง 12/12 tests (Chromium)
>    - Server Tests: ผ่านครบ 149/149 tests (15 test files)
>    - Client Tests: ผ่านครบ 116/116 tests (15 test files)
>    - Client Production Build (`tsc && vite build`): ผ่านสะอาดสมบูรณ์

---

### Reviewer comment I received (PR #68):

> ### ผลการรีวิว PR [#68](https://github.com/chanya06/toktickit/pull/68)
> จากการตรวจสอบการแก้ไขโค้ด ชุดทดสอบ Playwright และเอกสารประกอบอย่างละเอียด พบประเด็นที่ต้องปรับปรุงแก้ไขก่อนทำการอนุมัติ ดังนี้:
> 1. **แก้ไขสถานะและนำข้อความ Reviewer Approval ล่วงหน้าออก (docs/lab-03/reviewer.md):**
>    - ในตารางสรุป PR บรรทัดที่ 24 ให้ปรับสถานะของ PR #67 / #68 กลับเป็น In Review ให้ตรงตาม Workflow จริง
>    - นำบล็อกข้อความ Reviewer approval I received (PR #67 Round 2) ที่ใส่ข้อความอนุมัติล่วงหน้าออก และเก็บบันทึกเฉพาะจุดที่ได้ดำเนินการแก้ไขจริง
> 2. **เพิ่ม Teardown คืนค่า Department ของ John Smith (e2e/lab-03/user-administration.spec.ts):**
>    - ใน Test ข้อ 3 มีการแก้ไข Department ของ admin@toktickit.com เป็น "IT Management Systems"
>    - ให้เพิ่มคำสั่งใน test.afterAll เพื่ออัปเดต Department ของ John Smith กลับคืนเป็น "IT Administration" เพื่อรักษาความสะอาดของฐานข้อมูล (Data Hygiene) ให้พร้อมสำหรับการรันซ้ำ
> 3. **ซิงก์สถานะ PENDING ใน Client (client/src/components/TicketDetailView.tsx):**
>    - ในเมื่อฝั่ง Server ได้เพิ่ม [TicketStatus.PENDING] ใน PERMITTED_STATUS_TRANSITIONS แล้ว ให้เพิ่มคีย์ PENDING: ["IN_PROGRESS", "RESOLVED", "CANCELLED"] ใน PERMITTED_NEXT_STATUSES ฝั่ง Client ด้วย เพื่อป้องกันไม่ให้ Dropdown เปลี่ยนสถานะบน UI ค้างและไม่มีตัวเลือกเมื่อเจอสถานะ PENDING

---

### How I responded (PR #68):

> ดำเนินการปรับปรุงแก้ไขครบทั้ง 3 ข้อเรียบร้อยแล้ว:
> 1. **ปรับสถานะและนำบล็อกข้อความอนุมัติล่วงหน้าออก (`docs/lab-03/reviewer.md`)**:
>    - ปรับสถานะของ PR #67 / #68 ในตารางสรุปกลับเป็น `In Review` ให้ตรงตามสถานะจริง
>    - นำบล็อกข้อความ Reviewer approval ล่วงหน้าออกทั้งหมด โดยบันทึกเฉพาะขั้นตอนที่ดำเนินการแก้ไขจริง
> 2. **เพิ่ม Teardown คืนค่า Department ของ John Smith (`e2e/lab-03/user-administration.spec.ts`)**:
>    - เพิ่มคำสั่งใน `test.afterAll` เรียก Admin API `PATCH /api/admin/users/:id` คืนค่า department ของ John Smith (`admin@toktickit.com`) กลับเป็น `"IT Administration"` ตามค่าเริ่มต้นใน `seed.ts` รักษา Data Hygiene ได้สมบูรณ์
> 3. **ซิงก์สถานะ PENDING ใน Client (`client/src/components/TicketDetailView.tsx`)**:
>    - เพิ่ม `PENDING: ["IN_PROGRESS", "RESOLVED", "CANCELLED"]` ใน `PERMITTED_NEXT_STATUSES`, เพิ่ม `PENDING: "Pending"` ใน `STATUS_LABELS`, และเพิ่มสี Badge ใน `getStatusBadgeStyle` ป้องกัน Dropdown ค้างเมื่อตั๋วมีสถานะ PENDING
> 4. **ผลการทดสอบ & Build**:
>    - `npm run test:e2e`: ผ่านครบ 12/12 tests
>    - Server Tests: ผ่านครบ 149/149 tests
>    - Client Tests: ผ่านครบ 116/116 tests
>    - Client Production Build: ผ่านสะอาดสมบูรณ์

---

## Pull Requests I reviewed for my partner (@titayaaa)


| PR | Branch | Reviewer verdict |
| :--- | :--- | :--- |
| *To be updated during peer reviews* | - | - |


