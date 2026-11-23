// Kosan Anwar – Halaman Calon Penghuni
// Data kamar diambil dari API backend, bukan hardcoded.
var WA = "6281234567890";
var ROOMS = [];
var $ = function (s) { return document.querySelector(s); };
var rp = function (n) { return "Rp" + n.toLocaleString("id-ID"); };
var wa = function (t) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(t); };
var filter = "kosong";
var csrf = document.querySelector('meta[name="csrf-token"]') ? document.querySelector('meta[name="csrf-token"]').content : "";

function room(c, w) {
  var pal = ["#0E5A52", "#8A5A2B", "#3E5C8A", "#7A3E6B"][c % 4];
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' 220" ' + (w > 450 ? 'width="900" height="220"' : 'width="100%" preserveAspectRatio="xMidYMid slice" height="100%"') + ' aria-hidden="true">'
    + '<rect width="900" height="160" fill="var(--wall)"/><rect y="160" width="900" height="60" fill="var(--floor)"/>'
    + '<rect x="60" y="30" width="110" height="80" rx="4" fill="#BFE4F2"/><path d="M115 30v80M60 70h110" stroke="#fff" stroke-width="4"/>'
    + '<rect x="200" y="105" width="190" height="60" rx="6" fill="' + pal + '"/><rect x="200" y="90" width="50" height="30" rx="8" fill="#fff"/><rect x="195" y="165" width="8" height="25" fill="#444"/><rect x="387" y="165" width="8" height="25" fill="#444"/>'
    + '<rect x="480" y="40" width="85" height="150" rx="3" fill="' + pal + '" opacity=".85"/><path d="M522 40v150" stroke="#0004" stroke-width="2"/>'
    + '<rect x="640" y="120" width="120" height="10" fill="#6b4a2a"/><rect x="648" y="130" width="8" height="60" fill="#6b4a2a"/><rect x="744" y="130" width="8" height="60" fill="#6b4a2a"/><rect x="670" y="95" width="45" height="25" rx="3" fill="#222"/>'
    + '<rect x="820" y="40" width="60" height="150" rx="3" fill="#8a6a45"/><circle cx="866" cy="118" r="4" fill="#F3B63A"/></svg>';
}

function board() {
  var k = ROOMS.filter(function (r) { return r.st === "kosong"; }).length;
  $("#countTxt").textContent = "· " + k + " kosong";
  $("#board").innerHTML = ROOMS.map(function (r) {
    return '<button class="tagbtn' + (r.st === "kosong" ? "" : " off") + '" data-id="' + r.id + '" aria-label="' + r.n + ', ' + r.st + '">' + r.id + '<small>' + (r.st === "kosong" ? "Kosong" : "Terisi") + '</small></button>';
  }).join("");
}

function list() {
  var a = ROOMS.slice();
  if (filter === "kosong") a = a.filter(function (r) { return r.st === "kosong"; });
  if (filter === "ac") a = a.filter(function (r) { return r.ac && r.st === "kosong"; });
  if (filter === "murah") a = a.filter(function (r) { return r.st === "kosong"; }).sort(function (x, y) { return x.p - y.p; });
  if (filter === "semua") a.sort(function (x, y) { return (x.st === "terisi") - (y.st === "terisi"); });
  if (!a.length) { $("#grid").innerHTML = '<div class="empty">Belum ada kamar yang cocok. Coba pilih "Semua kamar" atau hubungi pemilik untuk daftar tunggu.</div>'; return; }
  $("#grid").innerHTML = a.map(function (r) {
    var ok = r.st === "kosong";
    return '<article class="card' + (ok ? "" : " full") + '" id="r' + r.id + '"><span class="pic">' + room(r.id, 450) + '</span><div class="body">'
      + '<div class="row"><h3>' + r.n + '</h3><span class="state">' + (ok ? "Kosong" : "Terisi") + '</span></div>'
      + '<div class="row"><span class="price">' + rp(r.p) + ' <small>/ bulan</small></span></div>'
      + '<p class="meta">' + r.sz + ' · Lantai ' + r.fl + '</p>'
      + '<ul class="fac">' + r.f.slice(0, 4).map(function (x) { return "<li>" + x + "</li>"; }).join("") + '</ul>'
      + '<button class="btn' + (ok ? "" : " alt") + '" data-open="' + r.id + '">' + (ok ? "Lihat detail kamar" : "Lihat info kamar") + '</button></div></article>';
  }).join("");
}

function open(id) {
  var r = ROOMS.filter(function (x) { return x.id == id; })[0];
  $("#dTitle").textContent = r.n;
  $("#dl").innerHTML = '<dt>Status</dt><dd>' + (r.st === "kosong" ? "Kosong" : "Terisi") + '</dd><dt>Harga</dt><dd>' + rp(r.p) + ' per bulan</dd><dt>Ukuran</dt><dd>' + r.sz + '</dd><dt>Lokasi</dt><dd>Lantai ' + r.fl + ', Jl. Sultan Haji Gg. Perintis IV No. 30, Kedaton</dd>';
  $("#dFac").innerHTML = r.f.map(function (x) { return "<li>" + x + "</li>"; }).join("");
  $("#dWa").href = wa("Halo, saya tertarik dengan " + r.n + " di Kosan Anwar. Apakah masih tersedia?");
  $("#dWa").textContent = r.st === "kosong" ? "Tanya kamar ini lewat WhatsApp" : "Tanya kamar serupa lewat WhatsApp";
  dlg.dataset.id = r.id; tab("foto");
  dlg.showModal();
}

function tab(t) {
  var r = +dlg.dataset.id;
  document.querySelectorAll("[data-t]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.t === t); });
  if (t === "foto") { $("#media").innerHTML = '<div style="height:240px">' + room(r, 450) + "</div>"; $("#hint").textContent = "Foto contoh. Foto asli kamar akan ditampilkan di sini."; }
  else { $("#media").innerHTML = '<div class="pan" tabindex="0" aria-label="Pratinjau 360 derajat, geser ke kiri atau kanan">' + room(r, 900) + "</div>"; $("#hint").textContent = "Geser ke kiri atau kanan untuk melihat seluruh ruangan."; }
}

// Load data kamar dari API
fetch("/api/rooms")
  .then(function (r) { return r.json(); })
  .then(function (data) {
    ROOMS = data;
    board();
    list();
  })
  .catch(function () {
    $("#grid").innerHTML = '<div class="empty">Gagal memuat data kamar. Coba muat ulang halaman.</div>';
  });

var dlg = $("#dlg");
$("#chips").addEventListener("click", function (e) { var b = e.target.closest("[data-f]"); if (!b) return; filter = b.dataset.f; document.querySelectorAll("[data-f]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); list(); });
$("#grid").addEventListener("click", function (e) { var b = e.target.closest("[data-open]"); if (b) open(b.dataset.open); });
$("#board").addEventListener("click", function (e) { var b = e.target.closest("[data-id]"); if (!b) return; var r = ROOMS.filter(function (x) { return x.id == b.dataset.id; })[0]; if (r.st === "terisi" && filter !== "semua") { filter = "semua"; document.querySelectorAll("[data-f]").forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.f === "semua"); }); list(); } open(r.id); });
document.querySelectorAll("[data-t]").forEach(function (b) { b.addEventListener("click", function () { tab(b.dataset.t); }); });
$("#dClose").addEventListener("click", function () { dlg.close(); });
dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
var hi = wa("Halo, saya ingin bertanya soal kamar kosong di Kosan Anwar.");
$("#waTop").href = hi; $("#waLoc").href = hi;
