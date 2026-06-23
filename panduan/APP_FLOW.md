# App Flow & User Journey
# EduSampah - Aplikasi Edukasi Pemilahan Sampah (LMS Version)

## 1. User Flow Diagram (Based on Wireframes)

```
┌─────────────────┐
│  Splash Screen  │  (Screen 01)
│    [ LOGO ]     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  First Time?    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
   Yes       No
    │         │
    ▼         ▼
┌─────────┐ ┌──────────┐
│Onboarding│ │   Login  │  (Screen 03)
│(Screen 02│ │          │
└────┬─────┘ └─────┬────┘
     │             │
     │        ┌────┴──────┐
     │        │           │
     │    Registered?    New?
     │        │           │
     │        │           ▼
     │        │    ┌────────────┐
     │        │    │  Register  │  (Screen 04)
     │        │    └──────┬─────┘
     │        │           │
     └────────┴───────────┘
              │
              ▼
      ┌──────────────┐
      │     HOME     │  (Screen 05)
      │  Dashboard   │
      │ + Progress   │
      └────┬─────────┘
           │
     ┌─────┴─────────────────────────┐
     │                               │
     ▼                               ▼
┌──────────┐     ┌──────────┐   ┌──────────┐
│  Materi  │     │ Evaluasi │   │  Profil  │
│ Edukasi  │     │    &     │   │   User   │
│(Screen 06│     │ Simulasi │   │(Screen 15│
└────┬─────┘     │(Screen 08│   └──────────┘
     │           └────┬─────┘
     ▼                │
┌──────────┐          │
│  Detail  │          ▼
│  Materi  │    ┌──────────────┐
│(Screen 07│    │ Pilih Tipe:  │
└──────────┘    │ • MC Quiz    │  (Screen 09)
                │ • Drag&Drop  │  (Screen 10)
                │ • Binary     │  (Screen 11)
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │    Hasil     │  (Screen 12)
                │  Evaluasi    │
                └──────┬───────┘
                       │
                  ┌────┴─────┐
                  │          │
                  ▼          ▼
           ┌────────────┐ ┌─────────┐
           │Pembahasan  │ │   UEQ   │  (Screen 14)
           │  Salah     │ │  Form   │  [THESIS]
           │(Screen 13) │ └─────────┘
           └────────────┘
```

## 2. Admin Flow Diagram

```
┌─────────────────┐
│  Admin Login    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Admin       │  (Screen 16)
│   Dashboard     │
└────────┬────────┘
         │
     ┌───┴───────────────────────┐
     │                           │
     ▼                           ▼
┌──────────┐              ┌──────────┐
│  Manage  │              │  Manage  │
│  Materi  │              │  Soal    │
│(Screen 17│              │(Screen 19│
└────┬─────┘              └────┬─────┘
     │                         │
     ▼                         ▼
┌──────────┐              ┌──────────┐
│   Form   │              │   Form   │
│  Materi  │              │ Instrumen│
│(Screen 18│              │(Screen 20│
└──────────┘              └──────────┘
     │
     └────────┬────────────┘
              │
              ▼
       ┌──────────────┐
       │  Analitik    │  (Screen 21)
       │     UEQ      │  [THESIS]
       └──────────────┘
```

## 3. Detailed Screen Flow - User Journey

### 3.1 First Launch & Authentication

**Flow: Splash → Onboarding → Login/Register → Home**

```
Screen 01: Splash Screen
├─ Logo EduSampah
├─ Loading indicator
└─ Auto-redirect (2-3 detik)
     ↓
Screen 02: Onboarding (First Time Only)
├─ Slide 1: "Mari Belajar Memilah"
├─ Slide 2: Fitur Modul Edukasi
├─ Slide 3: Praktek Simulasi
├─ Pagination dots (1/3, 2/3, 3/3)
└─ Button: "Selanjutnya"
     ↓
Screen 03: Login
├─ Input Email
├─ Input Password
├─ Link "Lupa Password"
├─ Button "Masuk"
└─ Link "Belum punya akun? Daftar di sini"
     ↓ (if not registered)
Screen 04: Register
├─ Input Nama Lengkap
├─ Input Email
├─ Input Password
├─ Input Konfirmasi Password
└─ Button "Daftar Akun"
     ↓
Screen 05: Home Dashboard
```

### 3.2 Learning Path - Materi Edukasi

**Flow: Home → List Materi → Detail Materi → Mark Complete**

```
Screen 05: Home Dashboard
├─ User greeting: "Hai, [Nama]!"
├─ Progress Card:
│  ├─ "3 / 10 Modul"
│  ├─ "30% Selesai"
│  └─ Progress bar visual
├─ Statistik:
│  ├─ Rata-rata Skor Kuis: 85
│  └─ Simulasi Diselesaikan: 5
└─ Bottom Nav → Tap "Materi"
     ↓
Screen 06: List Materi Edukasi
├─ Search bar: "Cari materi pembelajaran..."
├─ Filter badges:
│  ├─ [Semua] (active)
│  ├─ [Organik]
│  └─ [Anorganik]
└─ Card list:
   ├─ Card 1: "Pengenalan Kompos"
   │  ├─ Badge: [ORGANIK]
   │  ├─ Status: "Sudah dibaca" ✓
   │  ├─ Thumbnail
   │  └─ Preview text
   └─ Card 2: "Daur Ulang Plastik"
      ├─ Badge: [ANORGANIK]
      ├─ Status: New
      └─ Tap to open →
          ↓
Screen 07: Detail Materi
├─ Back button
├─ Menu (...)
├─ Banner gambar
├─ Badge kategori: [ORGANIK]
├─ Judul: "Pengenalan Kompos Rumah Tangga"
├─ Estimasi baca: 12 Menit
├─ Divider
├─ Content (scrollable):
│  ├─ Paragraf 1
│  ├─ Paragraf 2
│  └─ ...
└─ Button: "✓ Tandai Telah Selesai Dibaca"
     ↓
   Progress Updated → Back to List
```

### 3.3 Assessment Path - Evaluasi & Simulasi

**Flow: Home → Evaluasi List → Choose Type → Do Assessment → Results → Review/UEQ**

```
Screen 05: Home Dashboard
└─ Bottom Nav → Tap "Simulasi"
     ↓
Screen 08: Daftar Evaluasi & Simulasi
├─ Card 1: Evaluasi Teori
│  ├─ Badge: "Modul: Pengenalan Kompos"
│  ├─ "Evaluasi Teori Organik"
│  ├─ "10 Soal • Tipe: Pilihan Ganda"
│  ├─ Skor Terakhir: 80
│  └─ Button: "Kerjakan Ulang"
│       ↓
│  Screen 09: Evaluasi Pilihan Ganda
│  ├─ Header:
│  │  ├─ Close button [X]
│  │  ├─ "Soal 1 dari 10"
│  │  └─ Timer: [04:59]
│  ├─ Progress bar (10%)
│  ├─ Image referensi (optional)
│  ├─ Pertanyaan:
│  │  "Manakah dari berikut ini yang BUKAN
│  │   contoh sampah organik?"
│  └─ Options:
│     ├─ [A] Kulit Pisang
│     ├─ [B] Plastik Kresek ✓ (selected)
│     ├─ [C] Daun Kering
│     └─ [D] Sisa Nasi
│          ↓ (next question...)
│          ↓ (after last question)
│       Screen 12: Hasil Evaluasi
│
└─ Card 2: Simulasi Interaktif
   ├─ Badge: "Simulasi Interaktif"
   ├─ "Praktek Pemilahan Sampah"
   ├─ "15 Item • Tipe: Drag & Drop"
   ├─ Status: "Belum dicoba"
   └─ Button: "Mulai Simulasi"
       ↓
   Screen 10: Simulasi Drag & Drop 🎯 [CORE FEATURE]
   ├─ Header:
   │  ├─ Close [X]
   │  └─ "Simulasi Item: 2 / 10"
   ├─ Progress bar (20%)
   ├─ Instruction:
   │  "Praktek Pemilahan:
   │   Seret objek ke tong yang tepat!"
   ├─ Draggable Item Card:
   │  ├─ Image: [Sisa Apel]
   │  ├─ Label: "Sisa Apel"
   │  └─ Hint: "[ Tahan & Geser ]"
   └─ Drop Zones (2):
      ├─ [TONG ORGANIK] ← Drag here!
      └─ [TONG ANORGANIK]
          ↓ (after drop)
       Instant feedback (✓ or ✗)
          ↓ (next item...)
          ↓ (after all items)
       Screen 12: Hasil Evaluasi
       
   Alternative: Screen 11: Simulasi Klasifikasi Cepat
   ├─ Header: "Item: 3 / 10"
   ├─ Progress bar (30%)
   ├─ Big Image: [Botol Kaca]
   ├─ Item name: "Botol Kaca"
   ├─ Question: "Masuk kategori apakah benda ini?"
   └─ 2 Big Buttons:
      ├─ [O] ORGANIK
      └─ [A] ANORGANIK ✓ (selected)
          ↓
       Screen 12: Hasil Evaluasi
```

### 3.4 Results & Review Flow

```
Screen 12: Hasil Evaluasi Akhir
├─ Success icon [✓]
├─ "Evaluasi Selesai"
├─ "Simulasi Praktek Pemilahan"
├─ Score Card:
│  ├─ "Nilai Akhir Anda"
│  ├─ Big number: 80
│  └─ Badge: "LULUS EVALUASI"
├─ Statistics:
│  ├─ Jawaban Benar: 8
│  └─ Kesalahan Pemilahan: 2
├─ Button: "Lihat Riwayat Pembahasan"
│     ↓
│  Screen 13: Riwayat Pembahasan
│  ├─ Back button
│  ├─ "Pembahasan Salah"
│  ├─ Intro text
│  └─ Wrong Items List:
│     ├─ Item 1: "Botol Kaca Bekas"
│     │  ├─ Image mini
│     │  ├─ "Anda menjawab: Organik (SALAH)"
│     │  └─ Explanation box:
│     │     ├─ "Jawaban Benar: ANORGANIK"
│     │     └─ "Penjelasan: Kaca tidak dapat
│     │        diurai oleh mikroorganisme..."
│     └─ Item 2: ...
│
└─ Button: "Tutup & Kembali"
     ↓ (trigger UEQ if criteria met)
  Screen 14: Formulir UEQ 📊 [THESIS CRITICAL]
  ├─ "Evaluasi Pengalaman Pengguna"
  ├─ "Bantu kami meningkatkan aplikasi"
  ├─ 26 UEQ Items (scrollable):
  │  ├─ Item 1: "menyenangkan - tidak menyenangkan"
  │  │  └─ 7-point slider: [-3] to [+3]
  │  ├─ Item 2: "tidak dapat dipahami - dapat dipahami"
  │  │  └─ 7-point slider
  │  └─ ... (24 more items)
  ├─ Progress indicator: "5/26"
  └─ Button: "Submit Kuesioner"
       ↓
    Thank you message → Back to Home
```

### 3.5 User Profile & Settings

```
Screen 05: Home Dashboard
└─ Bottom Nav → Tap "Profil"
     ↓
Screen 15: Pengaturan Akun (Profil)
├─ Settings icon (gear)
├─ Profile Section:
│  ├─ Avatar circle
│  ├─ "Edit Profile" button
│  ├─ Username
│  └─ Email
├─ Statistics Cards:
│  ├─ Modul Selesai: 5
│  ├─ Total Evaluasi: 12
│  ├─ Total Poin: 850
│  └─ Achievement: 3
├─ Menu List:
│  ├─ Riwayat Aktivitas
│  ├─ Pengaturan Notifikasi
│  ├─ Ganti Password
│  ├─ Tentang Aplikasi
│  ├─ Kebijakan Privasi
│  └─ Logout
└─ Bottom Nav: [Beranda | Materi | Simulasi | Profil✓]
```

## 4. Admin Flow - Content Management System

### 4.1 Admin Dashboard

```
Admin Login
   ↓
Screen 16: Dasbor Admin (CMS Utama)
├─ Welcome message
├─ Statistics Overview:
│  ├─ Total Pengguna: 1,234
│  ├─ Total Materi: 45
│  ├─ Total Soal: 120
│  └─ UEQ Responses: 89
├─ Charts:
│  ├─ User Activity Graph
│  └─ Module Completion Rate
└─ Quick Access Menu:
   ├─ [Kelola Materi] → Screen 17
   ├─ [Kelola Soal] → Screen 19
   ├─ [Data UEQ] → Screen 21
   └─ [Kelola User]
```

### 4.2 Content Management - Materi

```
Screen 17: Admin Manage Materi
├─ Search & Filter bar
├─ Button: "+ Tambah Materi Baru"
│     ↓
│  Screen 18: Admin Form Materi
│  ├─ Back button
│  ├─ Input: Judul Materi
│  ├─ Upload: Banner Gambar
│  ├─ Dropdown: Kategori
│  │  ├─ Organik
│  │  └─ Anorganik
│  ├─ Rich Text Editor: Konten
│  │  ├─ Bold, Italic, Underline
│  │  ├─ Heading, List
│  │  └─ Image insert
│  ├─ Input: Estimasi Waktu Baca (menit)
│  ├─ Toggle: Status Publish
│  │  ├─ Draft
│  │  └─ Published
│  └─ Buttons:
│     ├─ [Simpan]
│     └─ [Batal]
│
└─ Table List:
   ├─ Columns: Judul | Kategori | Status | Aksi
   ├─ Row 1: "Pengenalan Kompos" | Organik | ✓ | [Edit][Delete]
   └─ Row 2: "Daur Ulang Plastik" | Anorganik | ✓ | [Edit][Delete]
```

### 4.3 Assessment Management - Bank Soal

```
Screen 19: Admin Manajemen Bank Soal
├─ Search & Filter:
│  ├─ By Type: [All] [MC] [Drag&Drop] [Binary]
│  └─ By Category: [All] [Organik] [Anorganik]
├─ Button: "+ Tambah Soal Baru"
│     ↓
│  Screen 20: Form Penyusun Instrumen
│  ├─ Back button
│  ├─ Dropdown: Tipe Soal
│  │  ├─ Pilihan Ganda (Multiple Choice)
│  │  ├─ Drag & Drop (Simulasi)
│  │  └─ Binary Classification
│  ├─ Input: Pertanyaan/Instruksi
│  ├─ Upload: Gambar Referensi (optional)
│  ├─ (if MC) Input Options:
│  │  ├─ Option A
│  │  ├─ Option B
│  │  ├─ Option C
│  │  └─ Option D
│  ├─ (if Drag&Drop/Binary) Input:
│  │  ├─ Nama Item
│  │  ├─ Upload Gambar Item
│  │  └─ Select Correct Answer: [Organik][Anorganik]
│  ├─ Radio: Jawaban Benar
│  ├─ Textarea: Penjelasan
│  ├─ Dropdown: Kategori
│  └─ Buttons: [Simpan] [Preview] [Batal]
│
└─ Table List:
   ├─ Columns: Soal | Tipe | Kategori | Aksi
   ├─ Row 1: "Manakah yang bukan..." | MC | Organik | [Edit][Delete]
   └─ Row 2: "Sisa Apel" | Drag&Drop | Organik | [Edit][Delete]
```

### 4.4 UEQ Analytics - Thesis Critical

```
Screen 21: Data Analitik UEQ 📊 [THESIS]
├─ Summary Card:
│  ├─ Total Responden: 89
│  ├─ Response Rate: 72%
│  └─ Last Updated: 2 hours ago
├─ UEQ Dimensions Bar Chart:
│  ├─ Attractiveness: +2.1 (Excellent) ████████
│  ├─ Perspicuity: +1.8 (Good) ███████
│  ├─ Efficiency: +1.5 (Above Average) ██████
│  ├─ Dependability: +1.9 (Good) ███████
│  ├─ Stimulation: +2.0 (Excellent) ████████
│  └─ Novelty: +1.7 (Good) ███████
│  └─ Scale: -3 (Negative) to +3 (Excellent)
├─ Benchmark Comparison:
│  └─ "Aplikasi ini berada di kategori EXCELLENT
│      untuk dimensi Attractiveness & Stimulation"
├─ Filters:
│  ├─ Date Range: [Last 7 days ▼]
│  └─ User Group: [All Users ▼]
├─ Detailed Statistics:
│  ├─ Mean, Std Deviation, Variance per dimension
│  └─ Item-level breakdown (26 items)
└─ Actions:
   ├─ Button: "Export CSV"
   ├─ Button: "Export PDF Report"
   └─ Button: "View Raw Data"
```

## 5. Navigation Structure

### 5.1 Bottom Navigation (User App)

```
┌─────────────────────────────────────────┐
│         [Screen Content Area]           │
│                                         │
│        All screens render here          │
│                                         │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  🏠        📚        🎮        👤        │
│ Beranda   Materi  Simulasi   Profil    │
│ (Screen5) (Screen6) (Screen8) (Screen15)│
└─────────────────────────────────────────┘
```

### 5.2 Screen Hierarchy

```
Root Stack Navigator
│
├─── Auth Stack (No Bottom Nav)
│    ├── Splash Screen (01)
│    ├── Onboarding (02)
│    ├── Login (03)
│    └── Register (04)
│
├─── Main App (Bottom Tab Navigator)
│    │
│    ├─── Home Tab (05)
│    │    └── Home Dashboard
│    │
│    ├─── Materi Tab
│    │    ├── List Materi (06)
│    │    └── Detail Materi (07) [Stack]
│    │
│    ├─── Simulasi Tab
│    │    ├── Daftar Evaluasi (08)
│    │    ├── Evaluasi MC (09) [Modal/Stack]
│    │    ├── Simulasi Drag&Drop (10) [Modal/Stack]
│    │    ├── Simulasi Binary (11) [Modal/Stack]
│    │    ├── Hasil Evaluasi (12) [Modal/Stack]
│    │    └── Pembahasan (13) [Stack]
│    │
│    └─── Profil Tab (15)
│         └── Settings screens [Stack]
│
├─── UEQ Modal (14)
│    └── Triggered after evaluasi completion
│
└─── Admin Stack (Separate App/Role)
     ├── Admin Dashboard (16)
     ├── Manage Materi (17)
     ├── Form Materi (18)
     ├── Manage Soal (19)
     ├── Form Instrumen (20)
     └── Analitik UEQ (21)
```

## 6. User Interactions & Gestures

### 6.1 Touch Interactions

**Tap/Press:**
- Button actions
- Card selection
- Navigation items
- Form inputs
- Image preview

**Long Press:**
- Context menu (admin features)
- Item options (bookmark, delete)

**Drag & Drop:** 🎯
- **Screen 10**: Drag sampah item → Drop to bin
- Visual feedback during drag
- Snap to drop zone
- Success/error animation

**Swipe:**
- Onboarding slides (Screen 02)
- Card dismissal (optional)
- Pull to refresh (list screens)

**Scroll:**
- Vertical: Content lists, article content
- Horizontal: Category filters

**Pinch/Zoom:**
- Image preview (materi, soal)

### 6.2 Feedback Mechanisms

**Visual Feedback:**
- Button press state (darker shade)
- Selected option highlight
- Progress bar updates
- Success/Error icons
- Loading spinners

**Haptic Feedback:**
- Correct answer in quiz
- Successful drag & drop
- Achievement unlocked
- Button press confirmation

**Toast/Snackbar:**
- "Materi berhasil diselesaikan"
- "Progres tersimpan"
- "Login berhasil"
- Error messages

**Modal/Dialog:**
- Confirmation: "Yakin ingin keluar?"
- Alert: "Anda harus login dulu"
- UEQ form (Screen 14)

**Animations:**
- Screen transitions: Slide/Fade (300ms)
- Success celebration: Confetti on high score
- Progress bar: Smooth fill animation
- Loading: Skeleton screens

## 7. Data Flow Architecture

```
USER ACTIONS
    ↓
REACT NATIVE COMPONENTS
    ↓
STATE MANAGEMENT
(Context API / Redux)
    ↓
    ├─────────────┬─────────────┬─────────────┐
    ▼             ▼             ▼             ▼
LOCAL           LOCAL        BACKEND      ANALYTICS
STORAGE         DATA          API          TRACKING
(AsyncStorage)  (JSON)     (REST/GraphQL)  (UEQ)
    │             │             │             │
    ├─ User       ├─ Materi    ├─ Auth       ├─ UEQ
    │  Profile    │  Content   ├─ Users      │  Responses
    ├─ Progress   ├─ Soal      ├─ Progress   ├─ Session
    ├─ Settings   │  Bank      ├─ Scores     │  Data
    └─ Cache      └─ Static    └─ Sync       └─ Events
                    Assets
```

### Data Storage Strategy

**Local (AsyncStorage):**
- User authentication token
- User profile data
- App preferences/settings
- Progress tracking (offline support)
- Cached materi content

**Backend Database:**
- User accounts & authentication
- Materi edukasi (CRUD)
- Bank soal (CRUD)
- Evaluasi scores & history
- **UEQ responses** (CRITICAL for thesis)
- Admin management

**Static Assets:**
- Images (materi, icons)
- Initial seed data (sample content)

## 8. Success Paths (Happy Flow)

### Path 1: New User → Complete First Module
```
Splash → Onboarding → Register → Home → 
Tap "Lanjutkan Belajar" → List Materi → 
Open "Pengenalan Kompos" → Read Complete → 
Mark Done ✓ → Progress 10% → Back to Home
```

### Path 2: User → Do Simulation → Get Score
```
Home → Bottom Nav "Simulasi" → 
Tap "Mulai Simulasi" (Drag&Drop) → 
Item 1: Sisa Apel → Drag to Organik ✓ → 
Item 2: Botol Plastik → Drag to Anorganik ✓ → 
... (all 10 items) → 
Results: 90/100 → View Pembahasan → 
UEQ Form Appears → Complete UEQ → Thank You!
```

### Path 3: Admin → Add New Materi
```
Admin Login → Dashboard → 
Tap "Kelola Materi" → "+ Tambah Materi Baru" → 
Fill Form (Title, Category, Content, Image) → 
Set Status: Published → Save ✓ → 
Materi appears in user app immediately
```

### Path 4: Admin → View UEQ Results
```
Admin Dashboard → Tap "Data UEQ" → 
View Bar Chart (6 dimensions) → 
Attractiveness: +2.1 (Excellent) ✓ → 
Export PDF Report → Download for thesis analysis
```

## 9. Error Handling & Edge Cases

### 9.1 Network Issues
- Show offline banner
- Cache last loaded data
- Retry mechanism with exponential backoff
- Graceful degradation

### 9.2 Empty States
- No materi yet: "Belum ada materi tersedia"
- No quiz attempted: "Mulai evaluasi pertamamu!"
- No UEQ data: "Belum ada responden"
- Search no results: "Materi tidak ditemukan"

### 9.3 Form Validation
- Required fields highlighted
- Email format validation
- Password strength indicator
- Confirm password match
- Image file size limit

### 9.4 Session Management
- Auto-logout after inactivity (30 min)
- Token refresh mechanism
- "Session expired" modal

## 10. Accessibility Considerations

- **Font Scaling**: Support system font size
- **Color Contrast**: WCAG AA compliance
- **Touch Targets**: Minimum 44x44 dp
- **Screen Reader**: Label all interactive elements
- **Keyboard Navigation**: Tab order for form inputs
- **Focus Indicators**: Clear visual focus states

## 11. Performance Optimizations

- **Lazy Loading**: Load materi content on demand
- **Image Optimization**: Compress, cache, progressive loading
- **Code Splitting**: Separate bundles for admin panel
- **Memoization**: React.memo for list items
- **Virtual Lists**: FlatList for long lists
- **Debouncing**: Search input with 300ms delay

---

**Note:** Alur aplikasi ini sudah disesuaikan 100% dengan 21 wireframe screens yang sudah dibuat. Fokus utama pada fitur LMS (Learning Management System) dan integrasi UEQ untuk keperluan skripsi.
