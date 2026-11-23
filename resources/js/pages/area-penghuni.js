// Kosan Anwar – Area Penghuni
// Semua data diambil dari API backend. Tidak ada data hardcoded.
var USER = null, BILLS = [], ISSUES = [], ANN = [];
var STL = { belum: "Belum dibayar", pending: "Menunggu verifikasi", lunas: "Lunas", ditolak: "Ditolak" };
var ISL = ["Baru", "Diproses", "Selesai"];
var $ = function (s) { return document.querySelector(s); };
var rp = function (n) { return "Rp" + n.toLocaleString("id-ID"); };
var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
var csrf = function () { return document.querySelector('meta[name="csrf-token"]').content; };
var view = "home", payId = null;

function api(method, url, body) {
  var opts = {
    method: method,
    headers: { "Accept": "application/json", "X-CSRF-TOKEN": csrf() },
    credentials: "same-origin"
  };
  if (body && !(body instanceof FormData)) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  } else if (body) {
    opts.body = body;
  }
  return fetch(url, opts).then(function (r) {
    if (!r.ok) return r.json().then(function (e) { throw new Error(e.message || "Error " + r.status); });
    return r.json();
  });
}

function toast(t) { var e = $("#toast"); e.textContent = t; e.classList.remove("hidden"); clearTimeout(toast.t); toast.t = setTimeout(function () { e.classList.add("hidden"); }, 3200); }
function checkFile(f) {
  if (!f) return "";
  if (["image/png", "image/jpeg"].indexOf(f.type) < 0) return "Format file harus PNG atau JPG.";
  if (f.size > 2 * 1024 * 1024) return "Ukuran file " + (f.size / 1048576).toFixed(1).replace(".", ",") + " MB. Maksimal 2 MB, kecilkan foto lalu coba lagi.";
  return "";
}
function toBase64(file) {
  return new Promise(function (resolve, reject) {
    var r = new FileReader();
    r.onload = function () { resolve(r.result); };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
function preview(f, img) { var r = new FileReader(); r.onload = function () { img.src = r.result; img.classList.remove("hidden"); }; r.readAsDataURL(f); }

function bill(b, full) {
  var a = "";
  if (b.st === "belum") a = '<button class="btn" data-pay="' + b.id + '">Unggah bukti transfer</button>';
  if (b.st === "ditolak") a = '<div class="note"><b>Bukti ditolak.</b> ' + esc(b.catatan || "") + '</div><button class="btn" data-pay="' + b.id + '">Unggah ulang bukti</button>';
  if (b.st === "pending") a = '<p class="sub">Bukti sudah terkirim. Pemilik akan memeriksanya.</p>';
  if (b.st === "lunas") a = '<button class="btn alt" data-kw="' + b.id + '">Lihat kuitansi</button>';
  return '<div class="card"><div class="row"><h2>' + (full ? b.bln : "Tagihan " + b.bln) + '</h2><span class="badge b-' + b.st + '">' + STL[b.st] + '</span></div>'
    + '<div class="amt">' + rp(b.amt) + '</div><p class="sub">' + (b.st === "lunas" ? "Dibayar " + b.paid : "Tagihan bulan " + b.bln) + '</p>' + a + '</div>';
}
function steps(s) { return '<div class="steps" aria-label="Status: ' + ISL[s] + '">' + ISL.map(function (l, i) { return (i ? '<b></b>' : '') + '<span class="' + (i <= s ? "on" : "") + '"><i></i>' + l + '</span>'; }).join("") + '</div>'; }

function render() {
  document.querySelectorAll("#nav button").forEach(function (b) { b.setAttribute("aria-current", b.dataset.v === view ? "page" : "false"); });
  var h = "";
  if (view === "home") {
    var cur = BILLS.filter(function (b) { return b.st !== "lunas"; })[0] || BILLS[0];
    h = '<div><h1 style="font-size:1.7rem">Halo, ' + esc(USER.name.split(" ")[0]) + '</h1><p class="sub">Ringkasan kamar dan tagihan Anda.</p></div>'
      + (cur ? bill(cur) : '<div class="card"><p class="sub">Belum ada tagihan.</p></div>')
      + '<div class="card"><h2>Kamar Anda</h2><dl class="room"><dt>Kamar</dt><dd>' + esc(USER.tenant.room.name) + '</dd><dt>Sewa</dt><dd>' + rp(USER.tenant.room.price) + ' / bulan</dd><dt>Kontrak</dt><dd>' + USER.tenant.contract_start + ' sampai ' + USER.tenant.contract_end + '</dd></dl></div>'
      + '<div class="card"><h2>Pengumuman</h2>' + (ANN.length ? ANN.map(function (a) { return '<div class="ann"><h3>' + esc(a.j) + '</h3><p>' + esc(a.p) + '</p></div>'; }).join("") : '<p class="sub">Belum ada pengumuman.</p>') + '</div>';
  }
  if (view === "bill") h = '<h1 style="font-size:1.7rem">Tagihan</h1>' + (BILLS.length ? BILLS.map(function (b) { return bill(b, true); }).join("") : '<div class="empty">Belum ada tagihan.</div>');
  if (view === "issue") {
    h = '<div class="row"><h1 style="font-size:1.7rem">Keluhan</h1><button class="btn sm" id="newI">Buat keluhan</button></div>'
      + (ISSUES.length ? ISSUES.map(function (i) { return '<div class="card"><div class="row"><h2>' + esc(i.j) + '</h2></div><p class="sub">' + esc(i.d) + '</p><p class="sub">Dilaporkan ' + i.tgl + (i.foto ? ' · dengan foto' : '') + '</p>' + steps(i.st) + '</div>'; }).join("") : '<div class="empty">Belum ada keluhan. Ketuk "Buat keluhan" jika ada fasilitas yang rusak.</div>');
  }
  $("#view").innerHTML = h; window.scrollTo(0, 0);
}

function loadData() {
  return Promise.all([
    api("GET", "/api/my/bills").then(function (d) { BILLS = d; }),
    api("GET", "/api/my/issues").then(function (d) { ISSUES = d; }),
    api("GET", "/api/my/announcements").then(function (d) { ANN = d; })
  ]);
}

// Login
$("#lform").addEventListener("submit", function (e) {
  e.preventDefault();
  var er = $("#lerr");
  er.classList.add("hidden");
  api("POST", "/api/login", { email: $("#em").value.trim(), password: $("#pw").value })
    .then(function (user) {
      USER = user;
      loadData().then(function () {
        $("#login").classList.add("hidden");
        $("#app").classList.remove("hidden");
        $("#who").textContent = USER.name + " · " + (USER.tenant ? USER.tenant.room.name : "");
        render();
      });
    })
    .catch(function (err) {
      er.textContent = err.message || "Email atau kata sandi salah.";
      er.classList.remove("hidden");
    });
});

// Logout
$("#out").addEventListener("click", function () {
  api("POST", "/api/logout").finally(function () {
    USER = null; BILLS = []; ISSUES = []; ANN = [];
    $("#app").classList.add("hidden");
    $("#login").classList.remove("hidden");
  });
});

// Nav
$("#nav").addEventListener("click", function (e) { var b = e.target.closest("[data-v]"); if (b) { view = b.dataset.v; render(); } });

// View interactions (pay, kuitansi, new issue)
$("#view").addEventListener("click", function (e) {
  var p = e.target.closest("[data-pay]"), k = e.target.closest("[data-kw]");
  if (e.target.closest("#newI")) { $("#fIss").reset(); $("#iI").classList.add("hidden"); $("#iE").classList.add("hidden"); $("#dIss").showModal(); }
  if (p) {
    payId = p.dataset.pay;
    var b = BILLS.filter(function (x) { return x.id == payId; })[0];
    $("#pS").textContent = b.bln + " · " + rp(b.amt);
    $("#fPay").reset(); $("#pI").classList.add("hidden"); $("#pE").classList.add("hidden"); $("#pB").disabled = true;
    $("#dPay").showModal();
  }
  if (k) {
    var b2 = BILLS.filter(function (x) { return x.id == k.dataset.kw; })[0];
    $("#kBody").innerHTML = '<div class="stamp">LUNAS</div><dl><dt>No. kuitansi</dt><dd>' + b2.no + '</dd><dt>Penghuni</dt><dd>' + esc(USER.name) + '</dd><dt>Kamar</dt><dd>' + esc(USER.tenant.room.name) + '</dd><dt>Periode</dt><dd>' + b2.bln + '</dd><dt>Jumlah</dt><dd>' + rp(b2.amt) + '</dd><dt>Dibayar</dt><dd>' + b2.paid + '</dd></dl><p class="sub">Kuitansi ini diterbitkan otomatis setelah pemilik menyetujui pembayaran.</p>';
    $("#dKw").showModal();
  }
});

// File preview
$("#pF").addEventListener("change", function () {
  var f = this.files[0], m = checkFile(f), er = $("#pE");
  $("#pB").disabled = !f || !!m; er.textContent = m; er.classList.toggle("hidden", !m); $("#pI").classList.add("hidden");
  if (f && !m) preview(f, $("#pI"));
});

// Upload bukti transfer → kirim Base64
$("#fPay").addEventListener("submit", function (e) {
  e.preventDefault();
  var f = $("#pF").files[0];
  if (!f) return;
  toBase64(f).then(function (b64) {
    return api("POST", "/api/my/bills/" + payId + "/slip", { slip_data: b64 });
  }).then(function (updated) {
    var idx = BILLS.findIndex(function (x) { return x.id == payId; });
    if (idx >= 0) BILLS[idx] = updated;
    $("#dPay").close();
    toast("Bukti transfer terkirim. Status tagihan: menunggu verifikasi.");
    render();
  }).catch(function (err) {
    toast(err.message || "Gagal mengunggah bukti transfer.");
  });
});

// File preview keluhan
$("#iF").addEventListener("change", function () {
  var f = this.files[0], m = checkFile(f), er = $("#iE");
  er.textContent = m; er.classList.toggle("hidden", !m); $("#iI").classList.add("hidden");
  if (f && !m) preview(f, $("#iI"));
});

// Buat keluhan → kirim Base64 foto
$("#fIss").addEventListener("submit", function (e) {
  e.preventDefault();
  var f = $("#iF").files[0];
  var m = checkFile(f);
  if (m) { $("#iE").textContent = m; $("#iE").classList.remove("hidden"); return; }
  var photoPromise = f ? toBase64(f) : Promise.resolve(null);
  photoPromise.then(function (b64) {
    return api("POST", "/api/my/issues", {
      title: $("#iJ").value.trim(),
      description: $("#iD").value.trim(),
      photo_data: b64
    });
  }).then(function (issue) {
    ISSUES.unshift(issue);
    $("#dIss").close();
    toast("Keluhan terkirim. Pemilik akan menindaklanjuti.");
    render();
  }).catch(function (err) {
    toast(err.message || "Gagal mengirim keluhan.");
  });
});

document.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", function () { b.closest("dialog").close(); }); });
document.querySelectorAll("dialog").forEach(function (d) { d.addEventListener("click", function (e) { if (e.target === d) d.close(); }); });

// Cek apakah sudah login (reload halaman)
api("GET", "/api/me")
  .then(function (user) {
    USER = user;
    return loadData();
  })
  .then(function () {
    $("#login").classList.add("hidden");
    $("#app").classList.remove("hidden");
    $("#who").textContent = USER.name + " · " + (USER.tenant ? USER.tenant.room.name : "");
    render();
  })
  .catch(function () {
    // belum login — tampilkan form login
  });
