<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="csrf-token" content="{{ csrf_token() }}">
<title>Kosan Anwar – Kamar kosong di Kedaton, Bandar Lampung</title>
<link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}?v=2">
<link rel="shortcut icon" type="image/x-icon" href="{{ asset('favicon.ico') }}?v=2">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;800&family=Figtree:wght@400;500;600&display=swap" rel="stylesheet">
@vite(['resources/css/pages/calon-penghuni.css'])
</head>
<body>
<header class="top"><div class="wrap"><span class="brand">Kosan Anwar</span><a class="btn" id="waTop" href="#" target="_blank" rel="noopener">Hubungi pemilik</a></div></header>

<div class="hero"><div class="wrap">
<h1>Kamar kosong di Kedaton, siap ditempati</h1>
<p>Lihat kamar yang tersedia, harga bulanan, dan fasilitasnya. Tertarik? Hubungi pemilik langsung lewat WhatsApp.</p>
<p class="board-title">Status 8 kamar hari ini <span id="countTxt"></span></p>
<div class="board" id="board"></div>
</div></div>

<main>
<section class="list" id="kamar"><div class="wrap">
<div class="bar"><h2>Daftar kamar</h2>
<div class="chips" id="chips" role="group" aria-label="Filter kamar">
<button class="chip" data-f="kosong" aria-pressed="true">Kosong saja</button>
<button class="chip" data-f="semua" aria-pressed="false">Semua kamar</button>
<button class="chip" data-f="ac" aria-pressed="false">Ber-AC</button>
<button class="chip" data-f="murah" aria-pressed="false">Termurah dulu</button>
</div></div>
<div class="grid" id="grid"></div>
</div></section>

<section class="loc"><div class="wrap"><div class="box">
<div><h2>Lokasi kosan</h2>
<address>Jl. Sultan Haji Gg. Perintis IV No. 30,<br>Kedaton, Kec. Kedaton,<br>Kota Bandar Lampung, Lampung 35132</address></div>
<div class="acts">
<a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=Jl.+Sultan+Haji+Gg.+Perintis+IV+No.+30+Kedaton+Bandar+Lampung">Buka di Google Maps</a>
<a class="btn alt" id="waLoc" target="_blank" rel="noopener" href="#">Tanya lewat WhatsApp</a>
</div></div></div></section>
</main>

<footer><div class="wrap">Kosan Anwar · 8 unit kamar · Bandar Lampung</div></footer>

<dialog id="dlg" aria-labelledby="dTitle">
<div class="dhead"><h2 id="dTitle"></h2><button class="x" id="dClose" aria-label="Tutup">✕</button></div>
<div class="tabs"><button class="chip" data-t="foto" aria-pressed="true">Foto</button><button class="chip" data-t="360" aria-pressed="false">Video 360°</button></div>
<div class="media" id="media"></div>
<p class="hint" id="hint"></p>
<div class="dbody">
<dl class="dl" id="dl"></dl>
<ul class="fac" id="dFac"></ul>
<a class="btn" id="dWa" target="_blank" rel="noopener" href="#">Tanya kamar ini</a>
</div>
</dialog>

@vite(['resources/js/pages/calon-penghuni.js'])
</body>
</html>
