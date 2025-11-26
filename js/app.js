// js/app.js
const API_URL = 'https://quran-api-id.vercel.app';

// elemen
const surahList = document.getElementById('surah-list');
const surahContent = document.getElementById('surah-content'); // welcome container
if (!surahList) console.error('Element #surah-list tidak ditemukan');
if (!surahContent) console.error('Element #surah-content tidak ditemukan');

// --- Fungsi: render daftar surah ---
async function loadSurahList() {
  try {
    const res = await fetch(`${API_URL}/surah`);
    const json = await res.json();
    const data = json.data || json.surahs || json; // antisipasi struktur

    if (!Array.isArray(data)) {
      surahList.innerHTML = "<li class='fs-5'>Daftar surah tidak tersedia</li>";
      console.error('Format data surah unexpected:', data);
      return;
    }

    // kosongkan dulu
    surahList.innerHTML = '';

    data.forEach((s) => {
      const li = document.createElement('li');
      li.className = 'fs-5 py-2 px-3 surah-item';
      li.style.cursor = 'pointer';
      // nomor surah (fallback ke index kalau tidak ada)
      const number = s.number ?? s.no ?? s.nomor ?? null;
      li.dataset.id = number;
      // ambil nama yg paling relevan
      const title =
        s.name?.transliteration?.id ||
        s.translation?.id ||
        s.name?.short ||
        s.name?.long ||
        s.short ||
        'Nama surat';
      li.textContent = `${number ? number + '. ' : ''}${title}`;
      surahList.appendChild(li);
    });
  } catch (err) {
    console.error('Gagal loadSurahList:', err);
    surahList.innerHTML = "<li class='fs-5'>Gagal memuat daftar surah</li>";
  }
}

// --- Fungsi: fetch & tampilkan detail surah (dekl. fungsi supaya hoisted) ---
async function loadSurahDetail(id) {
  if (!id) return;
  try {
    // Hapus kelas welcome (center) bila ada
    surahContent.classList.remove(
      'd-flex',
      'flex-column',
      'justify-content-center',
      'text-center'
    );

    // Loading state
    surahContent.innerHTML = `<div class="text-center text-secondary"><h4>Memuat surat...</h4></div>`;

    const res = await fetch(`${API_URL}/surah/${id}`);
    const json = await res.json();
    const surah = json.data || json; // antisipasi

    if (!surah || !surah.verses) {
      surahContent.innerHTML = `<p class="text-danger">Surat tidak ditemukan atau format tidak sesuai.</p>`;
      console.error('Surah data unexpected:', surah);
      return;
    }

    // header surat
    const arabName = surah.name?.short || surah.name?.long || '';
    const translit =
      surah.name?.transliteration?.id || surah.translation?.id || '';
    const headerHTML = `
      <div class="mb-5">
        <h1 class="fw-bold text-center">${translit || arabName}</h1>
        <p class="opacity-75 fw-semibold fs-4 text-center">Surat ke-${
          surah.number ?? id
        }</p>
      </div>
    `;

    // ayat
    const versesHTML = surah.verses
      .map((v) => {
        const num = v.number?.inSurah ?? v.number ?? '';
        const arab = v.text?.arab ?? v.ar ?? v.text ?? '';
        const translation =
          v.translation?.id ??
          v.translation ??
          v.translation?.text ??
          v.text?.translation ??
          '';

        return `
        <div class="w-100 mb-4">
          <div class="d-flex align-items-start justify-content-between">
            <span class="fs-4">${num}</span>
            <div class="text-end" style="max-width: 90%;">
              <h1 class="mb-2" style="font-family: 'Scheherazade', serif;">${arab}</h1>
              <p class="text-muted">${translation}</p>
            </div>
          </div>
        </div>
      `;
      })
      .join('');

    surahContent.innerHTML = headerHTML + versesHTML;
    // optional: scroll ke atas content
    surahContent.scrollTop = 0;
  } catch (err) {
    console.error('Gagal loadSurahDetail:', err);
    surahContent.innerHTML = `<p class="text-danger">Gagal memuat surat. Cek console untuk detail.</p>`;
  }
  // scroll ke atas setelah isi berubah
  surahContent.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

// --- Event delegation: klik surah di sidebar ---
surahList.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  const id = li.dataset.id;
  if (!id) return;
  // bersihkan active class dulu (opsional)
  document
    .querySelectorAll('.surah-item')
    .forEach((i) => i.classList.remove('active'));
  li.classList.add('active');
  // panggil fungsi yang sudah dideklarasikan
  loadSurahDetail(id);
});

// Jalankan awal
loadSurahList();
