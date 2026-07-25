# BSPrep Quiz Prep Section - Google Drive Folder Structure & API Setup Guide

**Author**: rishsv (`rishwanthsv17@gmail.com`)  
**Repository**: [bsprep/bs-prep](https://github.com/bsprep/bs-prep)  
**Platform**: BSPrep (Academic Support for IIT Madras BS in Data Science)

---

## 1. Google Drive Folder Hierarchy Structure

To power the Quiz Prep engine from Google Drive, your drive root folder must follow this exact folder structure and naming convention:

```text
[Root Folder]  <-- Folder ID set in GOOGLE_DRIVE_ROOT_FOLDER_ID
 ├── Foundation
 │    ├── Mathematics I
 │    │    ├── Quiz 1
 │    │    │    ├── 2024-May-Shift1
 │    │    │    │    ├── Q1
 │    │    │    │    │    ├── question.png (or question.txt)
 │    │    │    │    │    ├── option1.png  (or option1.txt)
 │    │    │    │    │    ├── option2.png  (or option2.txt)  <-- ALWAYS CORRECT ANSWER!
 │    │    │    │    │    ├── option3.png  (or option3.txt)
 │    │    │    │    │    └── option4.png  (or option4.txt)
 │    │    │    │    ├── Q2
 │    │    │    │    └── Q3
 │    │    │    └── 2024-May-Shift2
 │    │    ├── Quiz 2
 │    │    └── End Term
 │    └── Statistics I
 ├── Diploma
 └── Degree
```

---

## 2. Exact Naming Rules & Security Contract

### A. Level Folders (Exact Names Required)
- `Foundation`
- `Diploma`
- `Degree`

### B. Course Folders
- Course title matching exact name (e.g., `Mathematics I`, `Statistics I`, `English I`, `Computational Thinking`).

### C. Exam Type Folders (Exact Names Required)
- `Quiz 1`
- `Quiz 2`
- `End Term`

### D. Date / Shift Folders
- Format: `YYYY-Month-ShiftX` (e.g., `2024-May-Shift1`, `2024-Sept-Shift2`).

### E. Question Folders
- Subfolders named `Q1`, `Q2`, `Q3`, `Q4`, etc.

### F. Files Inside Each Question Folder
- `question.png` / `question.jpg` / `question.txt` — Question prompt file.
- `option1.png` / `option1.txt` — Wrong Answer 1.
- `option2.png` / `option2.txt` — **CRITICAL SECURITY CONTRACT**:  
  **Option 2 MUST ALWAYS be the CORRECT answer in Drive.**  
  *The BSPrep server automatically anonymizes and shuffles all options using Fisher-Yates algorithm before serving to users.*
- `option3.png` / `option3.txt` — Wrong Answer 3.
- `option4.png` / `option4.txt` — Wrong Answer 4.

---

## 3. Google Cloud API Credentials Setup

### Step 1: Create Google Cloud Project
1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project named **BSPrep Quiz Engine**.
3. Enable **Google Drive API**.

### Step 2: Service Account & Key
1. Go to **APIs & Services -> Credentials -> Create Credentials -> Service Account**.
2. Name: `bsprep-drive-reader`.
3. Role: **Viewer**.
4. Generate a **JSON Key** and save it.

### Step 3: Share Drive Root Folder
1. Open your Google Drive Root Folder.
2. Share with the Service Account email (Viewer permission).
3. Copy Root Folder ID from the URL (`https://drive.google.com/drive/folders/<FOLDER_ID>`).

### Step 4: Environment Variables (`.env.local`)
```env
GOOGLE_DRIVE_ROOT_FOLDER_ID="YOUR_ROOT_FOLDER_ID_HERE"
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
TOKEN_SECRET_KEY="bsprep-quiz-secret-key-super-secure-32-bytes"
```
