# CerdikChat MVP v0.1 — Closed Beta

Aplikasi web chat responsif dengan frontend statis, backend Cloudflare Workers, dan satu model Gemini. Riwayat percakapan hanya berada di memori browser selama halaman terbuka; tidak ada database atau login.

## Prasyarat
- Akun Cloudflare
- Google AI Studio / Gemini API key
- Node.js LTS dan npm (untuk menjalankan/deploy dengan Wrangler)

## 1. Konfigurasi lokal

```bash
npm install -g wrangler
wrangler login
```

Buat file `.dev.vars` di folder proyek (jangan commit file ini):

```dotenv
GEMINI_API_KEY="TEMPELKAN_API_KEY_ANDA_DI_SINI"
GEMINI_MODEL="gemini-2.5-flash"
```

Jalankan:

```bash
wrangler dev
```

Buka alamat lokal yang ditampilkan Wrangler. Uji kirim pesan. Jika model tidak tersedia di akun/region atau kuota berbeda, ubah `GEMINI_MODEL` ke model Gemini yang tersedia bagi akun Anda.

## 2. Deploy ke Cloudflare Workers

```bash
wrangler secret put GEMINI_API_KEY
```
Masukkan API key saat diminta. Jangan masukkan API key ke `src/index.html`, repositori GitHub, atau chat publik.

Kemudian deploy:

```bash
wrangler deploy
```
Wrangler mengunggah `worker.js` dan aset di `src/`. Buka URL deployment yang ditampilkan, lalu uji endpoint chat.

## 3. Fitur yang sudah ada
- UI responsif desktop/mobile
- Prompt starter
- Chat dengan konteks beberapa pesan terakhir
- Validasi input dan batas karakter
- Pesan error dasar untuk masalah API/kuota
- API key disimpan sebagai secret backend
- Tanpa database, login, atau penyimpanan permanen

## 4. Batasan dan sebelum mengundang penguji

Ini adalah starter MVP, bukan layanan produksi yang telah diaudit atau dideploy. Belum ada autentikasi, rate limit per pengguna/IP yang persisten, CAPTCHA, moderasi khusus, observability, penghapusan data terpusat, atau jaminan uptime. Jangan memublikasikan URL secara luas sebelum menambah pembatasan penyalahgunaan. Jika beta dibuka ke publik, pasang rate limiting di Cloudflare, pantau pemakaian/biaya, dan tetapkan kebijakan privasi.

Untuk beta, gunakan data sintetis. Periksa ketentuan privasi dan penggunaan data Gemini API untuk tier yang dipakai. Kuota, harga, model, dan ketentuan layanan dapat berubah.
