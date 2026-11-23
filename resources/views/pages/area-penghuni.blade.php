<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="csrf-token" content="{{ csrf_token() }}">
<title>Kosan Anwar – Area Penghuni</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;800&family=Figtree:wght@400;500;600&display=swap" rel="stylesheet">
@vite(['resources/css/pages/area-penghuni.css'])
</head>
<body>

<section id="login">
<form class="lbox" id="lform">
<h1>Kosan Anwar</h1>
<p>Masuk untuk melihat tagihan, mengunggah bukti transfer, dan melaporkan kerusakan.</p>
<label>Email<input type="email" id="em" value="rina@kost.com" autocomplete="username" readonly required></label>
<label>Kata sandi<input type="password" id="pw" value="password" autocomplete="current-password" readonly required></label>
<p class="err hidden" id="lerr"></p>
<button class="btn" type="submit">Masuk</button>
<p style="font-size:.85rem">Demo: kredensial sudah terisi. Sistem akan mengarahkan ke dashboard sesuai peran.</p>
</form>
</section>

<div id="app" class="hidden">
<header class="top"><div class="in"><div><div class="brand">Kosan Anwar</div><div class="who" id="who"></div></div><button id="out">Keluar</button></div></header>
<main id="view"></main>
<nav><div class="in" id="nav">
<button data-v="home" aria-current="page">Beranda</button>
<button data-v="bill">Tagihan</button>
<button data-v="issue">Keluhan</button>
</div></nav>
</div>

<dialog id="dPay" aria-labelledby="pT"><form id="fPay" class="stack">
<h2 id="pT">Unggah bukti transfer</h2>
<p class="sub" id="pS"></p>
<div class="bank">Transfer ke <b>BCA 1234567890</b> a.n. Anwar (contoh). Setelah itu unggah foto bukti transfernya.</div>
<div class="drop"><label>Foto bukti transfer (PNG atau JPG, maks. 2 MB)<input type="file" id="pF" accept="image/png,image/jpeg"></label><img id="pI" alt="Pratinjau bukti transfer" class="hidden"></div>
<p class="err hidden" id="pE"></p>
<div class="row"><button type="button" class="btn alt" data-close>Batal</button><button class="btn" id="pB" disabled>Kirim bukti</button></div>
</form></dialog>

<dialog id="dIss" aria-labelledby="iT"><form id="fIss" class="stack">
<h2 id="iT">Laporkan kerusakan</h2>
<label>Judul keluhan<input id="iJ" maxlength="60" placeholder="Contoh: Lampu kamar mandi mati" required></label>
<label>Deskripsi<textarea id="iD" placeholder="Jelaskan apa yang rusak dan sejak kapan" required></textarea></label>
<div class="drop"><label>Foto kerusakan (PNG atau JPG, maks. 2 MB, opsional)<input type="file" id="iF" accept="image/png,image/jpeg"></label><img id="iI" alt="Pratinjau foto kerusakan" class="hidden"></div>
<p class="err hidden" id="iE"></p>
<div class="row"><button type="button" class="btn alt" data-close>Batal</button><button class="btn">Kirim keluhan</button></div>
</form></dialog>

<dialog id="dKw" aria-labelledby="kT"><div class="stack">
<h2 id="kT">Kuitansi digital</h2>
<div class="kw" id="kBody"></div>
<button class="btn" data-close>Tutup</button>
</div></dialog>

<div id="toast" class="hidden" role="status" aria-live="polite"></div>

@vite(['resources/js/pages/area-penghuni.js'])
</body>
</html>
