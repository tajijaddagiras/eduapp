# Product Requirements Document (PRD)
# EduSampah - Aplikasi Edukasi Pemilahan Sampah (LMS Version)

## 1. Overview

### 1.1 Deskripsi Produk
Aplikasi mobile berbasis Android yang dirancang sebagai **Learning Management System (LMS)** untuk mengedukasi pengguna tentang pemilahan sampah organik dan anorganik melalui modul pembelajaran interaktif. Aplikasi ini dikembangkan menggunakan React Native dengan pendekatan metode Prototype dan akan dievaluasi menggunakan User Experience Questionnaire (UEQ) sebagai bagian dari penelitian skripsi.

### 1.2 Tujuan Aplikasi
- Menyediakan platform pembelajaran digital tentang pengelolaan sampah
- Memberikan edukasi terstruktur melalui modul pembelajaran
- Menyediakan simulasi interaktif untuk praktek pemilahan sampah
- Mengevaluasi pemahaman pengguna melalui sistem evaluasi (kuis)
- Mengukur User Experience menggunakan kuesioner UEQ
- Melacak progres belajar pengguna secara sistematis

### 1.3 Target Pengguna

**Pengguna Utama (Learner):**
- Pelajar dan mahasiswa
- Masyarakat umum yang ingin belajar tentang pemilahan sampah
- Komunitas peduli lingkungan

**Administrator (CMS):**
- Admin aplikasi yang mengelola konten
- Peneliti/developer yang menganalisis data UEQ
- Content creator yang membuat materi edukasi

## 2. Tech Stack

### 2.1 Framework & Library
- **Framework**: React Native (Cross-platform development)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: React Navigation
- **State Management**: React Context API / Redux Toolkit (opsional)
- **Icons**: React Native Vector Icons
- **Storage**: AsyncStorage / MMKV

### 2.2 Development Tools
- **IDE**: VS Code
- **Package Manager**: npm / yarn
- **Version Control**: Git
- **Testing**: Jest, React Native Testing Library

## 3. Fitur Utama

### 3.1 Authentication & Onboarding

**Splash Screen (Screen 01)**
- Logo aplikasi EduSampah
- Loading indicator
- Auto-redirect ke onboarding atau home

**Onboarding (Screen 02)**
- 3 slides pengenalan aplikasi
- Ilustrasi edukasi visual
- Pagination indicator
- Tombol "Selanjutnya" dan "Lewati"

**Login (Screen 03)**
- Input email dan password
- Tombol "Lupa Password"
- Link ke halaman register
- Validasi form

**Register (Screen 04)**
- Input nama lengkap, email, password, konfirmasi password
- Validasi email dan password strength
- Terms & conditions checkbox

### 3.2 Home Dashboard (Screen 05)

**Progress Tracking**
- Greeting dengan nama pengguna
- Progres materi edukasi (X/Y Modul - Z% Selesai)
- Progress bar visual
- Statistik evaluasi (rata-rata skor kuis, simulasi diselesaikan)

**Quick Actions**
- Tombol "Lanjutkan Belajar"
- Bottom navigation: Beranda, Materi, Simulasi, Profil

### 3.3 Materi Edukasi (LMS Core Feature)

**List Materi (Screen 06)**
- Search bar untuk mencari materi
- Filter kategori: Semua, Organik, Anorganik
- Card list dengan thumbnail, judul, deskripsi singkat
- Status indicator: "Sudah dibaca" / "Belum dibaca"
- Estimasi waktu baca

**Detail Materi (Screen 07)**
- Banner gambar materi
- Badge kategori (Organik/Anorganik)
- Judul materi
- Estimasi waktu baca
- Konten artikel lengkap (scrollable)
- Tombol "Tandai Telah Selesai Dibaca"
- Menu option (bookmark, share)

### 3.4 Evaluasi & Simulasi (Screen 08-13)

**Daftar Evaluasi (Screen 08)**
- Card evaluasi teori (Pilihan Ganda)
  - Nama modul terkait
  - Jumlah soal dan tipe
  - Skor terakhir
  - Tombol "Kerjakan Ulang"
- Card simulasi interaktif
  - Tipe simulasi (Drag & Drop, Binary)
  - Status: "Belum dicoba" / "Skor: X"
  - Tombol "Mulai Simulasi"

**Evaluasi Pilihan Ganda (Screen 09)**
- Timer countdown
- Progress bar
- Nomor soal (X dari Y)
- Gambar referensi soal (opsional)
- Pertanyaan
- 4 pilihan jawaban (A, B, C, D)
- Selected state visual
- Tombol close/exit

**Simulasi Drag & Drop (Screen 10) - FITUR INTI**
- Progress bar
- Counter item (X / Y)
- Instruksi: "Seret objek ke tong yang tepat"
- Draggable item card:
  - Gambar objek sampah
  - Nama objek
  - Hint: "Tahan & Geser"
- 2 Drop zones:
  - Tong ORGANIK
  - Tong ANORGANIK
- Visual feedback saat drag

**Simulasi Klasifikasi Cepat (Screen 11)**
- Progress bar
- Gambar objek berukuran besar
- Nama objek
- Pertanyaan: "Masuk kategori apakah benda ini?"
- 2 tombol besar:
  - ORGANIK
  - ANORGANIK
- Selected state dengan border highlight

**Hasil Evaluasi (Screen 12)**
- Icon success (centang besar)
- Judul "Evaluasi Selesai"
- Nama evaluasi yang diselesaikan
- Card nilai:
  - Nilai akhir (0-100)
  - Badge status: "LULUS EVALUASI" / "BELUM LULUS"
- Statistik:
  - Jawaban benar
  - Kesalahan pemilahan
- Tombol "Lihat Riwayat Pembahasan"
- Tombol "Tutup & Kembali"

**Pembahasan Kesalahan (Screen 13) - NEW**
- List item yang dijawab salah
- Setiap item menampilkan:
  - Gambar objek
  - Nama objek
  - Jawaban pengguna (salah)
  - Jawaban benar
  - Penjelasan detail mengapa benar/salah
- Border kiri berwarna untuk highlight
- Background berbeda untuk penjelasan

### 3.5 UEQ Integration (Screen 14) - CRUCIAL FOR THESIS

**Formulir UEQ Pengguna**
- Triggered setelah menyelesaikan evaluasi/simulasi tertentu
- 26 item kuesioner UEQ standar
- Skala bipolar 7-point untuk setiap dimensi:
  - Attractiveness (Daya Tarik)
  - Perspicuity (Kejelasan)
  - Efficiency (Efisiensi)
  - Dependability (Keterpercayaan)
  - Stimulation (Stimulasi)
  - Novelty (Kebaruan)
- Slider input untuk setiap item
- Progress indicator
- Tombol "Submit Kuesioner"
- Data tersimpan untuk analisis

### 3.6 Profil & Pengaturan (Screen 15)

**User Profile**
- Avatar pengguna
- Nama dan email
- Statistik personal:
  - Modul diselesaikan
  - Total poin
  - Evaluasi diselesaikan
- Riwayat aktivitas

**Pengaturan**
- Edit profil
- Notifikasi
- Ganti password
- Tentang aplikasi
- Kebijakan privasi
- Logout

### 3.7 Admin Panel (Screen 16-21) - CMS Feature

**Dashboard Admin (Screen 16)**
- Statistik keseluruhan:
  - Total pengguna
  - Total materi
  - Total soal kuis
  - Jumlah UEQ response
- Grafik user activity
- Quick access menu:
  - Kelola Materi
  - Kelola Soal
  - Lihat Data UEQ
  - Kelola User

**Manage Materi (Screen 17)**
- Table list semua materi
- Kolom: Judul, Kategori, Status, Aksi
- Search dan filter
- Tombol "Tambah Materi Baru"
- Action buttons: Edit, Delete, Preview

**Form Materi (Screen 18)**
- Input judul materi
- Upload banner gambar
- Pilih kategori (Organik/Anorganik)
- Rich text editor untuk konten
- Estimasi waktu baca
- Status publish (Draft/Published)
- Tombol "Simpan" dan "Batal"

**Manajemen Bank Soal (Screen 19)**
- Table list semua soal
- Kolom: Soal, Tipe, Kategori, Aksi
- Filter berdasarkan:
  - Tipe soal (Pilihan Ganda, Drag & Drop, Binary)
  - Kategori (Organik/Anorganik)
- Tombol "Tambah Soal Baru"
- Action buttons: Edit, Delete, Preview

**Form Penyusun Instrumen (Screen 20)**
- Dropdown tipe soal:
  - Pilihan Ganda
  - Drag & Drop (Simulasi)
  - Binary Classification
- Input pertanyaan/instruksi
- Upload gambar referensi
- Input pilihan jawaban (untuk MC)
- Pilih jawaban benar
- Input penjelasan
- Kategori (Organik/Anorganik)
- Tombol "Simpan" dan "Preview"

**Data Analitik UEQ (Screen 21) - THESIS CRITICAL**
- Jumlah responden UEQ
- Visualisasi hasil UEQ:
  - Bar chart untuk 6 dimensi
  - Mean score per dimensi
  - Benchmark comparison (-3 hingga +3)
  - Color coding: Negative, Neutral, Positive, Excellent
- Filter berdasarkan:
  - Periode waktu
  - Demografi pengguna (opsional)
- Export data (CSV/PDF) untuk analisis lebih lanjut
- Statistik deskriptif (mean, std deviation, variance)
- Interpretasi hasil berdasarkan standar UEQ

## 4. User Experience (UX) Requirements

### 4.1 Desain Antarmuka
- **Warna**: Tema hijau (eco-friendly) dengan aksen cerah
- **Typography**: Font yang mudah dibaca (Poppins, Inter, atau Roboto)
- **Layout**: Clean, minimalis, dan intuitif
- **Responsif**: Mendukung berbagai ukuran layar Android

### 4.2 Interaksi
- Animasi smooth dan natural
- Feedback visual untuk setiap aksi
- Loading state yang jelas
- Error handling yang user-friendly

### 4.3 Aksesibilitas
- Text scaling support
- High contrast mode (opsional)
- Screen reader friendly

## 5. Metode Prototype

### 5.1 Iterative Development
- **Prototype 1**: Wireframe & mockup low-fidelity
- **Prototype 2**: High-fidelity design dengan basic functionality
- **Prototype 3**: Fully functional prototype dengan semua fitur core
- **Prototype 4**: Refined version berdasarkan feedback UEQ

### 5.2 Testing Cycle
- Internal testing dengan tim developer
- Alpha testing dengan user terbatas
- Beta testing dengan target audience
- User Experience Questionnaire (UEQ) evaluation

## 6. User Experience Questionnaire (UEQ) Evaluation

### 6.1 Dimensi UEQ yang Diukur
1. **Attractiveness (Daya Tarik)**: Kesan keseluruhan produk
2. **Perspicuity (Kejelasan)**: Kemudahan untuk dipahami
3. **Efficiency (Efisiensi)**: Kecepatan dalam menyelesaikan tugas
4. **Dependability (Keterpercayaan)**: Kontrol dan keamanan
5. **Stimulation (Stimulasi)**: Motivasi penggunaan
6. **Novelty (Kebaruan)**: Inovasi dan kreativitas

### 6.2 Implementasi UEQ
- Survey UEQ diberikan setelah pengguna mencoba prototype
- Minimal 20-30 responden per iterasi
- Analisis hasil untuk improvement
- Iterasi berdasarkan feedback

## 7. Data Requirements

### 7.1 Data Lokal (AsyncStorage/MMKV)
- User profile data
- Quiz progress dan scores
- Favorite articles
- App settings dan preferences

### 7.2 Data Statis (JSON/Database Lokal)
- Daftar jenis sampah dan kategorinya
- Konten edukasi dan artikel
- Quiz questions dan answers
- Tutorial daur ulang

### 7.3 Data Eksternal (API - Fase 2)
- Lokasi bank sampah (Google Maps API)
- Leaderboard data
- User authentication (Firebase/Backend)
- Analytics dan tracking

## 8. Performance Requirements

### 8.1 Loading Time
- Initial app load: < 3 detik
- Screen transition: < 500ms
- Image loading: Progressive loading dengan placeholder

### 8.2 Responsiveness
- 60 FPS untuk animasi dan scroll
- Instant feedback untuk user interaction

### 8.3 Storage
- App size: < 50 MB (tanpa media tambahan)
- Efficient caching untuk gambar dan data

## 9. Security & Privacy

### 9.1 Data Privacy
- Tidak mengumpulkan data sensitif tanpa izin
- GDPR compliant (jika applicable)
- Clear privacy policy

### 9.2 Permissions
- Camera (untuk scan feature - opsional)
- Storage (untuk upload foto)
- Location (untuk bank sampah terdekat - opsional)

## 10. MVP (Minimum Viable Product) Scope

### Phase 1 (MVP) - Based on Wireframes
✅ **Authentication**
- Splash Screen
- Onboarding (3 slides)
- Login & Register

✅ **LMS Core Features**
- Home Dashboard dengan progress tracking
- List Materi Edukasi (dengan search dan filter)
- Detail Materi (dengan konten lengkap)
- Tracking status "Sudah Dibaca"

✅ **Evaluasi & Simulasi (FITUR INTI)**
- Daftar Evaluasi & Simulasi
- Evaluasi Pilihan Ganda (dengan timer dan progress)
- Simulasi Drag & Drop (praktek pemilahan)
- Simulasi Klasifikasi Cepat (binary choice)
- Hasil Evaluasi dengan scoring
- Pembahasan Kesalahan

✅ **UEQ Integration (CRUCIAL)**
- Formulir UEQ 26 items
- Penyimpanan data UEQ ke database

✅ **User Features**
- Profil pengguna
- Pengaturan akun
- Riwayat aktivitas

✅ **Admin Panel (CMS)**
- Dashboard Admin
- Manage Materi (CRUD)
- Form Materi dengan rich text editor
- Manajemen Bank Soal (CRUD)
- Form Penyusun Instrumen (untuk 3 tipe soal)
- Data Analitik UEQ dengan visualisasi

### Phase 2 (Enhancement) - Post MVP
- Notifikasi push reminder
- Leaderboard antar pengguna
- Achievement badges dan gamifikasi
- Export laporan UEQ lebih detail
- Multi-language support (English)
- Dark mode
- Offline mode dengan sync
- Social sharing features

## 11. Success Metrics

### 11.1 KPI (Key Performance Indicators)
- Daily Active Users (DAU)
- Quiz completion rate
- Average session duration
- User retention rate (D1, D7, D30)

### 11.2 UEQ Scores
- Target: Rata-rata score > 1.5 (Good) untuk semua dimensi
- Ideal: Score > 2.0 (Excellent)

## 12. Timeline Estimasi

- **Week 1-2**: Setup project, design system, implement wireframes to React Native components
- **Week 3-4**: Authentication & Onboarding implementation
- **Week 5-6**: LMS Core Features (Materi Edukasi CRUD, Progress Tracking)
- **Week 7-8**: Evaluasi & Simulasi (3 tipe: Pilihan Ganda, Drag & Drop, Binary)
- **Week 9**: UEQ Integration (Form + Data storage)
- **Week 10**: Admin Panel (CMS for content management)
- **Week 11**: Admin Analitik UEQ (Visualization + Export)
- **Week 12-13**: Testing, bug fixes, UEQ data collection from real users
- **Week 14**: UEQ analysis, final refinements, deployment

## 13. Risiko & Mitigasi

### 13.1 Risiko Teknis
- **React Native compatibility issues**: Test pada berbagai device
- **Performance issues**: Optimize images dan code splitting

### 13.2 Risiko User Adoption
- **Low engagement**: Gamifikasi dan reward system
- **Complex UI**: User testing dan iterative improvement

## 14. Dokumentasi

### 14.1 Technical Documentation
- Code documentation dengan JSDoc
- README.md dengan setup instructions
- API documentation (jika ada backend)

### 14.2 User Documentation
- In-app help dan FAQ
- Video tutorial (YouTube/website)
- User manual (PDF)

## 15. Deployment

### 15.1 Testing
- Unit testing (Jest)
- Integration testing
- E2E testing
- Manual QA testing

### 15.2 Release
- **Internal release**: Testing dengan tim internal
- **Beta release**: Google Play Console (Internal Testing)
- **Production release**: Google Play Store

---

## Lampiran

### A. Referensi
- React Native Documentation
- NativeWind Documentation
- UEQ Questionnaire Official Site
- Material Design Guidelines

### B. Contact
- Developer: [Nama Tim]
- Email: [Email Contact]
- Repository: [GitHub Link]
