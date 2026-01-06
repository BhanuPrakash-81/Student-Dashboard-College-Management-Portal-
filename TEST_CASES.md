# KL University Portal - System Testing Documentation

## 1. Introduction
This document outlines the test strategy and test cases executed for the KL University Frontend Development project. The objective is to validate that all functional and non-functional requirements are met and the system performs as expected.

## 2. Test Environment
*   **Operating System:** Windows 10 / 11
*   **Browser:** Google Chrome (v120+), Microsoft Edge
*   **Device:** Laptop (1920x1080 resolution)
*   **Backend Server:** Node.js v20+ running on Localhost:5000
*   **Database:** MySQL 8.0

---

## 3. Functional Test Cases

### Module 1: Authentication & Authorization

| Test ID | Test Description | Input Data / Action | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | Student Signup (Success) | Fill all fields, upload valid image, click "Sign Up" | Success message displayed: "Account created! Wait for approval." | **PASS** |
| **TC-AUTH-02** | Student Signup (Duplicate Email) | Enter an email already registered in DB | Error message: "Email already exists" | **PASS** |
| **TC-AUTH-03** | Login (Unapproved Student) | Enter valid credentials for a student not yet approved by Admin | Error message: "Awaiting admin approval" | **PASS** |
| **TC-AUTH-04** | Login (Invalid Password) | Enter valid email but wrong password | Error message: "Wrong password" | **PASS** |
| **TC-AUTH-05** | Student Login (Success) | Enter valid credentials (Approved Student) | Redirect to Student Dashboard | **PASS** |
| **TC-AUTH-06** | Admin Login (Success) | Enter valid Admin credentials | Redirect to Admin Dashboard | **PASS** |
| **TC-AUTH-07** | Logout Functionality | Click "Logout" in profile dropdown | Session cleared, redirect to Login page | **PASS** |

### Module 2: Dashboard & Navigation

| Test ID | Test Description | Input Data / Action | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-DASH-01** | Data Loading | Load Dashboard page | Overall Attendance %, CGPA, and Event Count match database values | **PASS** |
| **TC-DASH-02** | Notification Ticker | Create announcement with `is_active=1` in Admin | The announcement text scrolls horizontally in the orange ticker | **PASS** |
| **TC-DASH-03** | Ticker Hidden | Set all announcements to `is_active=0` | The orange ticker bar disappears completely | **PASS** |
| **TC-DASH-04** | Navbar Navigation | Click "Events", "Grades", etc. | URL changes and correct page component loads without refresh | **PASS** |

### Module 3: Events Module

| Test ID | Test Description | Input Data / Action | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-EVT-01** | View Events | Navigate to Events page | Grid of event cards displayed with Images, Titles, and Dates | **PASS** |
| **TC-EVT-02** | Filter Events | Select "Sports" from dropdown | Only events with type "Sports" are displayed | **PASS** |
| **TC-EVT-03** | Empty Filter Result | Select a category with no data | Message "No events found for this category" displayed | **PASS** |

### Module 4: Profile Management

| Test ID | Test Description | Input Data / Action | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-PROF-01** | View Profile | Navigate to Profile page | User details (Name, ID, Role) and Image displayed correctly | **PASS** |
| **TC-PROF-02** | Update Profile Image | Click "Change", select new JPG/PNG | Image updates immediately in Profile and Navbar | **PASS** |
| **TC-PROF-03** | Edit Personal Details | Click "Edit Details", change Last Name, Save | Name updates on screen and persists after reload | **PASS** |
| **TC-PROF-04** | Change Password (Mismatch) | Enter New Password != Confirm Password | Error message: "New passwords do not match" | **PASS** |
| **TC-PROF-05** | Change Password (Success) | Enter correct Old Pass and valid New Pass | Success message displayed, password updated in DB | **PASS** |

### Module 5: Admin Panel

| Test ID | Test Description | Input Data / Action | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-ADM-01** | View Pending Students | Load Admin Dashboard | List of students with `approved=0` is shown | **PASS** |
| **TC-ADM-02** | Approve Student | Click "Approve" button next to student | Student removed from list, DB `approved` set to 1 | **PASS** |
| **TC-ADM-03** | Create Event | Fill Title, Date, upload Image, click "Create" | Event added to list and visible on Student Events page | **PASS** |
| **TC-ADM-04** | Edit Event | Click Edit icon, change Title, Save | Event details updated in the list | **PASS** |
| **TC-ADM-05** | Delete Event | Click Trash icon, confirm dialog | Event removed from database and UI | **PASS** |
| **TC-ADM-06** | Post Announcement | Fill details, check "Show on Dashboard", Submit | Announcement added to list and Dashboard Ticker | **PASS** |
| **TC-ADM-07** | Toggle Announcement | Click "Visible/Hidden" badge | Status toggles between Active/Inactive immediately | **PASS** |

---

## 4. UI/UX & Responsiveness Testing

| Test ID | Test Description | Input Data / Action | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-UI-01** | Mobile Navbar | Resize window to < 768px | Top links disappear (simplified mobile view) | **PASS** |
| **TC-UI-02** | Card Grid Layout | View Events page on Mobile | Cards stack vertically (1 column) instead of 3 columns | **PASS** |
| **TC-UI-03** | Hover Effects | Hover over Event Cards | Card lifts up slightly with shadow effect | **PASS** |
| **TC-UI-04** | Form Validation | Submit empty forms | Browser tooltips "Please fill out this field" appear | **PASS** |

---

## 5. Database Integrity Testing

| Test ID | Test Description | Action | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-DB-01** | Password Hashing | Check `users` table after signup | Password column contains Bcrypt hash, not plain text | **PASS** |
| **TC-DB-02** | Image Storage | Upload image | Image stored as BLOB in DB, not filesystem path | **PASS** |
| **TC-DB-03** | Relationship Check | View Attendance | Data fetched correctly links `users` table and `subjects` table | **PASS** |

