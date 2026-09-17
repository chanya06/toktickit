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
| [PR #62](https://github.com/chanya06/toktickit/pull/62) | `feature/23-staff-queue-ui` | In Review |

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

## Pull Requests I reviewed for my partner (@titayaaa)

| PR | Branch | Reviewer verdict |
| :--- | :--- | :--- |
| *To be updated during peer reviews* | - | - |

