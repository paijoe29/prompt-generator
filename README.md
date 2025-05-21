# Text-to-Image Prompt Generator

Aplikasi web untuk menghasilkan prompt yang detail dan menarik untuk text-to-image AI seperti Midjourney, DALL-E, atau Stable Diffusion.

![Screenshot Aplikasi](/screenshot.png)

## Fitur

- ✨ Buat prompt yang detail berdasarkan kata kunci yang dimasukkan
- 🎨 Pilihan gaya seni (photorealistic, digital illustration, anime, dll)
- 🔄 Kompleksitas prompt yang dapat disesuaikan (simple, medium, complex)
- 📐 Aspect ratio yang dapat dipilih
- 🌈 Pilihan mood/nuansa untuk prompt
- 🧠 Powered by Google Gemini API
- 💾 Riwayat prompt yang disimpan secara lokal
- 🌓 Desain clean & modern dengan tema hitam-putih-kuning

## Teknologi yang Digunakan

- Node.js & Express.js
- EJS templating
- Tailwind CSS
- Google Gemini API
- JavaScript (Vanilla)

## Prasyarat

- Node.js (versi 14 atau lebih baru)
- API key Google Gemini

## Instalasi

1. Clone repository
   ```bash
   git clone https://github.com/username/text-to-image-prompt-generator.git
   cd text-to-image-prompt-generator
   ```

2. Install dependencies
   ```bash
   npm install
   # atau
   pnpm install
   ```

3. Buat file `.env` di root folder dan tambahkan API key Gemini Anda:
   ```
   GEMINI_API_KEY=your_api_key_here
   PORT=3000
   ```

4. Jalankan aplikasi
   ```bash
   npm start
   # atau
   pnpm start
   ```

5. Buka `http://localhost:3000` di browser Anda

## Penggunaan

1. Masukkan kata kunci yang mendeskripsikan gambar yang ingin Anda buat
2. Pilih gaya seni, kompleksitas, aspect ratio, dan mood sesuai kebutuhan
3. Pilih jumlah prompt yang ingin dihasilkan
4. Klik tombol "Generate Prompt"
5. Salin prompt yang dihasilkan dan gunakan di platform text-to-image AI pilihan Anda

## Kontribusi

Kontribusi dan saran selalu diterima. Silakan buat issue atau pull request untuk perbaikan atau penambahan fitur.


## Kontak

- Threads: [@ori_fin](https://www.threads.com/@ori_fin)