<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="csrf-token" content="{{ csrf_token() }}">
<title>Kosan Anwar – Panel Owner</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;800&family=Figtree:wght@400;500;600&display=swap" rel="stylesheet">
@vite(['resources/css/pages/panel-owner.css'])
</head>
<body>

<section id="ownerLogin" class="hidden">
<form class="lbox" id="ownerLform">
<h1>Kosan Anwar</h1>
<p>Masuk sebagai pemilik untuk mengakses panel manajemen.</p>
<label>Email<input type="email" id="oEm" autocomplete="username" value="anwar@kost.com" readonly required></label>
<label>Kata sandi<input type="password" id="oPw" autocomplete="current-password" value="password" readonly required></label>
<p class="err hidden" id="oLerr"></p>
<button class="btn" type="submit">Masuk</button>
<p style="font-size:.85rem">Demo: kredensial pemilik kost sudah terisi otomatis.</p>
</form>
</section>

<div id="ownerApp" class="hidden">
<header class="top"><div class="in"><span class="brand">Kosan Anwar · Owner</span><div style="display:flex;align-items:center;gap:.75rem"><span class="sub" style="color:inherit;opacity:.9" id="ownerDate"></span><button id="ownerOut">Keluar</button></div></div></header>
<div class="tabs"><div class="in" id="tabs"></div></div>
<main id="view"></main>

<dialog id="dRej"><form id="fRej">
<h2>Tolak bukti pembayaran</h2>
<p class="sub" id="rS"></p>
<label>Alasan penolakan (wajib)<textarea id="rN" placeholder="Contoh: Nominal transfer kurang Rp50.000, mohon transfer sisanya dan unggah ulang." required></textarea></label>
<div class="row"><button type="button" class="btn alt" data-close>Batal</button><button class="btn bad">Tolak dan kirim catatan</button></div>
</form></dialog>

<dialog id="dRoom"><form id="fRoom">
<h2 id="roomT"></h2>
<div class="g2"><label>Nama kamar<input id="kN" required></label><label>Status<select id="kS"><option value="kosong">Kosong</option><option value="terisi">Terisi</option></select></label></div>
<div class="g2"><label>Harga per bulan (Rp)<input id="kP" type="number" min="0" step="10000" required></label><label>Ukuran<input id="kZ" placeholder="3 × 4 m"></label></div>
<div class="g2"><label>Lantai<input id="kL" type="number" min="1" value="1"></label><label>Fasilitas (pisahkan koma)<input id="kF" placeholder="Kasur, Lemari, AC"></label></div>
<div class="row"><button type="button" class="btn alt" data-close>Batal</button><button class="btn">Simpan kamar</button></div>
</form></dialog>

<dialog id="dTen"><form id="fTen">
<h2 id="tenT"></h2>
<div class="g2"><label>Nama penghuni<input id="tN" required></label><label>No. HP<input id="tH" inputmode="tel" required></label></div>
<label>Kamar<select id="tR"></select></label>
<div class="g2"><label>Kontrak mulai<input id="tM" type="date" required></label><label>Kontrak berakhir<input id="tA" type="date" required></label></div>
<p class="err hidden" id="tE"></p>
<div class="row"><button type="button" class="btn alt" data-close>Batal</button><button class="btn">Simpan penghuni</button></div>
</form></dialog>

<dialog id="dDel"><div class="stack"><h2 id="delT"></h2><p class="sub" id="delS"></p>
<div class="row"><button class="btn alt" data-close>Batal</button><button class="btn bad" id="delOk">Ya, lanjutkan</button></div></div></dialog>

<dialog id="dSlip"><div class="stack"><h2>Bukti transfer</h2><div class="slip" id="slipBox"></div><button class="btn" data-close>Tutup</button></div></dialog>
<div id="toast" class="hidden" role="status" aria-live="polite"></div>

@vite(['resources/js/pages/panel-owner.js'])
</body>
</html>
