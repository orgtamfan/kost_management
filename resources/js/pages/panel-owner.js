// Data contoh. Nanti diganti data dari basis data.
var MON={"2026-09":"September 2026","2026-10":"Oktober 2026","2026-11":"November 2026"};
var ROOMS=[
{id:1,n:"Kamar 1",p:650000,sz:"3 × 3 m",fl:1,st:"kosong",f:["Kasur","Lemari","Kamar mandi dalam"]},
{id:2,n:"Kamar 2",p:850000,sz:"3 × 4 m",fl:1,st:"terisi",f:["Kasur","Lemari","AC"]},
{id:3,n:"Kamar 3",p:850000,sz:"3 × 4 m",fl:1,st:"terisi",f:["Kasur","Lemari","Meja belajar","AC"]},
{id:4,n:"Kamar 4",p:700000,sz:"3 × 3 m",fl:1,st:"terisi",f:["Kasur","Lemari","Kipas angin"]},
{id:5,n:"Kamar 5",p:700000,sz:"3 × 3 m",fl:2,st:"kosong",f:["Kasur","Lemari","Meja belajar"]},
{id:6,n:"Kamar 6",p:900000,sz:"3,5 × 4 m",fl:2,st:"kosong",f:["Kasur","Lemari","AC","Kamar mandi dalam"]},
{id:7,n:"Kamar 7",p:650000,sz:"3 × 3 m",fl:2,st:"terisi",f:["Kasur","Lemari","Kipas angin"]},
{id:8,n:"Kamar 8",p:750000,sz:"3 × 3,5 m",fl:2,st:"kosong",f:["Kasur","Lemari","Kamar mandi dalam"]}];
var TEN=[
{id:1,nama:"Budi Santoso",hp:"0812-1111-2222",room:2,mulai:"2026-03-01",akhir:"2027-02-28"},
{id:2,nama:"Rina Pratiwi",hp:"0813-3333-4444",room:3,mulai:"2026-08-01",akhir:"2027-07-31"},
{id:3,nama:"Dewi Lestari",hp:"0857-5555-6666",room:4,mulai:"2026-01-01",akhir:"2026-12-31"},
{id:4,nama:"Andi Saputra",hp:"0821-7777-8888",room:7,mulai:"2026-06-01",akhir:"2027-05-31"}];
var BILLS=[];
[1,2,3,4].forEach(function(t){["2026-09","2026-10"].forEach(function(m){BILLS.push({t:t,m:m,amt:rp0(t),st:"lunas"})})});
BILLS.push({t:1,m:"2026-11",amt:850000,st:"pending"},{t:2,m:"2026-11",amt:850000,st:"belum"},{t:3,m:"2026-11",amt:700000,st:"lunas"},{t:4,m:"2026-11",amt:650000,st:"pending"});
function rp0(t){return {1:850000,2:850000,3:700000,4:650000}[t]}
var ISS=[
{j:"Keran wastafel bocor",d:"Air menetes terus dari sambungan keran.",t:2,tgl:"20 Nov 2026",st:"Diproses"},
{j:"Pintu kamar sulit dikunci",d:"Kunci sering macet.",t:4,tgl:"22 Nov 2026",st:"Baru"},
{j:"Lampu kamar mandi mati",d:"Mati sejak awal bulan.",t:2,tgl:"4 Nov 2026",st:"Selesai"}];
var ANN=[{j:"Pemadaman listrik Sabtu, 28 November",p:"PLN menjadwalkan pemadaman pukul 09.00 sampai 13.00."}];
var STL={belum:"Belum dibayar",pending:"Menunggu verifikasi",lunas:"Lunas",ditolak:"Ditolak"};
var TABS=[["home","Ringkasan"],["bill","Pembayaran"],["room","Kamar"],["ten","Penghuni"],["iss","Keluhan"],["rep","Laporan"]];
var view="home",repM="2026-11",editRoom=null,editTen=null,pend=null,onDel=null;
var $=function(s){return document.querySelector(s)};
function rp(n){return "Rp"+n.toLocaleString("id-ID")}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function T(id){return TEN.filter(function(x){return x.id==id})[0]}
function R(id){return ROOMS.filter(function(x){return x.id==id})[0]}
function toast(t){var e=$("#toast");e.textContent=t;e.classList.remove("hidden");clearTimeout(toast.t);toast.t=setTimeout(function(){e.classList.add("hidden")},3000)}
function fd(s){var d=new Date(s+"T00:00:00");return d.toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})}
function nPend(){return BILLS.filter(function(b){return b.st==="pending"}).length}
function sumM(m,lunas){return BILLS.filter(function(b){return b.m===m&&((b.st==="lunas")===lunas)}).reduce(function(a,b){return a+b.amt},0)}

function render(){
 $("#tabs").innerHTML=TABS.map(function(t){return '<button data-v="'+t[0]+'" aria-current="'+(t[0]===view?"page":"false")+'">'+t[1]+(t[0]==="bill"&&nPend()?'<span class="dot">'+nPend()+'</span>':"")+'</button>'}).join("");
 var h="";
 if(view==="home"){
  var occ=ROOMS.filter(function(r){return r.st==="terisi"}).length,open=ISS.filter(function(i){return i.st!=="Selesai"}).length;
  h='<div class="stats"><div class="stat"><b>'+occ+' dari 8</b><span class="sub">kamar terisi</span></div><div class="stat"><b>'+rp(sumM("2026-11",true))+'</b><span class="sub">pemasukan November</span></div><div class="stat"><b>'+nPend()+'</b><span class="sub">bukti menunggu verifikasi</span></div><div class="stat"><b>'+open+'</b><span class="sub">keluhan belum selesai</span></div></div>'
  +'<div class="card"><h2>Status kamar</h2><div class="board">'+ROOMS.map(function(r){return '<div class="tg'+(r.st==="kosong"?"":" off")+'">'+r.id+'<small>'+(r.st==="kosong"?"Kosong":"Terisi")+'</small></div>'}).join("")+'</div></div>'
  +'<div class="card"><h2>Pengumuman untuk penghuni</h2><form id="fAnn" class="stack"><label>Judul<input id="aJ" required></label><label>Isi pengumuman<textarea id="aP" required></textarea></label><button class="btn" style="justify-self:start">Publikasikan</button></form>'
  +ANN.map(function(a){return '<div class="item"><div class="l"><b>'+esc(a.j)+'</b><p class="sub">'+esc(a.p)+'</p></div></div>'}).join("")+'</div>';
 }
 if(view==="bill"){
  var bs=BILLS.filter(function(b){return b.m==="2026-11"}).sort(function(a,b){return (b.st==="pending")-(a.st==="pending")});
  h='<div class="card"><h2>Tagihan November 2026</h2><p class="sub">Periksa bukti transfer, lalu setujui atau tolak dengan catatan.</p>'+bs.map(function(b){var t=T(b.t);
   return '<div class="item"><div class="l"><b>'+esc(t.nama)+'</b> · '+R(t.room).n+'<p class="sub">'+rp(b.amt)+(b.no?" · "+b.no:"")+(b.note?" · Catatan: "+esc(b.note):"")+'</p></div><span class="badge b-'+b.st+'">'+STL[b.st]+'</span>'
   +(b.st==="pending"?'<div class="acts"><button class="btn alt sm" data-slip="'+b.t+'">Lihat bukti</button><button class="btn sm" data-ok="'+b.t+'">Setujui</button><button class="btn bad sm" data-no="'+b.t+'">Tolak</button></div>':"")
   +(b.st==="belum"||b.st==="ditolak"?'<div class="acts"><button class="btn alt sm" data-wa="'+b.t+'">Ingatkan via WhatsApp</button></div>':"")+'</div>'}).join("")+'</div>';
 }
 if(view==="room"){
  h='<div class="row"><h1 style="font-size:1.7rem">Kamar</h1><button class="btn" data-add="room">Tambah kamar</button></div><div class="card">'+ROOMS.map(function(r){
   return '<div class="item"><div class="l"><b>'+esc(r.n)+'</b> · '+rp(r.p)+'<p class="sub">'+esc(r.sz)+' · Lantai '+r.fl+' · '+esc(r.f.join(", "))+'</p></div><span class="badge b-'+r.st+'">'+(r.st==="kosong"?"Kosong":"Terisi")+'</span><div class="acts"><button class="btn alt sm" data-er="'+r.id+'">Ubah</button><button class="btn bad sm" data-dr="'+r.id+'">Hapus</button></div></div>'}).join("")+'</div><p class="sub">Perubahan kamar langsung tampil di halaman publik untuk calon penghuni.</p>';
 }
 if(view==="ten"){
  h='<div class="row"><h1 style="font-size:1.7rem">Penghuni</h1><button class="btn" data-add="ten">Tambah penghuni</button></div><div class="card">'+(TEN.length?TEN.map(function(t){
   return '<div class="item"><div class="l"><b>'+esc(t.nama)+'</b> · '+R(t.room).n+'<p class="sub">'+esc(t.hp)+' · Kontrak '+fd(t.mulai)+' sampai '+fd(t.akhir)+'</p></div><div class="acts"><button class="btn alt sm" data-et="'+t.id+'">Ubah</button><button class="btn bad sm" data-dt="'+t.id+'">Akhiri kontrak</button></div></div>'}).join(""):'<div class="empty">Belum ada penghuni.</div>')+'</div>';
 }
 if(view==="iss"){
  h='<h1 style="font-size:1.7rem">Keluhan</h1><div class="card">'+ISS.map(function(i,ix){var t=T(i.t);
   return '<div class="item"><div class="l"><b>'+esc(i.j)+'</b><p class="sub">'+esc(i.d)+'</p><p class="sub">'+(t?esc(t.nama)+" · "+R(t.room).n:"")+' · '+i.tgl+'</p></div><label style="min-width:140px">Status<select data-is="'+ix+'">'+["Baru","Diproses","Selesai"].map(function(s){return '<option'+(s===i.st?" selected":"")+'>'+s+'</option>'}).join("")+'</select></label></div>'}).join("")+'</div>';
 }
 if(view==="rep"){
  var rows=BILLS.filter(function(b){return b.m===repM});
  h='<div class="row"><h1 style="font-size:1.7rem">Laporan keuangan</h1><div class="acts"><select id="repM" aria-label="Pilih bulan" style="width:auto">'+Object.keys(MON).map(function(m){return '<option value="'+m+'"'+(m===repM?" selected":"")+'>'+MON[m]+'</option>'}).join("")+'</select><button class="btn" id="pdf">Unduh PDF</button></div></div>'
  +'<div class="card" id="rep"><h2>Laporan Kosan Anwar · '+MON[repM]+'</h2><div class="sum"><div><b>'+rp(sumM(repM,true))+'</b><span class="sub">total pemasukan</span></div><div><b>'+rp(sumM(repM,false))+'</b><span class="sub">tunggakan</span></div><div><b>'+ROOMS.filter(function(r){return r.st==="terisi"}).length+' dari 8</b><span class="sub">kamar terisi</span></div></div>'
  +'<table><thead><tr><th>Penghuni</th><th>Kamar</th><th>Status</th><th class="n">Jumlah</th></tr></thead><tbody>'+rows.map(function(b){var t=T(b.t);return '<tr><td>'+esc(t.nama)+'</td><td>'+R(t.room).n+'</td><td>'+STL[b.st]+'</td><td class="n">'+rp(b.amt)+'</td></tr>'}).join("")+'</tbody></table></div>';
 }
 $("#view").innerHTML=h;
}

function slip(t){var x=T(t);return '<svg viewBox="0 0 320 220" width="100%" role="img" aria-label="Contoh bukti transfer"><rect width="320" height="220" fill="#fff"/><rect width="320" height="36" fill="#0E5A52"/><text x="14" y="24" fill="#fff" font-size="15" font-family="sans-serif">Transfer berhasil</text><text x="14" y="70" fill="#555" font-size="12" font-family="sans-serif">Ke: Anwar (BCA 1234567890)</text><text x="14" y="94" fill="#555" font-size="12" font-family="sans-serif">Dari: '+esc(x.nama)+'</text><text x="14" y="140" fill="#13211E" font-size="26" font-weight="700" font-family="sans-serif">'+rp(BILLS.filter(function(b){return b.t===t&&b.m==="2026-11"})[0].amt)+'</text><text x="14" y="200" fill="#999" font-size="11" font-family="sans-serif">Contoh tampilan. Foto asli dari penghuni tampil di sini.</text></svg>'}

$("#tabs").addEventListener("click",function(e){var b=e.target.closest("[data-v]");if(b){view=b.dataset.v;render()}});
$("#view").addEventListener("change",function(e){
 if(e.target.id==="repM"){repM=e.target.value;render()}
 if(e.target.dataset.is!==undefined){ISS[e.target.dataset.is].st=e.target.value;toast("Status keluhan diperbarui: "+e.target.value+".");render()}
});
$("#view").addEventListener("submit",function(e){
 if(e.target.id==="fAnn"){e.preventDefault();ANN.unshift({j:$("#aJ").value.trim(),p:$("#aP").value.trim()});toast("Pengumuman dipublikasikan ke dashboard seluruh penghuni.");render()}
});
$("#view").addEventListener("click",function(e){
 var d=e.target.closest("button");if(!d)return;var ds=d.dataset;
 if(d.id==="pdf"){try{window.print()}catch(x){toast("Fitur cetak belum tersedia di pratinjau ini.")}}
 if(ds.slip){$("#slipBox").innerHTML=slip(+ds.slip);$("#dSlip").showModal()}
 if(ds.ok){var b=BILLS.filter(function(x){return x.t==ds.ok&&x.m==="2026-11"})[0];b.st="lunas";b.no="KW/2026/11/00"+ds.ok;toast("Pembayaran disetujui. Kuitansi digital diterbitkan untuk "+T(b.t).nama+".");render()}
 if(ds.no){pend=+ds.no;$("#rS").textContent=T(pend).nama+" · "+R(T(pend).room).n;$("#fRej").reset();$("#dRej").showModal()}
 if(ds.wa){toast("Pengingat jatuh tempo dikirim ke WhatsApp "+T(+ds.wa).nama+" (simulasi).")}
 if(ds.add==="room"){openRoom(null)}if(ds.er){openRoom(+ds.er)}
 if(ds.add==="ten"){openTen(null)}if(ds.et){openTen(+ds.et)}
 if(ds.dr){var r=R(+ds.dr);ask("Hapus "+r.n+"?",r.st==="terisi"?"Kamar masih terisi, akhiri kontrak penghuninya terlebih dahulu.":"Data kamar akan hilang dari halaman publik.",r.st==="terisi"?null:function(){ROOMS.splice(ROOMS.indexOf(r),1);toast(r.n+" dihapus.")})}
 if(ds.dt){var t=T(+ds.dt);ask("Akhiri kontrak "+t.nama+"?","Kamar "+R(t.room).n+" akan berstatus kosong dan tampil di halaman publik.",function(){R(t.room).st="kosong";TEN.splice(TEN.indexOf(t),1);toast("Kontrak diakhiri. "+R(t.room).n+" kini kosong.")})}
});
function ask(t,s,fn){$("#delT").textContent=t;$("#delS").textContent=s;$("#delOk").classList.toggle("hidden",!fn);onDel=fn;$("#dDel").showModal()}
$("#delOk").addEventListener("click",function(){if(onDel)onDel();$("#dDel").close();render()});

$("#fRej").addEventListener("submit",function(e){e.preventDefault();var b=BILLS.filter(function(x){return x.t===pend&&x.m==="2026-11"})[0];b.st="ditolak";b.note=$("#rN").value.trim();$("#dRej").close();toast("Bukti ditolak. Penghuni menerima catatan dan diminta unggah ulang.");render()});

function openRoom(id){editRoom=id;var r=id?R(id):{n:"Kamar "+(ROOMS.length+1),p:700000,sz:"",fl:1,st:"kosong",f:[]};
 $("#roomT").textContent=id?"Ubah "+r.n:"Tambah kamar";$("#kN").value=r.n;$("#kP").value=r.p;$("#kZ").value=r.sz;$("#kL").value=r.fl;$("#kS").value=r.st;$("#kF").value=r.f.join(", ");$("#dRoom").showModal()}
$("#fRoom").addEventListener("submit",function(e){e.preventDefault();
 var o={n:$("#kN").value.trim(),p:+$("#kP").value,sz:$("#kZ").value.trim(),fl:+$("#kL").value,st:$("#kS").value,f:$("#kF").value.split(",").map(function(s){return s.trim()}).filter(Boolean)};
 if(editRoom){Object.assign(R(editRoom),o)}else{o.id=Math.max.apply(null,ROOMS.map(function(r){return r.id}))+1;ROOMS.push(o)}
 $("#dRoom").close();toast("Data kamar tersimpan dan diperbarui di halaman publik.");render()});

function openTen(id){editTen=id;var t=id?T(id):{nama:"",hp:"",room:0,mulai:"2026-12-01",akhir:"2027-11-30"};
 $("#tenT").textContent=id?"Ubah penghuni":"Tambah penghuni";
 $("#tR").innerHTML=ROOMS.filter(function(r){return r.st==="kosong"||r.id===t.room}).map(function(r){return '<option value="'+r.id+'"'+(r.id===t.room?" selected":"")+'>'+esc(r.n)+' · '+rp(r.p)+'</option>'}).join("");
 $("#tN").value=t.nama;$("#tH").value=t.hp;$("#tM").value=t.mulai;$("#tA").value=t.akhir;$("#tE").classList.add("hidden");$("#dTen").showModal()}
$("#fTen").addEventListener("submit",function(e){e.preventDefault();
 if($("#tA").value<=$("#tM").value){$("#tE").textContent="Tanggal berakhir harus setelah tanggal mulai.";$("#tE").classList.remove("hidden");return}
 if(!$("#tR").value){$("#tE").textContent="Belum ada kamar kosong. Tambah atau kosongkan kamar dulu.";$("#tE").classList.remove("hidden");return}
 var rid=+$("#tR").value,o={nama:$("#tN").value.trim(),hp:$("#tH").value.trim(),room:rid,mulai:$("#tM").value,akhir:$("#tA").value};
 if(editTen){var t=T(editTen);if(t.room!==rid){R(t.room).st="kosong"}Object.assign(t,o)}
 else{o.id=Math.max.apply(null,TEN.map(function(x){return x.id}).concat([0]))+1;TEN.push(o);BILLS.push({t:o.id,m:"2026-11",amt:R(rid).p,st:"belum"})}
 R(rid).st="terisi";$("#dTen").close();toast("Data penghuni dan kontrak tersimpan.");render()});

document.querySelectorAll("[data-close]").forEach(function(b){b.addEventListener("click",function(){b.closest("dialog").close()})});
document.querySelectorAll("dialog").forEach(function(d){d.addEventListener("click",function(e){if(e.target===d)d.close()})});
render();
