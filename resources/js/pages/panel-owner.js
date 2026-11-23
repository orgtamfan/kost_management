// Kosan Anwar – Panel Owner
// Semua data diambil dari API backend. Tidak ada data hardcoded.
var ROOMS = [], TEN = [], BILLS = [], ISS = [], ANN = [];
var MON = {};
var STL = { belum: "Belum dibayar", pending: "Menunggu verifikasi", lunas: "Lunas", ditolak: "Ditolak" };
var TABS = [["home", "Ringkasan"], ["bill", "Pembayaran"], ["room", "Kamar"], ["ten", "Penghuni"], ["iss", "Keluhan"], ["rep", "Laporan"]];
var view = "home", repM = "", editRoom = null, editTen = null, pendBill = null, onDel = null;
var $ = function (s) { return document.querySelector(s); };
function rp(n) { return "Rp" + n.toLocaleString("id-ID"); }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function csrf() { return document.querySelector('meta[name="csrf-token"]').content; }
function T(id) { return TEN.filter(function (x) { return x.id == id; })[0]; }
function R(id) { return ROOMS.filter(function (x) { return x.id == id; })[0]; }
function toast(t) { var e = $("#toast"); e.textContent = t; e.classList.remove("hidden"); clearTimeout(toast.t); toast.t = setTimeout(function () { e.classList.add("hidden"); }, 3000); }
function fd(s) { var d = new Date(s + "T00:00:00"); return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); }
function nPend() { return BILLS.filter(function (b) { return b.st === "pending"; }).length; }
function sumM(m, lunas) { return BILLS.filter(function (b) { return b.m === m && ((b.st === "lunas") === lunas); }).reduce(function (a, b) { return a + b.amt; }, 0); }

function api(method, url, body) {
  var opts = {
    method: method,
    headers: { "Accept": "application/json", "X-CSRF-TOKEN": csrf() },
    credentials: "same-origin"
  };
  if (body) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  return fetch(url, opts).then(function (r) {
    if (!r.ok) return r.json().then(function (e) { throw new Error(e.message || "Error " + r.status); });
    if (r.status === 204) return {};
    return r.json();
  });
}

function loadAll() {
  var curM = repM || new Date().toISOString().slice(0, 7);
  return Promise.all([
    api("GET", "/api/rooms").then(function (d) { ROOMS = d; }),
    api("GET", "/api/tenants").then(function (d) { TEN = d; }),
    api("GET", "/api/bills?month=" + curM).then(function (d) { BILLS = d; }),
    api("GET", "/api/issues").then(function (d) { ISS = d; }),
    api("GET", "/api/my/announcements").then(function (d) { ANN = d; }),
    api("GET", "/api/bills/months").then(function (d) {
      MON = {};
      var monthNames = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      d.forEach(function (m) {
        var parts = m.split("-");
        MON[m] = monthNames[+parts[1]] + " " + parts[0];
      });
      if (!repM && d.length) repM = d[0];
    })
  ]);
}

function render() {
  var curM = repM || new Date().toISOString().slice(0, 7);
  $("#tabs").innerHTML = TABS.map(function (t) {
    return '<button data-v="' + t[0] + '" aria-current="' + (t[0] === view ? "page" : "false") + '">' + t[1] + (t[0] === "bill" && nPend() ? '<span class="dot">' + nPend() + "</span>" : "") + "</button>";
  }).join("");

  var h = "";
  if (view === "home") {
    var occ = ROOMS.filter(function (r) { return r.st === "terisi"; }).length;
    var openIss = ISS.filter(function (i) { return i.st !== "Selesai"; }).length;
    h = '<div class="stats"><div class="stat"><b>' + occ + ' dari ' + ROOMS.length + '</b><span class="sub">kamar terisi</span></div><div class="stat"><b>' + rp(sumM(curM, true)) + '</b><span class="sub">pemasukan ' + (MON[curM] || curM) + '</span></div><div class="stat"><b>' + nPend() + '</b><span class="sub">bukti menunggu verifikasi</span></div><div class="stat"><b>' + openIss + '</b><span class="sub">keluhan belum selesai</span></div></div>'
      + '<div class="card"><h2>Status kamar</h2><div class="board">' + ROOMS.map(function (r) { return '<div class="tg' + (r.st === "kosong" ? "" : " off") + '">' + r.id + '<small>' + (r.st === "kosong" ? "Kosong" : "Terisi") + '</small></div>'; }).join("") + '</div></div>'
      + '<div class="card"><h2>Pengumuman untuk penghuni</h2><form id="fAnn" class="stack"><label>Judul<input id="aJ" required></label><label>Isi pengumuman<textarea id="aP" required></textarea></label><button class="btn" style="justify-self:start">Publikasikan</button></form>'
      + ANN.map(function (a) { return '<div class="item"><div class="l"><b>' + esc(a.j) + '</b><p class="sub">' + esc(a.p) + '</p></div><button class="btn bad sm" data-delAnn="' + a.id + '">Hapus</button></div>'; }).join("") + "</div>";
  }

  if (view === "bill") {
    var bs = BILLS.slice().sort(function (a, b) { return (b.st === "pending") - (a.st === "pending"); });
    h = '<div class="card"><h2>Tagihan ' + (MON[curM] || curM) + '</h2><p class="sub">Periksa bukti transfer, lalu setujui atau tolak dengan catatan.</p>'
      + bs.map(function (b) {
        var t = T(b.t);
        var tName = t ? esc(t.nama) : "(kontrak berakhir)";
        var rName = t ? R(t.room) ? R(t.room).n : "" : "";
        return '<div class="item"><div class="l"><b>' + tName + '</b>' + (rName ? " · " + rName : "") + '<p class="sub">' + rp(b.amt) + (b.no ? " · " + b.no : "") + (b.note ? " · Catatan: " + esc(b.note) : "") + '</p></div><span class="badge b-' + b.st + '">' + STL[b.st] + '</span>'
          + (b.st === "pending" ? '<div class="acts"><button class="btn alt sm" data-slip="' + b.id + '">Lihat bukti</button><button class="btn sm" data-ok="' + b.id + '">Setujui</button><button class="btn bad sm" data-no="' + b.id + '">Tolak</button></div>' : "")
          + (b.st === "belum" || b.st === "ditolak" ? '<div class="acts"><button class="btn alt sm" data-wa="' + b.id + '">Ingatkan via WhatsApp</button></div>' : "")
          + "</div>";
      }).join("") + "</div>";
  }

  if (view === "room") {
    h = '<div class="row"><h1 style="font-size:1.7rem">Kamar</h1><button class="btn" data-add="room">Tambah kamar</button></div><div class="card">'
      + ROOMS.map(function (r) {
        return '<div class="item"><div class="l"><b>' + esc(r.n) + '</b> · ' + rp(r.p) + '<p class="sub">' + esc(r.sz) + ' · Lantai ' + r.fl + ' · ' + esc((r.f || []).join(", ")) + '</p></div><span class="badge b-' + r.st + '">' + (r.st === "kosong" ? "Kosong" : "Terisi") + '</span><div class="acts"><button class="btn alt sm" data-er="' + r.id + '">Ubah</button><button class="btn bad sm" data-dr="' + r.id + '">Hapus</button></div></div>';
      }).join("") + "</div><p class=\"sub\">Perubahan kamar langsung tampil di halaman publik.</p>";
  }

  if (view === "ten") {
    h = '<div class="row"><h1 style="font-size:1.7rem">Penghuni</h1><button class="btn" data-add="ten">Tambah penghuni</button></div><div class="card">'
      + (TEN.length ? TEN.map(function (t) {
        var room = R(t.room);
        return '<div class="item"><div class="l"><b>' + esc(t.nama) + '</b>' + (room ? " · " + room.n : "") + '<p class="sub">' + esc(t.hp) + ' · Kontrak ' + fd(t.mulai) + ' sampai ' + fd(t.akhir) + '</p></div><div class="acts"><button class="btn alt sm" data-et="' + t.id + '">Ubah</button><button class="btn bad sm" data-dt="' + t.id + '">Akhiri kontrak</button></div></div>';
      }).join("") : '<div class="empty">Belum ada penghuni.</div>') + "</div>";
  }

  if (view === "iss") {
    h = '<h1 style="font-size:1.7rem">Keluhan</h1><div class="card">'
      + (ISS.length ? ISS.map(function (i) {
        var t = T(i.t);
        var room = t ? R(t.room) : null;
        return '<div class="item"><div class="l"><b>' + esc(i.j) + '</b><p class="sub">' + esc(i.d) + '</p><p class="sub">' + (t ? esc(t.nama) + (room ? " · " + room.n : "") + " · " : "") + i.tgl + '</p></div><label style="min-width:140px">Status<select data-is="' + i.id + '">' + ["Baru", "Diproses", "Selesai"].map(function (s) { return '<option' + (s === i.st ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select></label></div>";
      }).join("") : '<div class="empty">Tidak ada keluhan aktif.</div>') + "</div>";
  }

  if (view === "rep") {
    var rows = BILLS.filter(function (b) { return b.m === curM; });
    h = '<div class="row"><h1 style="font-size:1.7rem">Laporan keuangan</h1><div class="acts"><select id="repM" aria-label="Pilih bulan" style="width:auto">'
      + Object.keys(MON).map(function (m) { return '<option value="' + m + '"' + (m === curM ? " selected" : "") + ">" + MON[m] + "</option>"; }).join("")
      + '</select><button class="btn" id="pdf">Unduh PDF</button></div></div>'
      + '<div class="card" id="rep"><h2>Laporan Kosan Anwar · ' + (MON[curM] || curM) + '</h2><div class="sum"><div><b>' + rp(sumM(curM, true)) + '</b><span class="sub">total pemasukan</span></div><div><b>' + rp(sumM(curM, false)) + '</b><span class="sub">tunggakan</span></div><div><b>' + ROOMS.filter(function (r) { return r.st === "terisi"; }).length + " dari " + ROOMS.length + "</b><span class=\"sub\">kamar terisi</span></div></div>"
      + '<table><thead><tr><th>Penghuni</th><th>Kamar</th><th>Status</th><th class="n">Jumlah</th></tr></thead><tbody>'
      + rows.map(function (b) { var t = T(b.t); var room = t ? R(t.room) : null; return '<tr><td>' + (t ? esc(t.nama) : "-") + '</td><td>' + (room ? room.n : "-") + '</td><td>' + STL[b.st] + '</td><td class="n">' + rp(b.amt) + "</td></tr>"; }).join("")
      + "</tbody></table></div>";
  }

  $("#view").innerHTML = h;
}

// === Event Listeners ===
$("#tabs").addEventListener("click", function (e) {
  var b = e.target.closest("[data-v]");
  if (b) { view = b.dataset.v; render(); }
});

$("#view").addEventListener("change", function (e) {
  if (e.target.id === "repM") {
    repM = e.target.value;
    api("GET", "/api/bills?month=" + repM).then(function (d) { BILLS = d; render(); });
  }
  if (e.target.dataset.is !== undefined) {
    var issId = e.target.dataset.is;
    var newStatus = e.target.value;
    api("PATCH", "/api/issues/" + issId + "/status", { status: newStatus }).then(function (updated) {
      var idx = ISS.findIndex(function (x) { return x.id == issId; });
      if (idx >= 0) ISS[idx] = updated;
      toast("Status keluhan diperbarui: " + newStatus + ".");
    }).catch(function (err) { toast(err.message || "Gagal update status."); });
  }
});

$("#view").addEventListener("submit", function (e) {
  if (e.target.id === "fAnn") {
    e.preventDefault();
    api("POST", "/api/announcements", { title: $("#aJ").value.trim(), content: $("#aP").value.trim() })
      .then(function (ann) {
        ANN.unshift(ann);
        toast("Pengumuman dipublikasikan ke dashboard seluruh penghuni.");
        render();
      }).catch(function (err) { toast(err.message || "Gagal publikasi pengumuman."); });
  }
});

$("#view").addEventListener("click", function (e) {
  var d = e.target.closest("button"); if (!d) return; var ds = d.dataset;
  if (d.id === "pdf") { try { window.print(); } catch (x) { toast("Fitur cetak belum tersedia di pratinjau ini."); } }
  if (ds.slip) {
    var b = BILLS.find(function (x) { return x.id == ds.slip; });
    if (b && b.slip) { $("#slipBox").innerHTML = '<img src="' + esc(b.slip) + '" style="max-width:100%" alt="Bukti transfer">'; }
    else { $("#slipBox").innerHTML = '<p>Bukti belum diunggah.</p>'; }
    $("#dSlip").showModal();
  }
  if (ds.ok) {
    api("PATCH", "/api/bills/" + ds.ok + "/approve").then(function (updated) {
      var idx = BILLS.findIndex(function (x) { return x.id == ds.ok; });
      if (idx >= 0) BILLS[idx] = updated;
      toast("Pembayaran disetujui. Kuitansi digital diterbitkan.");
      render();
    }).catch(function (err) { toast(err.message || "Gagal menyetujui."); });
  }
  if (ds.no) {
    pendBill = ds.no;
    var t = T(BILLS.find(function (b) { return b.id == ds.no; })?.t);
    var room = t ? R(t.room) : null;
    $("#rS").textContent = (t ? t.nama : "-") + (room ? " · " + room.n : "");
    $("#fRej").reset(); $("#dRej").showModal();
  }
  if (ds.wa) { toast("Pengingat jatuh tempo dikirim ke WhatsApp " + (T(BILLS.find(function (b) { return b.id == ds.wa; })?.t)?.nama || "-") + " (simulasi)."); }
  if (ds.add === "room") { openRoom(null); } if (ds.er) { openRoom(+ds.er); }
  if (ds.add === "ten") { openTen(null); } if (ds.et) { openTen(+ds.et); }
  if (ds.dr) {
    var r = R(+ds.dr);
    ask("Hapus " + r.n + "?", r.st === "terisi" ? "Kamar masih terisi, akhiri kontrak penghuninya terlebih dahulu." : "Data kamar akan hilang dari halaman publik.", r.st === "terisi" ? null : function () {
      api("DELETE", "/api/rooms/" + r.id).then(function () {
        ROOMS = ROOMS.filter(function (x) { return x.id !== r.id; });
        toast(r.n + " dihapus.");
        render();
      }).catch(function (err) { toast(err.message || "Gagal hapus kamar."); });
    });
  }
  if (ds.dt) {
    var t2 = T(+ds.dt);
    ask("Akhiri kontrak " + t2.nama + "?", "Kamar " + (R(t2.room) ? R(t2.room).n : "") + " akan berstatus kosong dan tampil di halaman publik.", function () {
      api("DELETE", "/api/tenants/" + t2.id).then(function () {
        var room2 = R(t2.room);
        if (room2) room2.st = "kosong";
        TEN = TEN.filter(function (x) { return x.id !== t2.id; });
        toast("Kontrak diakhiri. Riwayat keuangan tetap tersimpan.");
        render();
      }).catch(function (err) { toast(err.message || "Gagal akhiri kontrak."); });
    });
  }
  if (ds.delAnn) {
    api("DELETE", "/api/announcements/" + ds.delAnn).then(function () {
      ANN = ANN.filter(function (a) { return a.id != ds.delAnn; });
      toast("Pengumuman dihapus.");
      render();
    }).catch(function (err) { toast(err.message || "Gagal hapus pengumuman."); });
  }
});

function ask(t, s, fn) { $("#delT").textContent = t; $("#delS").textContent = s; $("#delOk").classList.toggle("hidden", !fn); onDel = fn; $("#dDel").showModal(); }
$("#delOk").addEventListener("click", function () { if (onDel) onDel(); $("#dDel").close(); });

$("#fRej").addEventListener("submit", function (e) {
  e.preventDefault();
  api("PATCH", "/api/bills/" + pendBill + "/reject", { rejection_note: $("#rN").value.trim() })
    .then(function (updated) {
      var idx = BILLS.findIndex(function (x) { return x.id == pendBill; });
      if (idx >= 0) BILLS[idx] = updated;
      $("#dRej").close();
      toast("Bukti ditolak. Penghuni diminta unggah ulang.");
      render();
    }).catch(function (err) { toast(err.message || "Gagal menolak."); });
});

function openRoom(id) {
  editRoom = id;
  var r = id ? R(id) : { n: "Kamar " + (ROOMS.length + 1), p: 700000, sz: "", fl: 1, st: "kosong", f: [] };
  $("#roomT").textContent = id ? "Ubah " + r.n : "Tambah kamar";
  $("#kN").value = r.n; $("#kP").value = r.p; $("#kZ").value = r.sz; $("#kL").value = r.fl; $("#kS").value = r.st; $("#kF").value = (r.f || []).join(", ");
  $("#dRoom").showModal();
}
$("#fRoom").addEventListener("submit", function (e) {
  e.preventDefault();
  var o = { name: $("#kN").value.trim(), price: +$("#kP").value, size: $("#kZ").value.trim(), floor: +$("#kL").value, status: $("#kS").value, facilities: $("#kF").value.split(",").map(function (s) { return s.trim(); }).filter(Boolean), has_ac: $("#kF").value.toLowerCase().includes("ac") };
  var req = editRoom ? api("PATCH", "/api/rooms/" + editRoom, o) : api("POST", "/api/rooms", o);
  req.then(function (updated) {
    if (editRoom) { var idx = ROOMS.findIndex(function (x) { return x.id == editRoom; }); if (idx >= 0) ROOMS[idx] = updated; }
    else { ROOMS.push(updated); }
    $("#dRoom").close();
    toast("Data kamar tersimpan dan diperbarui di halaman publik.");
    render();
  }).catch(function (err) { toast(err.message || "Gagal simpan kamar."); });
});

function openTen(id) {
  editTen = id;
  var t = id ? T(id) : { nama: "", hp: "", room: 0, mulai: new Date().toISOString().slice(0, 10), akhir: "" };
  $("#tenT").textContent = id ? "Ubah penghuni" : "Tambah penghuni";
  var availableRooms = ROOMS.filter(function (r) { return r.st === "kosong" || (t && r.id === t.room); });
  $("#tR").innerHTML = availableRooms.map(function (r) { return '<option value="' + r.id + '"' + (t && r.id === t.room ? " selected" : "") + ">" + esc(r.n) + " · " + rp(r.p) + "</option>"; }).join("");
  $("#tN").value = t.nama; $("#tH").value = t.hp; $("#tM").value = t.mulai; $("#tA").value = t.akhir; $("#tE").classList.add("hidden"); $("#dTen").showModal();
}
$("#fTen").addEventListener("submit", function (e) {
  e.preventDefault();
  if ($("#tA").value <= $("#tM").value) { $("#tE").textContent = "Tanggal berakhir harus setelah tanggal mulai."; $("#tE").classList.remove("hidden"); return; }
  if (!$("#tR").value) { $("#tE").textContent = "Belum ada kamar kosong."; $("#tE").classList.remove("hidden"); return; }
  var o = { name: $("#tN").value.trim(), phone: $("#tH").value.trim(), room_id: +$("#tR").value, contract_start: $("#tM").value, contract_end: $("#tA").value };
  var req = editTen ? api("PATCH", "/api/tenants/" + editTen, o) : api("POST", "/api/tenants", o);
  req.then(function (updated) {
    if (editTen) { var idx = TEN.findIndex(function (x) { return x.id == editTen; }); if (idx >= 0) TEN[idx] = updated; }
    else {
      TEN.push(updated);
      if (updated.email) toast("Penghuni ditambahkan. Akun: " + updated.email + " / password: " + updated.password_default);
    }
    var newRoom = R(o.room_id); if (newRoom) newRoom.st = "terisi";
    $("#dTen").close();
    if (!editTen) toast("Data penghuni dan kontrak tersimpan.");
    render();
  }).catch(function (err) { $("#tE").textContent = err.message || "Gagal simpan penghuni."; $("#tE").classList.remove("hidden"); });
});

document.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", function () { b.closest("dialog").close(); }); });
document.querySelectorAll("dialog").forEach(function (d) { d.addEventListener("click", function (e) { if (e.target === d) d.close(); }); });

// === Auth Check & Login ===
function showOwnerApp() {
  $("#ownerLogin").classList.add("hidden");
  $("#ownerApp").classList.remove("hidden");
  var days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  var months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  var now = new Date();
  $("#ownerDate").textContent = days[now.getDay()] + ", " + now.getDate() + " " + months[now.getMonth()] + " " + now.getFullYear();
  loadAll().then(render);
}

$("#ownerOut").addEventListener("click", function () {
  fetch("/api/logout", { method: "POST", headers: { "X-CSRF-TOKEN": csrf(), "Accept": "application/json" }, credentials: "same-origin" })
    .finally(function () {
      ROOMS = []; TEN = []; BILLS = []; ISS = []; ANN = [];
      $("#ownerApp").classList.add("hidden");
      $("#ownerLogin").classList.remove("hidden");
    });
});

$("#ownerLform").addEventListener("submit", function (e) {
  e.preventDefault();
  var er = $("#oLerr");
  er.classList.add("hidden");
  api("POST", "/api/login", { email: $("#oEm").value.trim(), password: $("#oPw").value })
    .then(function (user) {
      if (user.role !== "owner") {
        er.textContent = "Akun ini bukan pemilik kost.";
        er.classList.remove("hidden");
        api("POST", "/api/logout");
        return;
      }
      showOwnerApp();
    }).catch(function (err) {
      er.textContent = err.message || "Email atau kata sandi salah.";
      er.classList.remove("hidden");
    });
});

// Auto-check apakah sudah login sebagai owner
api("GET", "/api/me")
  .then(function (user) {
    if (user.role === "owner") { showOwnerApp(); }
    else {
      api("POST", "/api/logout").finally(function () {
        $("#ownerLogin").classList.remove("hidden");
      });
    }
  })
  .catch(function () {
    $("#ownerLogin").classList.remove("hidden");
  });
